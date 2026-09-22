import { useEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { space } from '../../theme/tokens'
import { transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface TimelineEntryProps {
  children: React.ReactNode
  className?: string
}

/** Screen-only timeline emphasis. Print receives the complete static content. */
export function TimelineEntry({ children, className }: TimelineEntryProps) {
  const policy = useMotionPolicy()
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = inView || focused

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || ref.current === null) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '-30% 0px -45%',
      threshold: 0.1,
    })
    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      className={className}
      tabIndex={0}
      position="relative"
      paddingInlineStart={space[6]}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '2px' }}
      sx={{ '@media print': { paddingInlineStart: 0, outline: 'none' } }}
    >
      <Box
        aria-hidden="true"
        position="absolute"
        insetInlineStart={0}
        insetBlock={0}
        width="2px"
        bg="border.subtle"
        sx={{ '@media print': { display: 'none' } }}
      >
        <motion.div
          data-timeline-marker={active ? 'active' : 'idle'}
          initial={false}
          animate={{ opacity: active ? 1 : 0.3, scaleY: active ? 1 : policy.translation ? 0.3 : 1 }}
          transition={transitionFor('navigation', policy)}
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--chakra-colors-action-primary)',
            transformOrigin: 'top center',
          }}
        />
      </Box>
      {children}
    </Box>
  )
}
