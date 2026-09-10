import './series-book-cover.css'

interface SeriesBookCoverProps {
  title: string
  tone?: number
  size?: 'compact' | 'standard' | 'hero'
}

const SeriesBookCover = ({ title, tone = 0, size = 'standard' }: SeriesBookCoverProps) => (
  <div
    className={`series-book series-book--${size}`}
    data-tone={Math.abs(tone) % 4}
    aria-hidden="true"
  >
    <span className="series-book__sheet" />
    <span className="series-book__sheet" />
    <div className="series-book__cover">
      <span>HORIZON / SERIES</span>
      <strong>{title}</strong>
      <span>READ · EXPLORE · CONNECT</span>
    </div>
  </div>
)

export default SeriesBookCover
