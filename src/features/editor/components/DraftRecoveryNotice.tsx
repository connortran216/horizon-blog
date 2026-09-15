/**
 * The draft-recovery banner.
 *
 * `useDraftRecovery` decides whether to show this at all, using the design
 * system's `draftRecovery()` - and only once the backup in this browser has
 * been confirmed to belong to the post currently open (see
 * `../draft-backup.logic`). This component renders exactly the headline and
 * detail that function returns, and nothing else: no diff, no word count, no
 * changed-lines summary. That is a deliberate call, not an oversight - seeing
 * what differs is not part of this feature, only the two save times are, and
 * `draftRecovery()`'s copy already says so in plain language.
 *
 * Two actions, and nothing happens without one of them: `Restore` loads the
 * local copy into the editor, `Discard` keeps what is already on screen and
 * removes the backup. There is no third, automatic outcome - the two versions
 * can genuinely disagree, and only the author knows which one is right.
 */

import { Button, FeedbackSurface, Stack } from '../../../design-system'

export interface DraftRecoveryNoticeProps {
  headline: string
  detail: string
  onRestore: () => void
  onDiscard: () => void
}

const DraftRecoveryNotice = ({
  headline,
  detail,
  onRestore,
  onDiscard,
}: DraftRecoveryNoticeProps) => {
  return (
    <FeedbackSurface tone="empty" headline={headline} detail={detail} align="start">
      <Stack direction="row" collapseAt={undefined} gap={2} flexWrap="wrap">
        <Button tone="primary" size="sm" onClick={onRestore}>
          Restore
        </Button>
        <Button tone="secondary" size="sm" onClick={onDiscard}>
          Discard
        </Button>
      </Stack>
    </FeedbackSurface>
  )
}

export default DraftRecoveryNotice
