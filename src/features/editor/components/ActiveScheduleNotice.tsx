/**
 * The schedule banner on a draft that already has a publication time -
 * migrated onto Horizon Design System v2 (release M6).
 *
 * `ScheduleNotice` supplies the badge, the three time registers and the copy.
 * What stays here is the action: managing the schedule means routing back to
 * the publish screen with the authorisation flag the route expects, which is
 * the feature's business and not the design system's.
 *
 * The wording changed, and it had to. The legacy banner led with "This blog is
 * scheduled. It will go live ..." - true, but it names the post as a blog that
 * is going live, when the record is a draft with a timestamp on it and no
 * reader can open it until a worker runs. `publicationCopy('scheduled')` says
 * "Draft · scheduled" and "no reader can open it yet", and it is tested for
 * exactly that.
 *
 * The legacy banner also rendered nothing at all when the stored timestamp
 * could not be parsed, which left an author with a schedule they could neither
 * see nor cancel. An unreadable timestamp is now the `needsAttention` state,
 * with the same manage action attached.
 */

import { Button, ScheduleNotice } from '../../../design-system'

interface ActiveScheduleNoticeProps {
  scheduledAt: string
  onManage: () => void
  /** Injected so the state is deterministic in tests. */
  now?: Date
}

const ActiveScheduleNotice = ({ scheduledAt, onManage, now }: ActiveScheduleNoticeProps) => {
  return (
    <ScheduleNotice
      scheduledAt={scheduledAt}
      now={now}
      actions={
        <Button tone="secondary" size="sm" onClick={onManage}>
          Manage schedule
        </Button>
      }
    />
  )
}

export default ActiveScheduleNotice
