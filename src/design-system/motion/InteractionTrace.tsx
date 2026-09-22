import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface InteractionTraceProps {
  children: React.ReactNode
  active?: boolean
  width?: string
}

/** Hover/focus feedback around a real control. It never handles activation. */
export function InteractionTrace({
  children,
  active = false,
  width = '100%',
}: InteractionTraceProps) {
  const policy = useMotionPolicy()
  const [engaged, setEngaged] = useState(false)
  const visible = active || engaged

  return (
    <Box
      position="relative"
      width={width}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false)
      }}
    >
      {children}
      <motion.div
        aria-hidden="true"
        data-interaction-trace={visible ? 'active' : 'idle'}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, scaleX: visible ? 1 : policy.translation ? 0 : 1 }}
        transition={transitionFor('normal', policy)}
        style={{
          position: 'absolute',
          insetInline: 0,
          insetBlockEnd: '-2px',
          height: '2px',
          background: 'var(--chakra-colors-action-primary)',
          pointerEvents: 'none',
          transformOrigin: 'left center',
        }}
      />
    </Box>
  )
}
