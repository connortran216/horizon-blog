import { SeriesService } from './series.service'

let seriesService: SeriesService | undefined

export const getSeriesService = (): SeriesService => {
  seriesService ??= new SeriesService()
  return seriesService
}
