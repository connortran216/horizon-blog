/**
 * Horizon Design System v2 - the renderer for every registry row.
 *
 * The type annotation is the point: `Record<GalleryEntryName, EntryRenderer>`
 * means a registry row with no renderer, or a renderer with no registry row, is
 * a TypeScript error rather than a hole a reviewer has to notice.
 */

import type { GalleryEntryName } from '../registry'
import type { EntryRenderer } from './support'
import { accountEntries } from './account'
import { controlEntries } from './controls'
import { dataEntries } from './data'
import { editorEntries } from './editor'
import { feedbackEntries } from './feedback'
import { formEntries } from './forms'
import { layoutEntries } from './layout'
import { mediaEntries } from './media'
import { motionEntries } from './motion'
import { postEntries } from './posts'
import { readerEntries } from './reader'
import { seriesEntries } from './series'

export const entryRenderers: Record<GalleryEntryName, EntryRenderer> = {
  ...layoutEntries,
  ...controlEntries,
  ...formEntries,
  ...motionEntries,
  ...feedbackEntries,
  ...mediaEntries,
  ...postEntries,
  ...seriesEntries,
  ...readerEntries,
  ...accountEntries,
  ...editorEntries,
  ...dataEntries,
}

export type { EntryRenderer }
