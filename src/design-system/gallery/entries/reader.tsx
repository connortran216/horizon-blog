/**
 * Horizon Design System v2 - reader entries.
 */

import { useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  CodeBlock,
  CommentThread,
  DiagramFrame,
  Heading,
  PostMetadata,
  Prose,
  ReaderFrame,
  ReactionBar,
  ReadingProgress,
  ResponsiveImage,
  ShareAction,
  TOC,
  Text,
} from '../../index'
import { space } from '../../../theme/tokens'
import {
  sampleCode,
  sampleComments,
  sampleDiagramSource,
  sampleHeadings,
  sampleShare,
  sampleWideTableColumns,
  sampleWideTableRows,
} from '../../patterns/reader/fixtures'
import { useGallery } from '../GalleryContext'
import { SAMPLE_IMAGE_ALT, longCopy } from '../content'
import { noop, type EntryRenderer } from './support'

const PARAGRAPH =
  'Sample prose. A paragraph at ordinary length, written only so the reading measure, ' +
  'the line height and the space between paragraphs can be judged together.'

function SampleArticle() {
  const gallery = useGallery()

  return (
    <>
      <Heading recipe="sectionTitle" as="h2" id="sample-what-happens-first">
        What happens first
      </Heading>
      <Text recipe="prose">{gallery.copy(PARAGRAPH, longCopy.excerpt)}</Text>
      <Heading recipe="cardTitle" as="h3" id="sample-the-name-lookup">
        The name lookup
      </Heading>
      <Text recipe="prose">{PARAGRAPH}</Text>
      <Box as="table" width="100%">
        <Box as="thead">
          <Box as="tr">
            {sampleWideTableColumns.map((column) => (
              <Box as="th" key={column} textAlign="start" px={space[2]} py={space[1]}>
                {column}
              </Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {sampleWideTableRows.map((row) => (
            <Box as="tr" key={row[0]}>
              {row.map((cell, index) => (
                <Box as="td" key={`${row[0]}-${index}`} px={space[2]} py={space[1]}>
                  {cell}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  )
}

function ReaderFrameEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <ReaderFrame
      contentRef={contentRef}
      headings={sampleHeadings}
      activeHeadingId="sample-the-name-lookup"
      onNavigateHeading={noop}
      isLoading={state === 'loading'}
      isMissing={state === 'missing'}
      error={state === 'failed' ? 'The sample article could not be loaded.' : null}
      onRetry={noop}
      identity={<Heading recipe="pageTitle">{gallery.post.title}</Heading>}
      metadata={<PostMetadata metadata={gallery.post.metadata} withAuthorAvatar />}
      cover={
        gallery.post.cover ? (
          <ResponsiveImage
            aspectRatio="16 / 9"
            src={gallery.post.cover.src}
            alt={SAMPLE_IMAGE_ALT}
            task="the sample cover image"
            loading="eager"
          />
        ) : null
      }
      feedback={
        <ReactionBar
          reactionCount={12}
          viewerHasReacted={false}
          canReact
          onToggleReaction={noop}
          isAuthenticated
          commentCount={sampleComments.length}
          share={{ url: sampleShare.url, title: sampleShare.title }}
        />
      }
    >
      <SampleArticle />
    </ReaderFrame>
  )
}

function ProseEntry({ state }: { readonly state: string }) {
  if (state === 'render failed') {
    return (
      <Prose renderError="The sample markdown could not be rendered." onRetryRender={noop}>
        <Text recipe="prose">{PARAGRAPH}</Text>
      </Prose>
    )
  }

  if (state === 'nothing to render') {
    return <Prose emptyMessage="This sample article has no body yet." />
  }

  return (
    <Prose>
      <SampleArticle />
    </Prose>
  )
}

function CodeBlockEntry({ state }: { readonly state: string }) {
  return (
    <CodeBlock language={state === 'no language' ? null : 'typescript'} code={sampleCode}>
      <Box as="pre">
        <Box as="code">{sampleCode}</Box>
      </Box>
    </CodeBlock>
  )
}

function DiagramFrameEntry({ state }: { readonly state: string }) {
  const [showSource, setShowSource] = useState(state === 'source shown')

  return (
    <DiagramFrame
      caption="Sample diagram: how a request finds a server"
      description="A sample flow from browser to database, drawn only for the gallery."
      source={sampleDiagramSource}
      hasError={state === 'render failed'}
      showSource={showSource}
      onToggleSource={setShowSource}
    >
      <Box
        as="svg"
        viewBox="0 0 320 80"
        width="100%"
        role="img"
        aria-label="Sample diagram placeholder"
      >
        <rect x="4" y="24" width="80" height="32" rx="6" fill="currentColor" opacity="0.15" />
        <rect x="120" y="24" width="80" height="32" rx="6" fill="currentColor" opacity="0.15" />
        <rect x="236" y="24" width="80" height="32" rx="6" fill="currentColor" opacity="0.15" />
      </Box>
    </DiagramFrame>
  )
}

function TOCEntry({ state }: { readonly state: string }) {
  const [activeId, setActiveId] = useState<string>(sampleHeadings[1].id)

  return (
    <TOC
      headings={sampleHeadings}
      activeId={activeId}
      variant={state === 'disclosure' ? 'disclosure' : 'rail'}
      onNavigate={setActiveId}
    />
  )
}

function ReadingProgressEntry() {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <Box position="relative" height={space[2]}>
        <ReadingProgress contentRef={contentRef} label="Sample reading progress" />
      </Box>
      <Box
        ref={contentRef}
        maxH={space[24]}
        overflowY="auto"
        border="1px solid"
        borderColor="border.subtle"
        p={space[3]}
      >
        {Array.from({ length: 12 }, (_unused, index) => (
          <Text key={index} recipe="prose">
            {PARAGRAPH}
          </Text>
        ))}
      </Box>
    </Box>
  )
}

function ReactionBarEntry({ state }: { readonly state: string }) {
  const [reacted, setReacted] = useState(state === 'reacted')

  return (
    <ReactionBar
      reactionCount={reacted ? 13 : 12}
      viewerHasReacted={reacted}
      canReact={state !== 'unavailable'}
      isReacting={state === 'reacting'}
      onToggleReaction={() => setReacted((current) => !current)}
      isAuthenticated={state !== 'unavailable'}
      commentCount={sampleComments.length}
      discussionHref="#gallery-entry-CommentThread"
      share={{ url: sampleShare.url, title: sampleShare.title }}
    />
  )
}

function ShareActionEntry() {
  return <ShareAction url={sampleShare.url} title={sampleShare.title} />
}

function CommentThreadEntry({ state }: { readonly state: string }) {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>(['sample-comment-1'])

  return (
    <CommentThread
      comments={state === 'no comments yet' || state === 'loading' ? [] : sampleComments}
      commentCount={state === 'no comments yet' ? 0 : sampleComments.length}
      available={state !== 'closed'}
      commentsOpen={state !== 'closed'}
      isLoading={state === 'loading'}
      error={state === 'failed' ? 'The sample conversation could not be loaded.' : null}
      onRetry={noop}
      expandedIds={expandedIds}
      onToggleReplies={(id) =>
        setExpandedIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        )
      }
      onReply={noop}
      onEdit={noop}
      onRemove={noop}
    />
  )
}

export const readerEntries = {
  ReaderFrame: ReaderFrameEntry,
  Prose: ProseEntry,
  CodeBlock: CodeBlockEntry,
  DiagramFrame: DiagramFrameEntry,
  TOC: TOCEntry,
  ReadingProgress: ReadingProgressEntry,
  ReactionBar: ReactionBarEntry,
  ShareAction: ShareActionEntry,
  CommentThread: CommentThreadEntry,
} satisfies Record<string, EntryRenderer>
