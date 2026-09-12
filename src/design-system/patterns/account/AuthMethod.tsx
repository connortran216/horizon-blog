/**
 * Horizon Design System v2 - a provider sign-in method.
 *
 * The button that hands the browser to an identity provider, plus the labelled
 * rule that separates it from the email form. It replaces the legacy
 * `GoogleAuthButton` and `AuthMethodDivider` as presentation.
 *
 * The OAuth contract is untouched, and the shape of this component is what
 * keeps that true:
 *
 * - There is no `scopes`, `consent` or `permissions` prop, and no code path
 *   that draws a provider's consent screen. A consent screen rendered by us
 *   would be an imitation of the provider's, which is the exact shape of a
 *   credential-phishing page.
 * - The destination is a `startUrl` the feature built, or an `onStart` handler
 *   the feature owns. This component never constructs a provider URL, never
 *   adds a parameter to one, and never reads or writes a token.
 * - It renders a real `button`, not a link styled as one, because leaving the
 *   site is a side effect of the feature's handler rather than a plain
 *   navigation the browser could pre-fetch or open in a background tab.
 */

import type { ReactElement } from 'react'
import { Box, VisuallyHidden } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Divider } from '../../components/surface'
import { authMethodState, type AuthMethodStateInput } from './auth.logic'

export interface AuthMethodProps extends AuthMethodStateInput {
  /** The provider, as the reader knows it: "Google". */
  provider: string
  /** The provider's own start URL, already built by the feature. */
  startUrl?: string
  /** Called before the handoff. Use it to set the redirecting state. */
  onStart?: () => void
  /** The provider's mark. Decorative - the label carries the meaning. */
  icon?: ReactElement
}

/**
 * `startUrl` is assigned to `window.location` rather than opened in a new tab.
 * An OAuth handoff that lands in a second tab loses the state the first tab is
 * holding, and the reader comes back to a callback that cannot be verified.
 */
export function AuthMethod({
  provider,
  startUrl,
  onStart,
  icon,
  isDisabled,
  isRedirecting,
}: AuthMethodProps) {
  const state = authMethodState(provider, { isDisabled, isRedirecting })

  const handleClick = () => {
    if (!state.canStart) {
      return
    }

    onStart?.()

    if (startUrl !== undefined) {
      window.location.assign(startUrl)
    }
  }

  return (
    <Button
      tone="secondary"
      size="md"
      width="100%"
      iconStart={icon}
      isDisabled={state.disabled}
      isLoading={state.isLoading}
      loadingLabel={state.announcement}
      onClick={handleClick}
    >
      Continue with {provider}
      {/*
       * The button leaves this site. Sighted readers infer that from the
       * provider's name and mark; this says it for everyone else, without
       * changing the button's own short accessible name.
       */}
      <VisuallyHidden> (you will continue on {provider})</VisuallyHidden>
    </Button>
  )
}

export interface AuthMethodSeparatorProps {
  /** The rule's label. "Or continue with email" on the production screens. */
  label?: string
}

/**
 * The rule between the provider methods and the email form.
 *
 * A labelled `Divider`, not a row of three boxes: the label is real text in a
 * real `separator`, so it is read once and in the right place rather than being
 * skipped as decoration or announced twice as two empty rules.
 */
export function AuthMethodSeparator({
  label = 'Or continue with email',
}: AuthMethodSeparatorProps) {
  return (
    <Box paddingBlock={space[1]}>
      <Divider label={label} />
    </Box>
  )
}
