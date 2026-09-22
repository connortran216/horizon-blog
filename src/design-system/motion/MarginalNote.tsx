import { useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { space } from '../../theme/tokens'
import { transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'
import { useRevealInView } from './useRevealInView'

export interface MarginalNoteProps {
  children: React.ReactNode
  className?: string
}

/** A local annotation reveal: one rule, one arrival, no ambient loop. */
export function MarginalNote({ children, className }: MarginalNoteProps) {
  const policy = useMotionPolicy()
  const ref = useRef<HTMLDivElement>(null)
  const revealed = useRevealInView(ref, { threshold: 0.25 })

  return (
    <Box ref={ref} className={className} position="relative" paddingInlineStart={space[6]}>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scaleY: policy.translation ? 0 : 1 }}
        animate={{ opacity: revealed ? 1 : 0, scaleY: revealed ? 1 : policy.translation ? 0 : 1 }}
        transition={transitionFor('reveal', policy)}
        style={{
          position: 'absolute',
          insetInlineStart: 0,
          insetBlock: 0,
          width: '2px',
          background: 'var(--chakra-colors-accent-lime)',
          transformOrigin: 'top center',
        }}
      />
      <motion.div
        initial={{ opacity: 0, x: policy.translation ? 14 : 0 }}
        animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : policy.translation ? 14 : 0 }}
        transition={transitionFor('reveal', policy)}
      >
        {children}
      </motion.div>
    </Box>
  )
}
