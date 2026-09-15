/**
 * The sign-in celebration, behind the motion policy.
 *
 * A successful sign-in throws a full-screen particle burst. The moment is kept
 * deliberately - it is the one place this product celebrates anything - but it
 * is exactly the sort of thing `prefers-reduced-motion` exists for: two dozen
 * elements travelling and rotating across the whole viewport, over content the
 * reader is about to be navigated to.
 *
 * So the burst is gated here rather than inside the animation. Under reduced
 * motion nothing runs at all: the dynamic import is never issued, so the legacy
 * `ParticleSystem` chunk is not even fetched, no container is appended to the
 * document and no React root is created. That is stronger than an animation
 * that plays with zero duration, and it is the reason this is a function rather
 * than a prop on the burst itself.
 *
 * The preference is read once, by `useMotionPolicy`, at the page that calls
 * this. Nothing here touches `matchMedia`.
 */

import type { MotionPolicy } from '../../design-system'

/** The slice of the legacy module this uses. Nothing else is reachable. */
export interface SuccessBurstModule {
  readonly particleSystem: {
    showSuccessParticles(position?: { x: number; y: number }): void
  }
}

export type LoadSuccessBurst = () => Promise<SuccessBurstModule>

/**
 * Lazily loaded, so a page that never signs anybody in never pays for it, and
 * injectable, so the gate can be proven without a DOM or a renderer.
 */
const loadParticleSystem: LoadSuccessBurst = () =>
  import('../../components/core/animations/ParticleSystem')

/**
 * Whether a celebration may play.
 *
 * Both flags are checked rather than only `reduced`: the burst is pure
 * translation, and `translation` is the policy's own name for the thing it
 * does. A future policy that stops travel for some other reason stops this too,
 * without an edit here.
 */
export function celebrationAllowed(policy: MotionPolicy): boolean {
  return !policy.reduced && policy.translation
}

/**
 * Play the sign-in burst if the policy allows it. Resolves to whether it ran,
 * which is what a test asserts on.
 */
export async function playSuccessBurst(
  policy: MotionPolicy,
  load: LoadSuccessBurst = loadParticleSystem,
): Promise<boolean> {
  if (!celebrationAllowed(policy)) {
    return false
  }

  const { particleSystem } = await load()
  particleSystem.showSuccessParticles()

  return true
}
