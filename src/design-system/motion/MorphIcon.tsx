import { useEffect, useRef } from 'react'
import { MorphIcon as MorphiconsIcon, type MorphHandle } from 'morphicons/react'

import { useMotionPolicy } from './useMotionPolicy'

const paths = {
  copy: 'M9 9h12v12H9ZM5 15H3V3h12v2',
  check: 'M4 12l5 5L20 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
} as const

export interface MorphIconProps {
  readonly name: keyof typeof paths
  readonly size?: number | string
}

/** Decorative state feedback. The containing action owns its accessible name. */
export function MorphIcon({ name, size = '1em' }: MorphIconProps) {
  const { reduced } = useMotionPolicy()
  const controller = useRef<MorphHandle>(null)
  const icon = paths[name]

  useEffect(() => {
    // Changing the library preference alone does not cancel a running spring.
    if (reduced) controller.current?.set(icon)
  }, [icon, reduced])

  return (
    <MorphiconsIcon
      ref={controller}
      icon={icon}
      size={size}
      spring="snappy"
      reducedMotion={reduced ? 'always' : 'never'}
      aria-hidden="true"
      focusable="false"
      data-morph-icon={name}
      style={{ flexShrink: 0, verticalAlign: 'middle' }}
    />
  )
}
