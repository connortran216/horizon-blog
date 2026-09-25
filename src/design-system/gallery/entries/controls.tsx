/**
 * Horizon Design System v2 - action, navigation and status entries.
 */

import { useState, type ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

import {
  ActionLink,
  Button,
  Chip,
  IconButton,
  NavItem,
  NavTrack,
  RailControl,
  StatusBadge,
  ThemeToggle,
} from '../../index'
import { space } from '../../../theme/tokens'
import { useGallery } from '../GalleryContext'
import { longCopy } from '../content'
import { Glyph, noop, type EntryRenderer } from './support'

function Row({ children }: { readonly children: ReactNode }) {
  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]}>
      {children}
    </Box>
  )
}

function ButtonEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const label = gallery.copy('Publish post', longCopy.label)

  if (state === 'loading') {
    return (
      <Button tone="primary" isLoading loadingLabel="Publishing post">
        {label}
      </Button>
    )
  }

  if (state === 'disabled') {
    return (
      <Button tone="primary" isDisabled>
        {label}
      </Button>
    )
  }

  const tone =
    state === 'secondary'
      ? 'secondary'
      : state === 'quiet'
        ? 'quiet'
        : state === 'link'
          ? 'link'
          : state === 'danger'
            ? 'danger'
            : 'primary'

  return (
    <Row>
      <Button tone={tone} size="sm">
        {label}
      </Button>
      <Button tone={tone} size="md" iconStart={<Glyph shape="dot" />}>
        {label}
      </Button>
      <Button tone={tone} size="lg" iconEnd={<Glyph shape="arrow" />}>
        {label}
      </Button>
    </Row>
  )
}

function IconButtonEntry({ state }: { readonly state: string }) {
  return (
    <Row>
      <IconButton
        label="Copy sample code"
        icon={<Glyph shape="bar" />}
        size="sm"
        isLoading={state === 'loading'}
        isDisabled={state === 'disabled'}
        isPressed={state === 'pressed' ? true : undefined}
      />
      <IconButton
        label="Copy sample code"
        icon={<Glyph shape="bar" />}
        size="md"
        tone="secondary"
        isLoading={state === 'loading'}
        isDisabled={state === 'disabled'}
        isPressed={state === 'pressed' ? true : undefined}
      />
      <IconButton
        label="Delete sample draft"
        icon={<Glyph shape="dot" />}
        size="lg"
        tone="danger"
        isLoading={state === 'loading'}
        isDisabled={state === 'disabled'}
        isPressed={state === 'pressed' ? true : undefined}
      />
    </Row>
  )
}

function ActionLinkEntry({ state }: { readonly state: string }) {
  if (state === 'primary weight' || state === 'secondary weight') {
    const weight = state === 'primary weight' ? 'primary' : 'secondary'

    return (
      <Row>
        <ActionLink to="/blog" weight={weight} iconEnd={<Glyph shape="arrow" />}>
          Explore the sample blog
        </ActionLink>
        <ActionLink href="https://example.com/sample-destination" weight={weight}>
          Explore another site
        </ActionLink>
      </Row>
    )
  }

  if (state === 'external') {
    return (
      <ActionLink href="https://example.com/sample-destination" isExternal>
        Sample destination on another site
      </ActionLink>
    )
  }

  if (state === 'with icons') {
    return (
      <ActionLink
        to="/blog/sample-post-1"
        underline="hover"
        iconStart={<Glyph shape="dot" />}
        iconEnd={<Glyph shape="arrow" />}
      >
        Read the sample post
      </ActionLink>
    )
  }

  return <ActionLink to="/blog/sample-post-1">Read the sample post</ActionLink>
}

function NavItemEntry({ state }: { readonly state: string }) {
  if (state === 'current route') {
    return (
      <NavItem to="/gallery" icon={<Glyph shape="dot" />}>
        Gallery
      </NavItem>
    )
  }

  if (state === 'external') {
    return (
      <NavItem href="https://example.com/sample-destination" isCurrent={false}>
        Sample external entry
      </NavItem>
    )
  }

  if (state === 'in-page command') {
    return (
      <Row>
        <NavItem isCurrent>All posts</NavItem>
        <NavItem>Drafts</NavItem>
      </Row>
    )
  }

  if (state === 'disabled') {
    return <NavItem isDisabled>Unavailable section</NavItem>
  }

  return <NavItem to="/blog">Blog</NavItem>
}

function ThemeToggleEntry() {
  /*
   * Uncontrolled on purpose: it reads and writes Chakra's colour mode, which is
   * the same value the gallery theme control drives, so the two cannot disagree.
   */
  return <ThemeToggle />
}

function RailControlEntry({ state }: { readonly state: string }) {
  return (
    <Box position="relative" bg="bg.subtle" borderRadius="card" p={space[6]} minH={space[16]}>
      <RailControl
        direction={state === 'previous' ? 'previous' : 'next'}
        onActivate={noop}
        isDisabled={state === 'disabled'}
        itemLabel="parts"
        hideWithoutPointer={false}
      />
    </Box>
  )
}

function ChipEntry({ state }: { readonly state: string }) {
  const [selected, setSelected] = useState(state === 'selected')

  if (state === 'static') {
    return (
      <Row>
        <Chip>networking</Chip>
        <Chip>distributed-systems</Chip>
      </Row>
    )
  }

  if (state === 'disabled') {
    return (
      <Chip isSelected={false} isDisabled onClick={noop}>
        unavailable topic
      </Chip>
    )
  }

  return (
    <Chip isSelected={selected} onClick={() => setSelected((current) => !current)}>
      networking
    </Chip>
  )
}

function StatusBadgeEntry({ state }: { readonly state: string }) {
  if (state === 'live') {
    return (
      <StatusBadge tone="success" isLive>
        Published
      </StatusBadge>
    )
  }

  const tone =
    state === 'success'
      ? 'success'
      : state === 'warning'
        ? 'warning'
        : state === 'danger'
          ? 'danger'
          : 'neutral'

  return <StatusBadge tone={tone}>Sample status</StatusBadge>
}

/** Three routes inside the gallery's own router, so choosing one is a real navigation. */
function NavTrackEntry() {
  return (
    <NavTrack as="nav" aria-label="Gallery sample" gap={space[1]}>
      <NavItem to="/gallery">Home</NavItem>
      <NavItem to="/gallery/blog">Blog</NavItem>
      <NavItem to="/gallery/series">Series</NavItem>
      <NavItem to="/gallery/about">About</NavItem>
    </NavTrack>
  )
}

export const controlEntries = {
  Button: ButtonEntry,
  IconButton: IconButtonEntry,
  ActionLink: ActionLinkEntry,
  NavItem: NavItemEntry,
  NavTrack: NavTrackEntry,
  ThemeToggle: ThemeToggleEntry,
  RailControl: RailControlEntry,
  Chip: ChipEntry,
  StatusBadge: StatusBadgeEntry,
} satisfies Record<string, EntryRenderer>
