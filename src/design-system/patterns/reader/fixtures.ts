/**
 * Horizon Design System v2 - reader fixtures.
 *
 * Production-shaped sample content for the B6 gallery, and obviously synthetic:
 * the article is a sample article, the commenters are sample readers, and the
 * code and diagram sources are toy examples. None of it may be mistaken for
 * published writing, and none of it is real user data.
 *
 * The set is chosen for the cases that break a reader: headings that repeat a
 * slug, a table far wider than the measure, a code block with long lines, a
 * diagram that fails to render, a removed comment with live replies under it, a
 * thread at the maximum depth, and a comment whose author account is gone.
 */

import type { ReaderComment } from './conversation.logic'
import type { ReaderHeading } from './reader.logic'

export const sampleHeadings: readonly ReaderHeading[] = [
  { id: 'sample-what-happens-first', text: 'What happens first', depth: 2 },
  { id: 'sample-the-name-lookup', text: 'The name lookup', depth: 3 },
  { id: 'sample-the-connection', text: 'The connection', depth: 3 },
  { id: 'sample-where-it-goes-wrong', text: 'Where it goes wrong', depth: 2 },
  { id: 'sample-what-to-measure', text: 'What to measure', depth: 2 },
  {
    id: 'sample-a-longer-heading',
    text: 'A deliberately long sample heading that wraps',
    depth: 3,
  },
]

export const sampleCode = [
  'export async function sampleRequest(url: string): Promise<Response> {',
  '  // A deliberately long sample line so the code block has something to scroll horizontally with.',
  '  const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" })',
  '',
  '  if (!response.ok) {',
  '    throw new Error(`Sample request failed with ${response.status}`)',
  '  }',
  '',
  '  return response',
  '}',
].join('\n')

export const sampleDiagramSource = [
  'flowchart LR',
  '  Browser --> DNS',
  '  DNS --> Gateway',
  '  Gateway --> Service',
  '  Service --> Database',
].join('\n')

/** A wide table, so the local-scroll rule is visible rather than theoretical. */
export const sampleWideTableColumns: readonly string[] = [
  'Sample step',
  'Sample component',
  'Sample latency (p50)',
  'Sample latency (p95)',
  'Sample latency (p99)',
  'Sample error rate',
  'Sample notes',
]

export const sampleWideTableRows: readonly (readonly string[])[] = [
  ['1', 'Sample resolver', '4 ms', '18 ms', '52 ms', '0.01%', 'Sample note about caching'],
  ['2', 'Sample gateway', '9 ms', '31 ms', '88 ms', '0.04%', 'Sample note about retries'],
  ['3', 'Sample service', '22 ms', '74 ms', '210 ms', '0.12%', 'Sample note about queueing'],
]

function sampleComment(id: string, overrides: Partial<ReaderComment> = {}): ReaderComment {
  return {
    id,
    parentId: null,
    depth: 0,
    content: 'Sample comment. A short, polite question about the sample article.',
    author: { name: 'Sample Reader' },
    createdAt: '2026-09-03T10:15:00.000Z',
    editedAt: null,
    isRemoved: false,
    replyCount: 0,
    canReply: true,
    canEdit: false,
    canRemove: false,
    ...overrides,
  }
}

export const sampleComments: readonly ReaderComment[] = [
  sampleComment('sample-comment-1', {
    replyCount: 2,
    canEdit: true,
    canRemove: true,
    content:
      'Sample comment. The distinction between the two steps finally made sense to ' +
      'me here - is the second one always cached?',
  }),
  sampleComment('sample-comment-2', {
    parentId: 'sample-comment-1',
    depth: 1,
    author: { name: 'Sample Author' },
    content: 'Sample reply. Only when the sample record has a long enough lifetime.',
  }),
  sampleComment('sample-comment-3', {
    parentId: 'sample-comment-2',
    depth: 2,
    // At the maximum depth the API models: no reply control should appear.
    canReply: true,
    content: 'Sample reply at the deepest level the API stores.',
    editedAt: '2026-09-03T11:02:00.000Z',
  }),
  sampleComment('sample-comment-4', {
    isRemoved: true,
    content: null,
    replyCount: 1,
    canReply: false,
  }),
  sampleComment('sample-comment-5', {
    parentId: 'sample-comment-4',
    depth: 1,
    // The account is gone; the comment is not.
    author: null,
    content: 'Sample reply whose author account no longer exists.',
  }),
]

/** A reply whose parent is not in this page - a real cursor-boundary case. */
export const sampleOrphanReply: ReaderComment = sampleComment('sample-comment-6', {
  parentId: 'sample-comment-not-in-this-page',
  depth: 1,
  content: 'Sample reply whose parent fell outside this page of the cursor.',
})

export const sampleShare = {
  url: 'https://example.invalid/blog/sample-post-1',
  title: 'Sample post: how a request finds a server',
} as const
