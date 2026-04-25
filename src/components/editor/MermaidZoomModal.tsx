import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
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
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg="bg.page" color="text.primary">
        <ModalHeader borderBottomWidth="1px" borderColor="border.subtle" pr="4rem">
          <HStack justify="space-between" spacing={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="700">
              Mermaid diagram
            </Text>
            <ButtonGroup size="sm" variant="outline" spacing={2}>
              <Button onClick={zoomOut} isDisabled={zoom <= MIN_ZOOM}>
                Zoom out
              </Button>
              <Button onClick={resetZoom}>{Math.round(zoom * 100)}%</Button>
              <Button onClick={zoomIn} isDisabled={zoom >= MAX_ZOOM}>
                Zoom in
              </Button>
            </ButtonGroup>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={{ base: 3, md: 6 }}>
          <Box className="mermaid-zoom-modal__viewport">
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
