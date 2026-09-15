/**
 * Horizon Design System v2 - permission denied.
 *
 * Warning tone, not danger: nothing is broken and the reader did nothing wrong.
 * The copy names the action that was refused so the reader can tell whether to
 * sign in, switch account, or ask someone.
 */

import type { ReactNode } from 'react'

import { permissionMessage } from './feedback.logic'
import { FeedbackSurface, type FeedbackSurfaceProps } from './FeedbackSurface'

export interface PermissionStateProps extends Omit<
  FeedbackSurfaceProps,
  'tone' | 'headline' | 'children'
> {
  /** A verb phrase: "edit this article", "view these analytics". */
  deniedAction: string
  /** How to get access, when there is a way. */
  detail?: string
  children?: ReactNode
}

export function PermissionState({ deniedAction, detail, children, ...rest }: PermissionStateProps) {
  return (
    <FeedbackSurface
      tone="permission"
      headline={permissionMessage(deniedAction)}
      detail={detail}
      {...rest}
    >
      {children}
    </FeedbackSurface>
  )
}
