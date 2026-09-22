import { motion } from 'framer-motion'

import { space } from '../../theme/tokens'
import { transitionFor } from './policy.logic'
import { useMotionPolicy } from './useMotionPolicy'

export interface StateHandoffProps {
  stateKey: string
  children: React.ReactNode
}

/** Immediate content swap with a decorative trace that acknowledges the handoff. */
export function StateHandoff({ stateKey, children }: StateHandoffProps) {
  const policy = useMotionPolicy()

  return (
    <div data-state-handoff={stateKey}>
      <div
        aria-hidden="true"
        style={{ height: '2px', marginBlockEnd: space[3], overflow: 'hidden' }}
      >
        <motion.div
          key={stateKey}
          initial={{ opacity: 0, scaleX: policy.translation ? 0 : 1 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={transitionFor('normal', policy)}
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--chakra-colors-action-primary)',
            transformOrigin: 'left center',
          }}
        />
      </div>
      {children}
    </div>
  )
}
