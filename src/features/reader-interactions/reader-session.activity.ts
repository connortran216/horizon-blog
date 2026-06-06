export interface ActiveTimeTrackingInput {
  nowMs: number
  lastActivityMs: number
  idleTimeoutMs: number
  isVisible: boolean
  isFocused: boolean
}

export const shouldTrackActiveTime = ({
  nowMs,
  lastActivityMs,
  idleTimeoutMs,
  isVisible,
  isFocused,
}: ActiveTimeTrackingInput) => {
  if (!isVisible || !isFocused) return false
  return nowMs - lastActivityMs <= idleTimeoutMs
}
