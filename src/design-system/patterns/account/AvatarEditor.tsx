/**
 * Horizon Design System v2 - the avatar and its editor.
 *
 * `Avatar` is the read-only portrait; `AvatarEditor` wraps it with the controls
 * the owner gets. They are separate because the portrait appears in a dozen
 * places that must not offer a file picker.
 *
 * The failure this component exists for is the one the legacy profile handles
 * least well: an avatar URL that no longer resolves. A broken `img` collapses
 * to alt text and a border, which on a circular 132px frame reads as a layout
 * bug. Here the frame is fixed by `MediaFrame`, and a source that fails falls
 * back to initials in the same circle - the same size, the same position, and
 * still a name.
 */

import { useRef, type ChangeEvent } from 'react'
import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import { FiCamera, FiUser } from 'react-icons/fi'

import { componentTokens, palette, radii, space, transitionFor } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Stack } from '../../components/layout'
import { Text } from '../../components/typography'
import { InlineLoading } from '../../components/feedback'
import { ResponsiveImage } from '../../components/media'
import { avatarEditorState, avatarInitials, type AvatarEditorStateInput } from './identity.logic'

export type AvatarSize = 'sm' | 'md' | 'lg'

/**
 * Three sizes off the spacing scale. `lg` is the profile header portrait, `md`
 * the workspace author chip, `sm` an inline byline. None of them is a raw px
 * value, so retuning the scale moves all three together.
 */
const avatarSizes: Record<AvatarSize, string> = {
  sm: space[8],
  md: space[12],
  lg: space[24],
}

export interface AvatarProps {
  /** The person's name. Required: it is the alt text and the initials source. */
  name: string
  src?: string | null
  size?: AvatarSize
  /** Force the fallback even though a source exists - a failed load upstream. */
  hasFailed?: boolean
}

/**
 * A circular portrait that always fills its circle.
 *
 * The image is `ResponsiveImage` at a 1:1 ratio, so it runs the same state
 * machine as every other image in the system: absent, loading, ready, error,
 * retrying. A retry control would be wrong at this size, so the failure state
 * degrades to initials instead of offering one.
 */
export function Avatar({ name, src, size = 'md', hasFailed = false }: AvatarProps) {
  const dimension = avatarSizes[size]
  const initials = avatarInitials(name)
  const showsImage = Boolean(src) && !hasFailed

  if (showsImage && src) {
    return (
      <Box
        width={dimension}
        height={dimension}
        borderRadius={radii.tag}
        overflow="hidden"
        flexShrink={0}
      >
        <ResponsiveImage
          aspectRatio="1 / 1"
          radius="tag"
          src={src}
          alt={`${name}'s profile picture`}
          task="the profile picture"
          loading="lazy"
        />
      </Box>
    )
  }

  return (
    <Flex
      align="center"
      justify="center"
      width={dimension}
      height={dimension}
      flexShrink={0}
      borderRadius={radii.tag}
      bg={componentTokens.media.placeholderBg}
      color="text.secondary"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={componentTokens.card.border}
    >
      {initials.length > 0 ? (
        <Text recipe="body" as="span" aria-hidden="true" fontWeight="semibold">
          {initials}
        </Text>
      ) : (
        <Box as={FiUser} aria-hidden="true" />
      )}
      {/*
       * The initials are decoration - two letters read aloud are noise. The
       * name is the accessible content, and it is here in both branches so a
       * missing picture never means a missing person.
       */}
      <VisuallyHidden>{name}</VisuallyHidden>
    </Flex>
  )
}

export interface AvatarEditorProps extends AvatarEditorStateInput {
  name: string
  src?: string | null
  /** MIME types the backend accepts, for the file input's own filter. */
  acceptedTypes?: readonly string[]
  /** Receives the chosen file. Validation and upload stay with the caller. */
  onSelectFile?: (file: File) => void
  /** Re-request a source that failed to render. */
  onReloadImage?: () => void
  /** The caption under the portrait. "Profile image" on the production screen. */
  caption?: string
  /** The workspace uses a full-bleed square portrait; other contexts stay compact. */
  presentation?: 'standard' | 'workspace'
}

/**
 * The owner's avatar controls.
 *
 * The file input is a real `input[type=file]`, kept in the accessibility tree
 * and visually hidden rather than `display: none` - a hidden-by-display input
 * is unreachable by keyboard, and the legacy profile drives its input from a
 * menu for exactly that reason. Here the visible `Button` and the input are the
 * same control: the button is a `label`-shaped trigger that forwards its click,
 * and the input keeps its own accessible name.
 */
