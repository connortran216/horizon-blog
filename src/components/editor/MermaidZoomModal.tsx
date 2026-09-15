/**
 * MermaidZoomModal - a diagram at a size you can read.
 *
 * mermaid still renders the diagram; this shows the SVG it produced, larger,
 * with a zoom control. The scale is behaviour rather than presentation, so the
 * three numbers below are not design values and stay as they are.
 *
 * The dialog is Chakra's. The design system has no dialog or modal primitive -
 * a known open gap, reported rather than worked around here - so the overlay,
 * content, header and close button are Chakra's, with v2 tokens for every value
 * they paint with. Everything inside the dialog is design-system.
 *
 * `DiagramFrame` was considered for the body and does not fit: it constrains
 * `svg` to `max-width: 100%`, which is exactly what a zoom view must not do,
 * and reaching through it with `sx` to undo that is the kind of override the
 * pattern exists to prevent.
 */

import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Box,
  Flex,
} from '@chakra-ui/react'
import { Button, Heading, Stack } from '../../design-system'
import { blur, componentTokens, space } from '../../theme/tokens'
import { sanitizeMermaidSvg } from './mermaid'

interface MermaidZoomModalProps {
  isOpen: boolean
  onClose: () => void
  svg: string | null
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

export const MermaidZoomModal: React.FC<MermaidZoomModalProps> = ({ isOpen, onClose, svg }) => {
  const [zoom, setZoom] = useState(1)
  const sanitizedSvg = sanitizeMermaidSvg(svg ?? '')
  const zoomPercentage = Math.round(zoom * 100)

  useEffect(() => {
    if (isOpen) {
      setZoom(1)
    }
  }, [isOpen, svg])

  const zoomIn = () => {
    setZoom((currentZoom) => Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP))
  }

  const zoomOut = () => {
    setZoom((currentZoom) => Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP))
  }

  const resetZoom = () => {
    setZoom(1)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalOverlay bg={componentTokens.overlay.scrim} backdropFilter={`blur(${blur.bloom})`} />
      <ModalContent bg="bg.page" color="text.primary">
        <ModalHeader borderBottomWidth="1px" borderBottomColor={componentTokens.card.border}>
          {/*
           * The controls wrap onto their own line rather than colliding with
           * the close button at 375px, and the reset button says the current
           * zoom out loud so the level is never carried by the diagram's size
           * alone.
           */}
          <Stack
            direction="row"
            collapseAt="sm"
            gap={3}
            justify="space-between"
            align={{ base: 'stretch', sm: 'center' }}
            // Clears the close button rather than sliding under it.
            paddingInlineEnd={space[12]}
          >
            <Heading recipe="cardTitle" as="h2">
              Mermaid diagram
            </Heading>
            <Flex gap={space[2]} flexWrap="wrap" align="center">
              <Button tone="secondary" size="sm" onClick={zoomOut} isDisabled={zoom <= MIN_ZOOM}>
                Zoom out
              </Button>
              <Button
                tone="secondary"
                size="sm"
                onClick={resetZoom}
                aria-label={`Diagram zoom is ${zoomPercentage} percent. Reset it to 100 percent.`}
              >
                {zoomPercentage}%
              </Button>
              <Button tone="secondary" size="sm" onClick={zoomIn} isDisabled={zoom >= MAX_ZOOM}>
                Zoom in
              </Button>
            </Flex>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody padding={{ base: space[3], md: space[6] }}>
          {/*
           * The viewport scrolls in both axes so a diagram wider than the
           * screen is reachable without the document itself moving sideways,
           * and it is focusable so that scrolling works from the keyboard.
           */}
          <Box
            className="mermaid-zoom-modal__viewport"
            tabIndex={0}
            role="group"
            aria-label="Mermaid diagram, scrollable"
          >
            <Box
              className="mermaid-zoom-modal__canvas"
              style={{ '--mermaid-zoom-scale': String(zoom) } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default MermaidZoomModal
