/**
 * Horizon Design System v2 - account fixtures.
 *
 * Sample content for the B6 gallery, and nothing else. Every value here is
 * obviously synthetic: the people are placeholders at `example.com`, the
 * employers are made-up, and the CV describes work nobody did.
 *
 * `DESIGN.md` asks that real founder identity, biography, contacts and CV be
 * preserved on the production pages. That is the *page's* job, from the API.
 * A fixture carrying a real person's identity would end up in a gallery build
 * and be indistinguishable from the real profile, so these deliberately are
 * not that - they are the shape, at realistic length, with invented content.
 *
 * The strings are long on purpose. A fixture that fits comfortably proves
 * nothing about a header holding a Vietnamese name plus a two-line biography
 * on a 375px screen.
 */

import type { CVEntryProps } from './CVEntry'
import type { ProfileIdentity, ProfileStat } from './ProfileHeader'
import type { ContactCardProps } from './ContactCard'

export const sampleProfile: ProfileIdentity = {
  name: 'Sample Author (Nguyễn Thị Phương Anh)',
  avatarUrl: null,
  bio: 'Sample biography for the design system gallery. Writes about distributed systems, the parts of a database that only matter at three in the morning, and how to explain either to somebody who has to be on call tomorrow.',
  email: 'sample.author@example.com',
  location: 'Sample City, Example Country',
  website: 'https://example.com/sample-author',
}

/** The same person with nothing filled in - the empty branch of the header. */
export const sampleProfileWithoutBio: ProfileIdentity = {
  name: 'Sample Author',
  avatarUrl: null,
}

/** A source that will not resolve, for the avatar failure branch. */
export const sampleBrokenAvatarProfile: ProfileIdentity = {
  ...sampleProfile,
  avatarUrl: 'https://example.invalid/sample-avatar-that-does-not-exist.png',
}

export const sampleProfileStats: readonly ProfileStat[] = [
  { label: 'Published', value: '18', detail: 'Sample posts live on the site.' },
  { label: 'Drafts', value: '4', detail: 'Sample posts still being written.' },
]

export const sampleContactCards: readonly ContactCardProps[] = [
  {
    channel: 'email',
    title: 'Email',
    value: 'sample.author@example.com',
    detail: 'Sample response time: within two working days.',
    emphasis: 'primary',
  },
  {
    channel: 'link',
    title: 'Sample profile elsewhere',
    value: 'https://example.com/sample-author',
    detail: 'Opens on another site, in a new tab.',
  },
  {
    channel: 'location',
    title: 'Based in',
    value: 'Sample City, Example Country',
    detail: 'Sample timezone: UTC+7.',
  },
]

export const sampleCVEntries: readonly CVEntryProps[] = [
  {
    title: 'Sample Senior Engineer',
    organisation: 'Example Systems (sample employer)',
    period: '2022 - present',
    highlights: [
      'Sample highlight: rewrote an ingestion path that had been failing quietly for a year, and added the alert that would have caught it.',
      'Sample highlight: cut a nightly batch from six hours to forty minutes by fixing one index and deleting three others.',
      'Sample highlight: wrote the runbook the on-call rotation actually uses.',
    ],
    stack: ['TypeScript', 'PostgreSQL', 'Kafka', 'Terraform'],
    links: [{ label: 'Sample site', href: 'https://example.com/sample-employer/engineering' }],
  },
  {
    title: 'Sample side project',
    period: '2024',
    description:
      'Sample project description. A small tool that renders a query plan as something a person can read, written mostly on trains.',
    stack: ['Rust', 'WebAssembly'],
    links: [
      { label: 'GitHub', href: 'https://example.com/sample-account/sample-project' },
      { label: 'Publication', href: 'https://example.com/sample-journal/articles/sample-paper' },
    ],
  },
]

/** MIME types and size limit the gallery uses. The real ones come from the API. */
export const sampleAvatarLimits = {
  allowedTypes: ['image/jpeg', 'image/png'] as const,
  maxBytes: 5 * 1024 * 1024,
}
