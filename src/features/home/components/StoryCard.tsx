import SeriesPostContext from '../../series/components/SeriesPostContext'
import { Link } from 'react-router-dom'
import { type BlogPostSummary, extractPreviewText, toPublicPostPath } from '../../../core'
import { HomePostMedia, HomePostMeta } from './HomePostMedia'
const StoryCard = ({ post }: { post: BlogPostSummary }) => (
  <article className="signal-story">
    <Link to={toPublicPostPath(post.id)} tabIndex={-1} aria-hidden="true" className="signal-thumb">
      <HomePostMedia post={post} />
    </Link>
    <div>
      <h3>
        <Link to={toPublicPostPath(post.id)}>{post.title}</Link>
      </h3>
      <p>{extractPreviewText(post.excerpt || post.subtitle || '')}</p>
      <SeriesPostContext series={post.series} />
      <HomePostMeta post={post} />
    </div>
  </article>
)
export default StoryCard
