/**
 * Horizon Design System v2 - the cover image control.
 *
 * Choose a file, watch it upload, see it fail, remove it. It is the chrome
 * around the media upload the feature owns; this component never posts a file
 * and never builds a media URL.
 *
 * The state that makes this more than a file input is `blocked`. Media attaches
 * to a saved draft, so an author who has not saved once cannot upload yet. The
 * legacy editor discovers that by throwing at upload time ("Save draft first
 * before uploading images"); here it is a state with a sentence, shown before
 * the author picks a file rather than after.
 */

import { useRef, type ChangeEvent } from 'react'
import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import { FiAlertCircle, FiImage, FiUploadCloud } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Stack } from '../../components/layout'
import { Text } from '../../components/typography'
import { InlineLoading } from '../../components/feedback'
import { ResponsiveImage } from '../../components/media'
import { uploadState, type UploadStateInput } from './workspace.logic'

export interface MediaControlProps extends UploadStateInput {
  /** The current cover, when there is one. */
  src?: string | null
  /** Describes the image for readers. Required whenever `src` is set. */
  alt?: string
  /** MIME types the backend accepts. From the feature, never guessed here. */
  acceptedTypes?: readonly string[]
  onSelectFile?: (file: File) => void
  onRemove?: () => void
  onRetry?: () => void
  label?: string
  hint?: string
  /** The frame's ratio. Matches wherever the cover will be shown. */
  aspectRatio?: string
}

export function MediaControl({
  src,
  alt,
  acceptedTypes,
  onSelectFile,
  onRemove,
  onRetry,
  label = 'Cover image',
  hint = 'A clear image helps this piece find its reader.',
  aspectRatio = '16 / 9',
  ...stateInput
}: MediaControlProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const state = uploadState({ ...stateInput, hasMedia: Boolean(src) })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      onSelectFile?.(file)
    }

    // So the same file can be chosen again after a failure.
    event.target.value = ''
  }

  return (
    <Stack gap={3}>
      <Text recipe="metadata" as="p" color={componentTokens.field.label}>
        {label}
      </Text>
      <Text recipe="metadata">{hint}</Text>

      <Box position="relative">
        <ResponsiveImage
          aspectRatio={aspectRatio}
          src={src}
          {...(src && alt ? { alt } : { decorative: true as const })}
          task="the cover image"
          absentCaption="No cover image yet"
        />

        {state.status === 'uploading' ? (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            bg={componentTokens.overlay.scrim}
            color="text.onInverse"
            borderRadius={componentTokens.media.radius}
          >
            <InlineLoading task="your cover image" />
          </Flex>
        ) : null}
      </Box>

      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes?.join(',')}
          onChange={handleChange}
          disabled={!state.canChoose}
          aria-label={`Choose a ${label.toLowerCase()}`}
        />
      </VisuallyHidden>

      <Flex gap={space[2]} flexWrap="wrap">
        <Button
          tone="secondary"
          iconStart={<Box as={FiUploadCloud} aria-hidden="true" />}
          isDisabled={!state.canChoose}
          isLoading={state.status === 'uploading'}
          loadingLabel="Uploading your cover image"
          onClick={() => inputRef.current?.click()}
        >
          {src ? 'Replace image' : 'Choose an image'}
        </Button>

        {state.canRetry && onRetry !== undefined ? (
          <Button tone="quiet" onClick={onRetry}>
            Try the upload again
          </Button>
        ) : null}

        {state.canRemove && onRemove !== undefined ? (
          <Button tone="quiet" onClick={onRemove}>
            Remove image
          </Button>
        ) : null}
      </Flex>

      {/*
       * Every state says something. The failure states carry an icon as well,
       * because "Image is larger than 5MB" and "Image added" must not differ
       * only by the colour of the text around them.
       */}
      <Flex
        role={state.status === 'failed' || state.status === 'denied' ? 'alert' : 'status'}
        aria-live={state.status === 'failed' || state.status === 'denied' ? 'assertive' : 'polite'}
        align="flex-start"
        gap={space[2]}
        color={
          state.status === 'failed' || state.status === 'denied'
            ? componentTokens.field.invalidText
            : 'text.muted'
        }
      >
        <Box
          as={state.status === 'failed' || state.status === 'denied' ? FiAlertCircle : FiImage}
          aria-hidden="true"
          flexShrink={0}
          mt={space[1]}
        />
        <Text recipe="metadata" as="span" color="inherit">
          {state.label}
        </Text>
      </Flex>
    </Stack>
  )
}
