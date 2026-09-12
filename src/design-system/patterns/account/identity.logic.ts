/**
 * Horizon Design System v2 - identity presentation decisions.
 *
 * Profile, avatar, contact and CV. Four surfaces that all show the same person
 * and all fail differently: a profile can be loading or refused, an avatar can
 * be absent or broken, a contact link can leave the site, and a CV has to
 * survive being printed on paper by someone who will never see the screen
 * version.
 *
 * `DESIGN.md` asks that real identity be preserved. Nothing here invents a
 * name, a biography or a contact detail: every function takes what the feature
 * loaded and decides only how it is arranged, labelled and degraded.
 */

import { radii, space } from '../../../theme/tokens'

/* -------------------------------------------------------------------------- */
/* Profile header                                                             */
/* -------------------------------------------------------------------------- */

export type ProfileHeaderStatus = 'loading' | 'denied' | 'missing' | 'empty' | 'ready'

export interface ProfileHeaderStateInput {
  readonly isLoading?: boolean
  /** A verb phrase: "view this profile". Its presence means denied. */
  readonly deniedAction?: string
  /** The feature looked and found nothing under this handle. */
  readonly isMissing?: boolean
  /** The profile loaded. Without it there is nothing to arrange. */
  readonly hasProfile?: boolean
  /** The person has not written a biography yet. Not an error. */
  readonly hasBio?: boolean
}

export interface ProfileHeaderStateOutput {
  readonly status: ProfileHeaderStatus
  /** Whether the name, avatar and actions are drawn. */
  readonly showsIdentity: boolean
  /** Whether the owner's edit affordances are drawn. */
  readonly showsOwnerActions: boolean
  /** Whether the placeholder biography line stands in for a real one. */
  readonly usesBioPlaceholder: boolean
}

/**
 * Which single state the header is in.
 *
 * Precedence, strongest first: denied, missing, loading, empty, ready.
 *
 * Denied outranks missing because the two are indistinguishable from the
 * client's side and only one of them is safe to state: telling an unauthorised
 * visitor that a profile is "not found" when the feature actually refused them
 * would be a guess. `empty` is not a failure - it is a real profile whose owner
 * has not written a bio - so it keeps the whole header and only swaps one line.
 */
export function profileHeaderState({
  isLoading = false,
  deniedAction,
  isMissing = false,
  hasProfile = false,
  hasBio = false,
}: ProfileHeaderStateInput): ProfileHeaderStateOutput {
  const status: ProfileHeaderStatus =
    deniedAction !== undefined
      ? 'denied'
      : isMissing
        ? 'missing'
        : isLoading || !hasProfile
          ? 'loading'
          : hasBio
            ? 'ready'
            : 'empty'

  const showsIdentity = status === 'ready' || status === 'empty'

  return {
    status,
    showsIdentity,
    // Owner controls are drawn from the caller's own permission answer, never
    // from this module. `showsOwnerActions` only says the header has somewhere
    // to put them; whether the caller passes any is the caller's decision.
    showsOwnerActions: showsIdentity,
    usesBioPlaceholder: status === 'empty',
  }
}

/**
 * The line that stands in for an unwritten biography.
 *
 * It describes the surface rather than inventing a personality, because the
 * alternative - a cheerful sentence in the first person - would be words the
 * account owner never wrote appearing under their own name.
 */
export function bioPlaceholder(): string {
  return 'This profile has no biography yet.'
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Initials for the fallback avatar.
 *
 * First and last word, so "Nguyen Van An" gives "NA" rather than "NV". Falls
 * back to a single letter for a one-word name, and to an empty string for no
 * name at all - at which point the component draws its icon instead, because a
 * blank circle says nothing and a question mark says something rude.
 */
export function avatarInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)

  if (words.length === 0) {
    return ''
  }

  const first = [...words[0]][0] ?? ''
  const last = words.length > 1 ? ([...words[words.length - 1]][0] ?? '') : ''

  return `${first}${last}`.toUpperCase()
}

export type AvatarEditorStatus = 'empty' | 'ready' | 'uploading' | 'failed' | 'imageFailed'

export interface AvatarEditorStateInput {
  /** A source exists. Whether it loads is a separate question. */
  readonly hasSource?: boolean
  readonly isUploading?: boolean
  /** The upload was rejected or failed. Its presence means failed. */
  readonly uploadError?: string
  /** The browser could not render the source that does exist. */
  readonly imageFailed?: boolean
  readonly isDisabled?: boolean
}

export interface AvatarEditorStateOutput {
  readonly status: AvatarEditorStatus
  /** Whether the picture element is worth mounting. */
  readonly showsImage: boolean
  /** Whether the initials or icon stand in for it. */
  readonly showsFallback: boolean
  /** Whether the choose-a-file control accepts a click. */
  readonly canChoose: boolean
  /** Whether a retry is worth offering. A rejected file is not retryable. */
  readonly canRetry: boolean
}

