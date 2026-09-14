/**
 * Any URL the router does not recognise.
 *
 * `Routes.tsx` had no `path="*"`, so `/this-route-does-not-exist` matched
 * nothing and React Router rendered nothing: `main` measured 1440x679 with no
 * children and no text, between the navbar and the footer. A blank page is the
 * one async-or-error state the design contract rules out everywhere else, and
 * it is worse here than elsewhere because nothing on it is even wrong - there
 * is simply no message and no way back.
 *
 * The composition is the one a missing thing already uses: `MissingState` -
 * neutral, because a wrong URL is absence rather than failure, and it offers a
 * way onward rather than a retry that would fail identically - under a real
 * `h1`, so the document has a heading and the page announces what happened.
 */

import { FiArrowLeft } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

import {
  ActionLink,
  ContentContainer,
  Heading,
  MissingState,
  Section,
  Stack,
} from '../../../design-system'

/**
 * Name the address without printing it.
 *
 * The path is reader-supplied text and it goes into the DOM, so it is trimmed
 * to a length that cannot push the column wider and it is rendered as content
 * rather than as markup. React escapes it; the cap is about layout.
 */
const MAX_PATH_LENGTH = 80

export function requestedPathLabel(pathname: string): string {
  const path = pathname.trim()

  if (path.length === 0 || path === '/') {
    return 'that address'
  }

  return path.length > MAX_PATH_LENGTH ? `${path.slice(0, MAX_PATH_LENGTH)}…` : path
}

const NotFoundPage = () => {
  const { pathname } = useLocation()

  return (
    <ContentContainer width="prose">
      <Section>
        <Stack gap={6}>
          <Heading as="h1" recipe="pageTitle">
            This page is not here
          </Heading>

          <MissingState
            subject={requestedPathLabel(pathname)}
            detail="The link may be out of date, or the address may have a typo in it."
            align="start"
          >
            <Stack direction="row" gap={3} collapseAt="sm" alignItems="center">
              <ActionLink to="/" underline="hover" iconStart={<FiArrowLeft aria-hidden="true" />}>
                Go home
              </ActionLink>
              <ActionLink to="/blog" underline="hover">
                Browse blogs
              </ActionLink>
              <ActionLink to="/series" underline="hover">
                All series
              </ActionLink>
            </Stack>
          </MissingState>
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default NotFoundPage
