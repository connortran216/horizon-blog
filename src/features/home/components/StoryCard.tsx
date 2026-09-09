import { cleanHomeExcerpt } from '../home.presentation'
import SeriesPostContext from '../../series/components/SeriesPostContext'
import { Link } from 'react-router-dom'
import { type BlogPostSummary, toPublicPostPath } from '../../../core'
import { HomePostMedia, HomePostMeta } from './HomePostMedia'
const StoryCard = ({ post }: { post: BlogPostSummary }) => (
  <article className="signal-story">
    <div className="signal-thumb">
      <HomePostMedia post={post} />
    </div>
    <div className="signal-story-body">
      <h3>
        <Link to={toPublicPostPath(post.id)}>{post.title}</Link>
      </h3>
      <p>{cleanHomeExcerpt(post.subtitle || post.excerpt || '')}</p>
      <div className="signal-story-series">
        <SeriesPostContext series={post.series} />
      </div>
      <HomePostMeta post={post} />
    </div>
  </article>
)
export default StoryCard