/**
 * Which single state the avatar editor is in.
 *
 * Precedence, strongest first: uploading, upload failed, image failed, empty,
 * ready.
 *
 * Uploading first because a new file replaces whatever question the old one
 * raised. An upload failure outranks a broken image because it is the thing the
 * reader just did. A broken image is not an upload failure and must not offer
 * "try again" against a file that was never chosen - it offers a reload of the
 * source instead, which is why `canRetry` distinguishes them.
 */
export function avatarEditorState({
  hasSource = false,
  isUploading = false,
  uploadError,
  imageFailed = false,
  isDisabled = false,
}: AvatarEditorStateInput): AvatarEditorStateOutput {
  const status: AvatarEditorStatus = isUploading
    ? 'uploading'
    : uploadError !== undefined
      ? 'failed'
      : imageFailed
        ? 'imageFailed'
        : hasSource
          ? 'ready'
          : 'empty'

  return {
    status,
    showsImage: status === 'ready' || status === 'uploading',
    showsFallback: status === 'empty' || status === 'imageFailed' || status === 'failed',
    canChoose: !isDisabled && !isUploading,
    canRetry: status === 'imageFailed',
  }
}

export interface AvatarUploadLimits {
  /** MIME types the backend accepts. Supplied by the feature, never guessed. */
  readonly allowedTypes: readonly string[]
  readonly maxBytes: number
}

export interface AvatarCandidate {
  readonly mimeType: string
  readonly bytes: number
}

/**
 * Why a chosen file cannot be uploaded, or `null` when it can.
 *
 * The limits are arguments rather than constants. The backend owns them; a
 * number baked in here would silently disagree with the server the day it
 * changes, and the reader would be told a 6MB file is fine right up until it
 * is not.
 */
export function avatarRejection(
  candidate: AvatarCandidate,
  { allowedTypes, maxBytes }: AvatarUploadLimits,
): string | null {
  if (!allowedTypes.includes(candidate.mimeType)) {
    const readable = allowedTypes
      .map((type) => type.split('/')[1]?.toUpperCase() ?? type)
      .join(', ')

    return `That file is not an image we can use. Choose a ${readable} file.`
  }

  if (candidate.bytes > maxBytes) {
    const limit = Math.round(maxBytes / (1024 * 1024))

    return `That image is larger than ${limit}MB. Compress it or choose a smaller file.`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Contact                                                                    */
/* -------------------------------------------------------------------------- */

export type ContactChannel = 'email' | 'phone' | 'link' | 'location'

export interface ContactHrefOutput {
  readonly href: string | undefined
  /** True when the destination is a document on another host. */
  readonly leavesSite: boolean
}

/**
 * Turn a channel and its value into an href.
 *
 * `mailto:` and `tel:` are built here rather than by the caller because getting
 * them slightly wrong - a space in a phone number, an unencoded name in an
 * address - produces a link that silently does nothing on a phone. `location`
 * has no href at all: a printed address is information, not a destination, and
 * linking it to a map service the owner never chose would be an invention.
 */
export function contactHref(channel: ContactChannel, value: string): ContactHrefOutput {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return { href: undefined, leavesSite: false }
  }

  switch (channel) {
    case 'email':
      return { href: `mailto:${trimmed}`, leavesSite: false }
    case 'phone':
      return { href: `tel:${trimmed.replace(/[^\d+]/g, '')}`, leavesSite: false }
    case 'link':
      return { href: trimmed, leavesSite: /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) }
    case 'location':
    default:
      return { href: undefined, leavesSite: false }
  }
}

/* -------------------------------------------------------------------------- */
/* CV                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * A link's destination, written out.
 *
 * On screen a link can say "GitHub" and the reader can click it. On paper it
 * cannot. Every CV link therefore renders host and path as its own text, so the
 * printed page carries a destination somebody could type. The scheme and any
 * trailing slash are dropped because neither survives being read aloud or
 * copied off paper usefully.
 */
export function readableLinkText(href: string): string {
  try {
    const url = new URL(href)
    const path = decodeURIComponent(url.pathname).replace(/\/$/, '')

    return `${url.host}${path}`
  } catch {
    return href.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/$/, '')
  }
}

export interface PrintStyle {
  /** Keeps one CV entry from being split across two sheets of paper. */
  readonly breakInside: 'avoid'
  /** Printers do not render shadows; asking for one wastes ink on a border. */
  readonly boxShadow: 'none'
  /** Backgrounds are dropped by default in print - the text must not rely on one. */
  readonly background: 'transparent'
  readonly borderRadius: string
  readonly paddingBlock: string
}

/**
 * What a CV entry becomes on paper.
 *
 * The screen version sits on a surface with a tint behind it. Most printers
 * drop that tint, so anything whose legibility depended on it would come out as
 * pale text on white. The print style removes the surface entirely and lets the
 * type carry the hierarchy, which it can, because the ramp is a size ramp
 * rather than a colour one.
 */
export function cvPrintStyle(): PrintStyle {
  return {
    breakInside: 'avoid',
    boxShadow: 'none',
    background: 'transparent',
    borderRadius: radii.control,
    paddingBlock: space[2],
  }
}
