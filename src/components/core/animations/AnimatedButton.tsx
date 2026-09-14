import React, { useState } from 'react'
import { Button, ButtonProps, Box } from '@chakra-ui/react'
import { LinkProps } from 'react-router-dom'
import { componentTokens, duration, easing, transform, transitionFor } from '../../../theme/tokens'

/**
 * The ripple lives exactly as long as its animation. One source for both, so the
 * cleanup timer cannot drift away from the keyframes and leave a ripple behind.
 */
const RIPPLE_DURATION = duration.reveal
const RIPPLE_LIFETIME_MS = Number.parseFloat(RIPPLE_DURATION)

// ===== TYPES =====

interface RippleData {
  x: number
  y: number
  size: number
  id: number
}

interface AnimatedButtonProps extends ButtonProps {
  enableRipple?: boolean
}

// ===== MAIN COMPONENT =====

/**
 * Simplified AnimatedButton - following clean example pattern
 * - Chakra Box components for ripples (like the example)
 * - Simple onMouseDown trigger (instead of complex onClick)
 * - Pure CSS keyframes (like styled-jsx approach)
 * - Design system compliant (semantic tokens preserved)
 */
export const AnimatedButton = ({
  children,
  enableRipple = true,
  ...props
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<RippleData[]>([])

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableRipple) return

    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    }

    setRipples((prev) => [...prev, newRipple])

    // Clean up after animation completes (like example)
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== newRipple.id))
    }, RIPPLE_LIFETIME_MS)
  }

  return (
    <Button
      position="relative"
      overflow="hidden"
      onMouseDown={addRipple} // Simple trigger like example
      _hover={{
        transform: `translateY(${transform.hoverLift})`,
        boxShadow: 'lg',
      }}
      {...props} // All props pass through (RouterLink compatible)
    >
      {/* Ripple effects using Chakra Box (like example) */}
      {ripples.map((ripple) => (
        <Box
          key={ripple.id}
          position="absolute"
          borderRadius="50%"
          /*
           * The ripple is the label, spread out: `currentColor` follows whatever
           * the button's own `color` resolved to, so it stays visible on a solid
           * action fill and on a ghost button, in both themes, without naming a
           * colour here. A fixed white wash was invisible on the light cobalt
           * fill dark mode uses.
           */
          bg="currentColor"
          opacity={0.4}
          animation={`ripple ${RIPPLE_DURATION} ${easing.standard}`}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {children}

      {/* CSS keyframes injected globally */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </Button>
  )
}

// ===== CONVENIENCE WRAPPERS =====

/**
 * Primary variant - uses design system semantic tokens
 */
export const AnimatedPrimaryButton = ({
  variant = 'solid',
  ...props
}: AnimatedButtonProps & Partial<LinkProps>) => {
  const isSolidLike = variant === 'solid'

  return (
    <AnimatedButton
      variant={variant}
      fontWeight="semibold"
      transition={transitionFor('all', 'normal')}
      minW="0"
      w="auto"
      {...(isSolidLike
        ? {
            /*
             * The label colour is paired with the fill in the token table -
             * `control.solidFg` points at `text.onAction`, which is white in
             * light and near-black in dark. Naming `white` here broke that pair:
             * dark mode's `action.primary` is a light cobalt, and white on it
             * measures 2.38:1 against a 4.5 floor.
             */
            bg: componentTokens.control.solidBg,
            color: componentTokens.control.solidFg,
            _hover: { bg: componentTokens.control.solidHoverBg },
            _active: { bg: 'action.active' },
          }
        : {})}
      {...props}
    />
  )
}

/**
 * Ghost variant
 */
export const AnimatedGhostButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="ghost" {...props} />
)

/**
 * Outline variant
 */
export const AnimatedOutlineButton = (props: AnimatedButtonProps) => (
  <AnimatedButton variant="outline" {...props} />
)

export default AnimatedButton