export function AvatarEditor({
  name,
  src,
  acceptedTypes,
  onSelectFile,
  onReloadImage,
  caption = 'Profile image',
  presentation = 'standard',
  isUploading,
  uploadError,
  imageFailed,
  isDisabled,
}: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const state = avatarEditorState({
    hasSource: Boolean(src),
    isUploading,
    uploadError,
    imageFailed,
    isDisabled,
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      onSelectFile?.(file)
    }

    // Clearing the value lets the same file be chosen twice in a row, which is
    // exactly what someone does after a failed upload.
    event.target.value = ''
  }

  const fileInput = (
    <VisuallyHidden>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes?.join(',')}
        onChange={handleChange}
        disabled={!state.canChoose}
        aria-label={`Choose a new profile picture for ${name}`}
      />
    </VisuallyHidden>
  )

  if (presentation === 'workspace') {
    return (
      <Stack gap={3} alignItems="stretch">
        <Box
          position="relative"
          width="100%"
          aspectRatio="1 / 1"
          borderRadius={radii.card}
          overflow="hidden"
          bg={componentTokens.media.placeholderBg}
          borderWidth="1px"
          borderStyle="solid"
          borderColor={componentTokens.card.border}
        >
          {src && !state.showsFallback ? (
            <ResponsiveImage
              aspectRatio="1 / 1"
              radius="container"
              src={src}
              alt={`${name}'s profile picture`}
              task="the profile picture"
              loading="lazy"
            />
          ) : (
            <Flex
              position="absolute"
              inset={0}
              align="center"
              justify="center"
              color="text.secondary"
            >
              {avatarInitials(name) ? (
                <Text recipe="display" as="span" aria-hidden="true">
                  {avatarInitials(name)}
                </Text>
              ) : (
                <Box as={FiUser} aria-hidden="true" />
              )}
              <VisuallyHidden>{name}</VisuallyHidden>
            </Flex>
          )}

          {state.status === 'uploading' ? (
            <Flex
              position="absolute"
              inset={0}
              align="center"
              justify="center"
              bg={componentTokens.overlay.scrim}
              color="text.onInverse"
              transition={transitionFor('opacity')}
            >
              <InlineLoading task="your new profile picture" hideLabel />
            </Flex>
          ) : null}

          {fileInput}

          <Button
            tone="quiet"
            size="md"
            iconStart={<Box as={FiCamera} aria-hidden="true" />}
            isDisabled={!state.canChoose}
            isLoading={state.status === 'uploading'}
            loadingLabel="Uploading your new profile picture"
            onClick={() => inputRef.current?.click()}
            position="absolute"
            insetInlineEnd={space[3]}
            insetBlockEnd={space[3]}
            bg={componentTokens.overlay.scrim}
            color={palette.white}
          >
            Change picture
          </Button>
        </Box>

        {state.canRetry && onReloadImage !== undefined ? (
          <Button tone="quiet" size="md" onClick={onReloadImage} alignSelf="flex-start">
            Try to load the picture again
          </Button>
        ) : null}

        {uploadError === undefined ? null : (
          <Text
            recipe="metadata"
            role="alert"
            aria-live="assertive"
            color={componentTokens.field.invalidText}
          >
            {uploadError}
          </Text>
        )}

        {state.status === 'imageFailed' ? (
          <Text recipe="metadata" role="status" aria-live="polite">
            We could not load the current picture. Your initials are shown instead.
          </Text>
        ) : null}
      </Stack>
    )
  }

  return (
    <Stack gap={3} alignItems="center">
      <Box position="relative">
        <Avatar name={name} src={src} size="lg" hasFailed={state.showsFallback} />
        {state.status === 'uploading' ? (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            borderRadius={radii.tag}
            bg={componentTokens.overlay.scrim}
            color="text.onInverse"
            transition={transitionFor('opacity')}
          >
            <InlineLoading task="your new profile picture" hideLabel />
          </Flex>
        ) : null}
      </Box>

      <Text recipe="metadata">{caption}</Text>

      {fileInput}

      <Stack direction="row" gap={2} collapseAt={undefined} justifyContent="center" flexWrap="wrap">
        <Button
          tone="secondary"
          size="md"
          iconStart={<Box as={FiCamera} aria-hidden="true" />}
          isDisabled={!state.canChoose}
          isLoading={state.status === 'uploading'}
          loadingLabel="Uploading your new profile picture"
          onClick={() => inputRef.current?.click()}
        >
          Change picture
        </Button>

        {state.canRetry && onReloadImage !== undefined ? (
          <Button tone="quiet" size="md" onClick={onReloadImage}>
            Try to load the picture again
          </Button>
        ) : null}
      </Stack>

      {uploadError === undefined ? null : (
        <Text
          recipe="metadata"
          role="alert"
          aria-live="assertive"
          color={componentTokens.field.invalidText}
          textAlign="center"
        >
          {uploadError}
        </Text>
      )}

      {state.status === 'imageFailed' ? (
        <Text recipe="metadata" role="status" aria-live="polite" textAlign="center">
          We could not load the current picture. Your initials are shown instead.
        </Text>
      ) : null}
    </Stack>
  )
}
