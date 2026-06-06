export interface ApproximateReadersFormat {
  value: string
  label: string
  isApproximate: boolean
}

const numberFormatter = new Intl.NumberFormat('en-US')

export const formatAnalyticsInteger = (value: number) => numberFormatter.format(value)

export const formatAnalyticsPercent = (ratio: number) => {
  const percent = ratio * 100
  const fractionDigits = Number.isInteger(percent) ? 0 : 1

  return `${percent.toFixed(fractionDigits)}%`
}

export const formatAnalyticsDuration = (seconds: number) => {
  const normalized = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(normalized / 60)
  const remainingSeconds = normalized % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

export const formatApproximateReaders = (
  count: number,
  isApproximate: boolean,
): ApproximateReadersFormat => ({
  value: `${isApproximate ? '~' : ''}${formatAnalyticsInteger(count)}`,
  label: isApproximate ? 'Approx. unique readers' : 'Unique readers',
  isApproximate,
})
