export type PublishMode = 'now' | 'schedule'

export const resolvePublishMode = (
  requestedMode: string | null,
  hasExistingSchedule: boolean,
): PublishMode => {
  if (requestedMode === 'now') return 'now'
  if (requestedMode === 'schedule') return 'schedule'
  return hasExistingSchedule ? 'schedule' : 'now'
}
