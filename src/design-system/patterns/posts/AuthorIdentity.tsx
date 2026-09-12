/**
 * Horizon Design System v2 - who wrote this.
 *
 * One of the two shared content contracts for the post area. Every surface that
 * names an author - card, row, signature, archive hero, reader header - renders
 * this, so the avatar fallback, the missing-name wording and the decision about
 * whether the name is a link are made once.
 *
 * The picture is not a `ResponsiveImage`. That component offers a retry control
 * on failure, which is right for a cover plate and wrong for a 24px portrait in
 * a metadata row: it would put a button in the tab order for something nobody
 * came here for. So the avatar drives the same media machine directly and
 * treats failure the way it treats absence - initials, silently.
 *
 * The picture is also decorative. It sits immediately beside the name, so alt
 * text would make a screen reader say the person twice.
 */

import { forwardRef } from 'react'
import { Flex, Image, type FlexProps } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { MediaFrame, MediaPlaceholder, imageMounted, useMediaState } from '../../components/media'
import { Text } from '../../components/typography'
import {
  authorDisplayName,
  authorInitials,
  authorProfileHref,
  type AuthorIdentity as AuthorIdentityContent,
} from './content.logic'

export type AuthorIdentitySize = 'sm' | 'md'

export interface AuthorIdentityProps extends Omit<FlexProps, 'children'> {
  author: AuthorIdentityContent | null | undefined
  /** `sm` inside a dense metadata row, `md` in a reader header. */
  size?: AuthorIdentitySize
  /** Drop the picture where a row already carries too much furniture. */
  showAvatar?: boolean
}

const avatarSize: Record<AuthorIdentitySize, string> = {
  sm: space[6],
  md: space[8],
}

export const AuthorIdentity = forwardRef<HTMLDivElement, AuthorIdentityProps>(
  function AuthorIdentity({ author, size = 'sm', showAvatar = true, ...rest }, ref) {
    const name = authorDisplayName(author)
    const href = authorProfileHref(author)
    const initials = authorInitials(author)
    const { state, onLoaded, onFailed } = useMediaState({ src: author?.avatarUrl ?? null })
    const showPicture = imageMounted(state) && state.src !== null

    return (
      <Flex ref={ref} align="center" gap={space[2]} minW={0} {...rest}>
        {showAvatar ? (
          <MediaFrame
            aspectRatio="1 / 1"
            radius="tag"
            width={avatarSize[size]}
            flexShrink={0}
            aria-hidden="true"
          >
            {showPicture ? (
              <Image
                key={state.src ?? ''}
                src={state.src ?? undefined}
                alt=""
                role="presentation"
                loading="lazy"
                decoding="async"
                position="absolute"
                inset={0}
                width="100%"
                height="100%"
                objectFit="cover"
                onLoad={onLoaded}
                onError={() => onFailed('The browser could not load the avatar.')}
              />
            ) : (
              <MediaPlaceholder variant="absent" caption={initials} />
            )}
          </MediaFrame>
        ) : null}

        {href ? (
          <ActionLink to={href} underline="hover" textStyle="meta" color="text.secondary">
            {name}
          </ActionLink>
        ) : (
          <Text as="span" recipe="metadata" color={componentTokens.reader.secondaryFg} minW={0}>
            {name}
          </Text>
        )}
      </Flex>
    )
  },
)

/**
 * The avatar's own radius, exported so the gallery can show that an author
 * picture is the one circular media surface in the system and every other frame
 * is a rounded rectangle.
 */
export const authorAvatarRadius = radii.tag
