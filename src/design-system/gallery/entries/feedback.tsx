/**
 * Horizon Design System v2 - feedback entries.
 */

import { useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  Button,
  EmptyState,
  ErrorState,
  FeedbackSurface,
  InlineLoading,
  LoadingIndicator,
  MissingState,
  OfflineState,
  PageLoading,
  PanelLoading,
  PermissionState,
  RetryAction,
  Skeleton,
  type FeedbackTone,
  type LoadingScope,
} from '../../index'
import { space } from '../../../theme/tokens'
import { noop, type EntryRenderer } from './support'

const TONES: Record<string, FeedbackTone> = {
  loading: 'loading',
  empty: 'empty',
  error: 'error',
  permission: 'permission',
  missing: 'missing',
  offline: 'offline',
  success: 'success',
}

function FeedbackSurfaceEntry({ state }: { readonly state: string }) {
  const tone = TONES[state] ?? 'empty'

  return (
    <FeedbackSurface
      tone={tone}
      headline={`Sample ${tone} headline`}
      detail="Sample detail sentence naming the next valid step."
    />
  )
}

function EmptyStateEntry({ state }: { readonly state: string }) {
  return (
    <EmptyState subject="published sample posts" nextAction="Write the first one and publish it.">
      {state === 'empty with an action' ? (
        <Button tone="primary">Write a sample post</Button>
      ) : null}
    </EmptyState>
  )
}

function ErrorStateEntry({ state }: { readonly state: string }) {
  return (
    <ErrorState
      failedAction="load the sample article"
      detail="The gallery has no backend, so this failure is simulated."
    >
      {state === 'error with a retry' ? (
        <RetryAction failedAction="load the sample article" onRetry={noop} />
      ) : null}
    </ErrorState>
  )
}

function MissingStateEntry() {
  return (
    <MissingState subject="the sample article you asked for" detail="It may have been unpublished.">
      <Button tone="secondary">Back to the sample index</Button>
    </MissingState>
  )
}

function OfflineStateEntry() {
  return (
    <OfflineState task="load the sample article" detail="Your connection dropped.">
      <RetryAction failedAction="load the sample article" onRetry={noop} />
    </OfflineState>
  )
}

function PermissionStateEntry() {
  return (
    <PermissionState
      deniedAction="view these sample analytics"
      detail="Ask a sample administrator for the author role."
    />
  )
}

function LoadingIndicatorEntry({ state }: { readonly state: string }) {
  const scope: LoadingScope = state === 'panel' ? 'panel' : state === 'inline' ? 'inline' : 'route'

  return (
    <LoadingIndicator
      task="the sample article"
      scope={state === 'label hidden' ? 'panel' : scope}
      hideLabel={state === 'label hidden'}
    />
  )
}

function PageLoadingEntry() {
  return <PageLoading task="the sample article" />
}

function PanelLoadingEntry() {
  return <PanelLoading task="your sample drafts" />
}

function InlineLoadingEntry() {
  return <InlineLoading task="the sample comment count" />
}

function RetryActionEntry({ state }: { readonly state: string }) {
  const [attempt, setAttempt] = useState(state === 'attempts spent' ? 3 : 0)

  return (
    <RetryAction
      failedAction="load the sample article"
      onRetry={() => setAttempt((current) => current + 1)}
      attempt={attempt}
      maxAttempts={3}
      retrying={state === 'retrying'}
    />
  )
}

function SkeletonEntry({ state }: { readonly state: string }) {
  if (state === 'media') {
    return <Skeleton shape={{ shape: 'media', aspectRatio: '16 / 9' }} label="the sample cover" />
  }

  if (state === 'block') {
    return <Skeleton shape={{ shape: 'block', height: 12 }} label="the sample panel" />
  }

  if (state === 'circle') {
    return <Skeleton shape={{ shape: 'circle', size: 12 }} label="the sample avatar" />
  }

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <Skeleton shape={{ shape: 'text', textStyle: 'cardTitle' }} label="the sample title" />
      <Skeleton shape={{ shape: 'text', textStyle: 'body', lines: 3 }} label="the sample excerpt" />
    </Box>
  )
}

export const feedbackEntries = {
  FeedbackSurface: FeedbackSurfaceEntry,
  EmptyState: EmptyStateEntry,
  ErrorState: ErrorStateEntry,
  MissingState: MissingStateEntry,
  OfflineState: OfflineStateEntry,
  PermissionState: PermissionStateEntry,
  LoadingIndicator: LoadingIndicatorEntry,
  PageLoading: PageLoadingEntry,
  PanelLoading: PanelLoadingEntry,
  InlineLoading: InlineLoadingEntry,
  RetryAction: RetryActionEntry,
  Skeleton: SkeletonEntry,
} satisfies Record<string, EntryRenderer>
