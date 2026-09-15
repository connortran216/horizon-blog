/**
 * The frame every route renders inside.
 *
 * `AppFrame` owns the canvas, the viewport height and the skip link; the header,
 * the main region and the footer are composed here. The skip link has to be the
 * first focusable element in the document, which is why it belongs to the frame
 * and not to the navigation.
 *
 * `main` carries the id the skip link points at and `tabIndex={-1}` so it can
 * receive focus when the link is followed - a fragment jump moves the viewport
 * but not the keyboard unless the target is focusable, which is the whole
 * reason the link exists.
 */

import { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

import { AppFrame } from '../../design-system'
import Navbar from './Navbar'
import Footer from './Footer'

/** Shared with `AppFrame`'s skip link; the two must not drift. */
export const MAIN_CONTENT_ID = 'main-content'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <AppFrame skipToId={MAIN_CONTENT_ID}>
      <Navbar />
      <Box as="main" id={MAIN_CONTENT_ID} tabIndex={-1} flex="1">
        {children}
      </Box>
      <Footer />
    </AppFrame>
  )
}

export default AppLayout
