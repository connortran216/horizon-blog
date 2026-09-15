import { describe, expect, it, vi } from 'vitest'

import {
  createDisposerBag,
  guardAsync,
  observeOnce,
  scheduleFrame,
  scheduleTimer,
  type IntersectionEntryLike,
  type IntersectionObserverFactory,
  type IntersectionObserverLike,
} from './lifecycle.logic'

describe('the disposer bag', () => {
  // Acceptance criterion 4.1.3: timers, observers and animation frames clean
  // up. This is the proof - every registered disposer runs on dispose.
  it('runs every registered disposer exactly once', () => {
    const bag = createDisposerBag()
    const first = vi.fn()
    const second = vi.fn()
    const third = vi.fn()

    bag.add(first)
    bag.add(second)
    bag.add(third)
    expect(bag.size).toBe(3)

    bag.dispose()

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(third).toHaveBeenCalledTimes(1)
    expect(bag.size).toBe(0)
    expect(bag.disposed).toBe(true)
  })

  it('tears down in reverse registration order', () => {
    const bag = createDisposerBag()
    const order: string[] = []

    bag.add(() => order.push('outer'))
    bag.add(() => order.push('inner'))
    bag.dispose()

    expect(order).toEqual(['inner', 'outer'])
  })

  it('is idempotent - a second dispose does not re-run anything', () => {
    const bag = createDisposerBag()
    const disposer = vi.fn()

    bag.add(disposer)
    bag.dispose()
    bag.dispose()

    expect(disposer).toHaveBeenCalledTimes(1)
  })

  it('lets one subscription be removed without disposing the bag', () => {
    const bag = createDisposerBag()
    const kept = vi.fn()
    const dropped = vi.fn()

    bag.add(kept)
    const removeDropped = bag.add(dropped)

    removeDropped()
    expect(dropped).toHaveBeenCalledTimes(1)
    expect(kept).not.toHaveBeenCalled()
    expect(bag.size).toBe(1)

    removeDropped()
    expect(dropped).toHaveBeenCalledTimes(1)

    bag.dispose()
    expect(kept).toHaveBeenCalledTimes(1)
  })

  it('disposes immediately when something registers after unmount', () => {
    const bag = createDisposerBag()
    const late = vi.fn()

    bag.dispose()
    bag.add(late)

    expect(late).toHaveBeenCalledTimes(1)
    expect(bag.size).toBe(0)
  })
})

interface FakeObserver extends IntersectionObserverLike {
  readonly disconnected: () => number
  readonly observed: () => unknown[]
  emit(entries: IntersectionEntryLike[]): void
}

const fakeObserverFactory = () => {
  let instance: FakeObserver | null = null

  const createObserver: IntersectionObserverFactory = (callback) => {
    let disconnects = 0
    const observed: unknown[] = []

    const observer: FakeObserver = {
      observe: (element) => observed.push(element),
      unobserve: () => {},
      disconnect: () => {
        disconnects += 1
      },
      disconnected: () => disconnects,
      observed: () => observed,
      emit: (entries) => callback(entries),
    }

    instance = observer

    return observer
  }

  return { createObserver, get: () => instance as FakeObserver }
}

describe('observeOnce', () => {
  it('reveals on the first intersection and disconnects itself', () => {
    const factory = fakeObserverFactory()
    const onReveal = vi.fn()
    const element = { id: 'card' }

    const dispose = observeOnce({
      createObserver: factory.createObserver,
      element,
      onReveal,
      rootMargin: '-10%',
    })

    expect(factory.get().observed()).toEqual([element])

    factory.get().emit([{ isIntersecting: false }])
    expect(onReveal).not.toHaveBeenCalled()

    factory.get().emit([{ isIntersecting: true }])
    expect(onReveal).toHaveBeenCalledTimes(1)
    expect(factory.get().disconnected()).toBe(1)

    // A second intersection after the reveal must not re-fire.
    factory.get().emit([{ isIntersecting: true }])
    expect(onReveal).toHaveBeenCalledTimes(1)

    // Disposing after a reveal is a no-op, not a second disconnect.
    dispose()
    expect(factory.get().disconnected()).toBe(1)
  })

  it('disconnects on unmount when the element never appeared', () => {
    const factory = fakeObserverFactory()
    const onReveal = vi.fn()

    const dispose = observeOnce({
      createObserver: factory.createObserver,
      element: {},
      onReveal,
    })

    dispose()
    dispose()

    expect(factory.get().disconnected()).toBe(1)
    expect(onReveal).not.toHaveBeenCalled()
  })

  it('reveals immediately rather than leaving a surface blank', () => {
    const onReveal = vi.fn()

    observeOnce({ createObserver: null, element: {}, onReveal })
    expect(onReveal).toHaveBeenCalledTimes(1)

    const factory = fakeObserverFactory()
    observeOnce({ createObserver: factory.createObserver, element: null, onReveal })
    expect(onReveal).toHaveBeenCalledTimes(2)
  })
})

describe('frames and timers', () => {
  const fakeFrames = () => {
    const callbacks = new Map<number, () => void>()
    let next = 1

    return {
      scheduler: {
        request: (callback: () => void) => {
          const handle = next++
          callbacks.set(handle, callback)

          return handle
        },
        cancel: (handle: number) => callbacks.delete(handle),
      },
      run: () => callbacks.forEach((callback) => callback()),
      pending: () => callbacks.size,
    }
  }

  it('cancels the frame and never calls back after disposal', () => {
    const frames = fakeFrames()
    const callback = vi.fn()

    const dispose = scheduleFrame(frames.scheduler, callback)
    dispose()

    expect(frames.pending()).toBe(0)

    frames.run()
    expect(callback).not.toHaveBeenCalled()
  })

  it('runs the frame callback when it is not disposed', () => {
    const frames = fakeFrames()
    const callback = vi.fn()

    scheduleFrame(frames.scheduler, callback)
    frames.run()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('clears the timer and never calls back after disposal', () => {
    const callbacks = new Map<number, () => void>()
    let next = 1
    const scheduler = {
      set: (callback: () => void) => {
        const handle = next++
        callbacks.set(handle, callback)

        return handle
      },
      clear: (handle: number) => callbacks.delete(handle),
    }
    const callback = vi.fn()

    const dispose = scheduleTimer(scheduler, callback, 200)
    dispose()

    expect(callbacks.size).toBe(0)
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('guardAsync', () => {
  it('delivers the value when the owner is still mounted', async () => {
    const onResolved = vi.fn()
    const onRejected = vi.fn()

    guardAsync(Promise.resolve('signed-url'), { onResolved, onRejected })
    await Promise.resolve()

    expect(onResolved).toHaveBeenCalledWith('signed-url')
    expect(onRejected).not.toHaveBeenCalled()
  })

  it('drops a settlement that arrives after disposal', async () => {
    const onResolved = vi.fn()
    const onRejected = vi.fn()

    const dispose = guardAsync(Promise.resolve('late'), { onResolved, onRejected })
    dispose()
    await Promise.resolve()

    expect(onResolved).not.toHaveBeenCalled()
    expect(onRejected).not.toHaveBeenCalled()
  })

  it('drops a rejection that arrives after disposal', async () => {
    const onRejected = vi.fn()

    const dispose = guardAsync(Promise.reject(new Error('expired')), {
      onResolved: () => {},
      onRejected,
    })
    dispose()
    await Promise.resolve()
    await Promise.resolve()

    expect(onRejected).not.toHaveBeenCalled()
  })
})
