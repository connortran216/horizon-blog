/**
 * Horizon Design System v2 - the post cover's client-side navigation.
 *
 * `PostCard`, `FeaturedStory` and `SignatureStory` link to a post through an
 * ordinary `ActionLink` - a real `<a>`, so middle-click, Cmd/Ctrl-click and
 * "copy link address" all keep working. This hook only changes what happens
 * on the plain click a reader actually uses to read the post: it runs the
 * same navigation inside a view transition, so a cover carrying a matching
 * `viewTransitionName` (see `postCoverTransitionName`) can morph into the
 * article instead of the page just swapping.
 *
 * It composes with `ActionLink` rather than reaching into it. React Router's
 * own `<Link>` already calls a caller-supplied `onClick` before its internal
 * navigation and skips that navigation once the event arrives
 * `defaultPrevented` - that is the supported extension point, and it is why
 * `ActionLink` itself needed no change: this hook's handler is just another
 * `onClick`, gated by `isPlainRouterClick` so a modified or already-handled
 * click reaches the browser's own anchor behaviour untouched.
 *
 * `flushSync` is required, not decorative: `document.startViewTransition`
 * needs the DOM to already be in its "after" state by the time its callback
 * returns, and a plain `navigate()` only schedules that update for React's
 * next batched render. Everything this wraps - no View Transitions API,
 * `prefers-reduced-motion`, a transition the browser refuses - is already
 * `useViewTransition`'s own safe fallback: the navigation still happens
 * exactly once, immediately, with no animation.
 */

import { useCallback, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import { isPlainRouterClick, useViewTransition } from '../../motion'

/**
 * `href` is the post's own route. Pass `null` to leave the link's default
 * anchor behaviour completely alone - the case where there is no
 * `viewTransitionName` in play and so nothing for a transition to do.
 */
export function useCoverTransitionNavigate(
  href: string | null,
): (event: MouseEvent<HTMLAnchorElement>) => void {
  const navigate = useNavigate()
  const runTransition = useViewTransition()

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (href === null || !isPlainRouterClick(event)) {
        return
      }

      event.preventDefault()
      runTransition(() => {
        flushSync(() => navigate(href))
      })
    },
    [href, navigate, runTransition],
  )
}
