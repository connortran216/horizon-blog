import { describe, expect, it, vi } from 'vitest'

import {
  createDecodeTask,
  runSourceResolution,
  type DecodableImage,
  type MediaSourceResolver,
} from './mediaResolution.logic'

const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('source resolution', () => {
  // Acceptance criterion 4.3.3: retry can request a fresh signed source, and it
  // does so through an injected resolver rather than by editing the URL.
  it('hands the resolver the attempt and the source that failed', async () => {
    const resolver = vi.fn<MediaSourceResolver>(async () => 'https://cdn/cover.jpg?sig=fresh')
    const onResolved = vi.fn()
    const onFailed = vi.fn()

    runSourceResolution({
      resolver,
      context: { attempt: 2, previousSrc: 'https://cdn/cover.jpg?sig=expired' },
      onResolved,
      onFailed,
    })
    await flush()

    expect(resolver).toHaveBeenCalledWith({
      attempt: 2,
      previousSrc: 'https://cdn/cover.jpg?sig=expired',
    })
    expect(onResolved).toHaveBeenCalledWith('https://cdn/cover.jpg?sig=fresh')
    expect(onFailed).not.toHaveBeenCalled()
  })

  it('trims the resolved source', async () => {
    const onResolved = vi.fn()

    runSourceResolution({
      resolver: async () => '  https://cdn/cover.jpg  ',
      context: { attempt: 1, previousSrc: null },
      onResolved,
      onFailed: () => {},
    })
    await flush()

    expect(onResolved).toHaveBeenCalledWith('https://cdn/cover.jpg')
  })

  it('treats an empty resolved source as a failure, not a new load', async () => {
    const onResolved = vi.fn()
    const onFailed = vi.fn()

    runSourceResolution({
      resolver: async () => '   ',
      context: { attempt: 1, previousSrc: null },
      onResolved,
      onFailed,
    })
    await flush()

    expect(onResolved).not.toHaveBeenCalled()
    expect(onFailed).toHaveBeenCalledTimes(1)
  })

  it('reports a rejected resolver', async () => {
    const onFailed = vi.fn()

    runSourceResolution({
      resolver: async () => {
        throw new Error('signing service unavailable')
      },
      context: { attempt: 1, previousSrc: null },
      onResolved: () => {},
      onFailed,
    })
    await flush()

    expect(onFailed).toHaveBeenCalledWith('signing service unavailable')
  })

  it('reports a resolver that throws synchronously', () => {
    const onFailed = vi.fn()

    runSourceResolution({
      resolver: (() => {
        throw new Error('no resolver configured')
      }) as unknown as MediaSourceResolver,
      context: { attempt: 1, previousSrc: null },
      onResolved: () => {},
      onFailed,
    })

    expect(onFailed).toHaveBeenCalledWith('no resolver configured')
  })

  it('drops the answer when the frame unmounted while it was in flight', async () => {
    const onResolved = vi.fn()
    const onFailed = vi.fn()

    const dispose = runSourceResolution({
      resolver: async () => 'https://cdn/late.jpg',
      context: { attempt: 1, previousSrc: null },
      onResolved,
      onFailed,
    })

    dispose()
    await flush()

    expect(onResolved).not.toHaveBeenCalled()
    expect(onFailed).not.toHaveBeenCalled()
  })

  it('drops a rejection that arrives after unmount', async () => {
    const onFailed = vi.fn()

    const dispose = runSourceResolution({
      resolver: async () => {
        throw new Error('too late')
      },
      context: { attempt: 1, previousSrc: null },
      onResolved: () => {},
      onFailed,
    })

    dispose()
    await flush()

    expect(onFailed).not.toHaveBeenCalled()
  })
})

describe('the decode task', () => {
  it('reports success once the image has decoded, not merely loaded', async () => {
    const onDecoded = vi.fn()
    const image: DecodableImage = { decode: async () => undefined }

    createDecodeTask({ image, onDecoded, onFailed: () => {} })
    expect(onDecoded).not.toHaveBeenCalled()

    await flush()
    expect(onDecoded).toHaveBeenCalledTimes(1)
  })

  it('reports a decode failure', async () => {
    const onFailed = vi.fn()

    createDecodeTask({
      image: {
        decode: async () => {
          throw new Error('corrupt image data')
        },
      },
      onDecoded: () => {},
      onFailed,
    })
    await flush()

    expect(onFailed).toHaveBeenCalledWith('corrupt image data')
  })

  it('never calls back after disposal', async () => {
    const onDecoded = vi.fn()
    const onFailed = vi.fn()

    const dispose = createDecodeTask({
      image: { decode: async () => undefined },
      onDecoded,
      onFailed,
    })

    dispose()
    await flush()

    expect(onDecoded).not.toHaveBeenCalled()
    expect(onFailed).not.toHaveBeenCalled()
  })

  it('resolves a cached image that finished before the handler was attached', () => {
    const onDecoded = vi.fn()

    createDecodeTask({
      image: { complete: true, naturalWidth: 1200 },
      onDecoded,
      onFailed: () => {},
    })

    expect(onDecoded).toHaveBeenCalledTimes(1)
  })

  it('treats a complete image with no intrinsic size as broken', () => {
    const onFailed = vi.fn()

    createDecodeTask({
      image: { complete: true, naturalWidth: 0 },
      onDecoded: () => {},
      onFailed,
    })

    expect(onFailed).toHaveBeenCalledTimes(1)
  })

  it('waits for the element events when the image is still in flight', () => {
    const onDecoded = vi.fn()
    const onFailed = vi.fn()

    createDecodeTask({ image: { complete: false }, onDecoded, onFailed })

    expect(onDecoded).not.toHaveBeenCalled()
    expect(onFailed).not.toHaveBeenCalled()
  })

  it('does nothing, safely, when there is no element yet', () => {
    const onDecoded = vi.fn()

    expect(() => createDecodeTask({ image: null, onDecoded, onFailed: () => {} })()).not.toThrow()
    expect(onDecoded).not.toHaveBeenCalled()
  })
})
