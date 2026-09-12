/**
 * Horizon Design System v2 - media entries.
 *
 * The overlays are absolutely positioned, so each one is mounted inside a real
 * `MediaFrame` rather than floated over the page.
 */

import { Box } from '@chakra-ui/react'

import {
  MediaError,
  MediaFrame,
  MediaPlaceholder,
  MediaRetry,
  ResponsiveImage,
  Text,
  useMediaState,
} from '../../index'
import { space } from '../../../theme/tokens'
import { useGallery } from '../GalleryContext'
import { BROKEN_IMAGE, PRESENT_IMAGE, SAMPLE_IMAGE_ALT } from '../content'
import { ReadOut, noop, type EntryRenderer } from './support'

const RATIO = '16 / 9'

function MediaFrameEntry({ state }: { readonly state: string }) {
  if (state === 'holding an image') {
    return (
      <MediaFrame aspectRatio={RATIO}>
        <Box
          as="img"
          src={PRESENT_IMAGE}
          alt={SAMPLE_IMAGE_ALT}
          position="absolute"
          inset={0}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </MediaFrame>
    )
  }

  return <MediaFrame aspectRatio={RATIO} />
}

function ResponsiveImageEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  if (state === 'always broken') {
    return (
      <ResponsiveImage
        aspectRatio={RATIO}
        src={BROKEN_IMAGE}
        alt={SAMPLE_IMAGE_ALT}
        task="the sample cover image"
        loading="eager"
      />
    )
  }

  if (state === 'decorative') {
    return (
      <ResponsiveImage
        aspectRatio={RATIO}
        src={gallery.image}
        decorative
        task="the sample decorative image"
        loading="eager"
      />
    )
  }

  return (
    <ResponsiveImage
      aspectRatio={RATIO}
      src={gallery.image}
      alt={SAMPLE_IMAGE_ALT}
      task="the sample cover image"
      absentCaption="Sample post"
      loading="eager"
    />
  )
}

function MediaPlaceholderEntry({ state }: { readonly state: string }) {
  const variant = state === 'loading' ? 'loading' : state === 'retrying' ? 'retrying' : 'absent'

  return (
    <MediaFrame aspectRatio={RATIO}>
      <MediaPlaceholder variant={variant} task="the sample cover image" caption="Sample post" />
    </MediaFrame>
  )
}

function MediaErrorEntry({ state }: { readonly state: string }) {
  return (
    <MediaFrame aspectRatio={RATIO}>
      <MediaError failedAction="load the sample cover image">
        {state === 'error with a retry' ? (
          <MediaRetry failedAction="load the sample cover image" onRetry={noop} />
        ) : null}
      </MediaError>
    </MediaFrame>
  )
}

function MediaRetryEntry({ state }: { readonly state: string }) {
  return (
    <MediaRetry
      failedAction="load the sample cover image"
      onRetry={noop}
      retrying={state === 'retrying'}
      attempt={state === 'retrying' ? 1 : 0}
      maxAttempts={2}
    />
  )
}

function UseMediaStateEntry() {
  const gallery = useGallery()
  const { state, onLoaded, onFailed, retry, retryOffered } = useMediaState({
    src: gallery.image,
    maxAttempts: 2,
  })

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <MediaFrame aspectRatio={RATIO}>
        {state.src ? (
          <Box
            as="img"
            key={`${state.src}#${state.attempt}`}
            src={state.src}
            alt={SAMPLE_IMAGE_ALT}
            position="absolute"
            inset={0}
            width="100%"
            height="100%"
            objectFit="cover"
            onLoad={onLoaded}
            onError={() => onFailed('The browser could not load the sample image.')}
          />
        ) : null}
      </MediaFrame>
      <ReadOut>
        {`status: ${state.status}\nattempt: ${state.attempt} of ${state.maxAttempts}\nretry offered: ${retryOffered}`}
      </ReadOut>
      <Text recipe="metadata">
        The element above is a plain `img`, which is the point: the machine runs without
        `ResponsiveImage`.
      </Text>
      <MediaRetry failedAction="load the sample image" onRetry={retry} />
    </Box>
  )
}

export const mediaEntries = {
  MediaFrame: MediaFrameEntry,
  ResponsiveImage: ResponsiveImageEntry,
  MediaPlaceholder: MediaPlaceholderEntry,
  MediaError: MediaErrorEntry,
  MediaRetry: MediaRetryEntry,
  useMediaState: UseMediaStateEntry,
} satisfies Record<string, EntryRenderer>
