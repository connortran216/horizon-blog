import { IconType } from 'react-icons'
import type { ContactChannel } from '../../design-system'

export interface ContactInfoItem {
  /**
   * What kind of destination the value is. `ContactCard` builds the `mailto:`
   * or `tel:` href from this, and renders a `location` as plain text, so the
   * page never hand-writes a scheme.
   */
  channel: ContactChannel
  icon: IconType
  title: string
  content: string
  description?: string
  /**
   * The verb on the card's own action: "Call", "Email directly". Omitted for a
   * channel that is information rather than a destination, which is the same
   * answer `contactHref` gives for a postal address.
   */
  actionLabel?: string
  /** `primary` is the preferred channel. There is exactly one. */
  emphasis?: 'primary' | 'secondary'
}

export interface ContactPromptItem {
  icon: IconType
  title: string
  description: string
}
