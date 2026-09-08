import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useReducedMotion } from 'framer-motion'
import { type BlogPostSummary, extractPreviewText, toPublicPostPath } from '../../../core'
import { HomePostMedia, HomePostMeta } from './HomePostMedia'
const HeroArchivePreview = ({ post }: { post: BlogPostSummary }) => {
  const reduced = useReducedMotion()
  return (
    <section className="signal-feature">
      <Link
        to={toPublicPostPath(post.id)}
        aria-label={'Read ' + post.title}
        className="signal-hero-art"
        onPointerMove={(e) => {
          if (reduced || e.pointerType !== 'mouse') return
          const rect = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--pointer-x', e.clientX - rect.left + 'px')
          e.currentTarget.style.setProperty('--pointer-y', e.clientY - rect.top + 'px')
        }}
      >
        <HomePostMedia post={post} priority />
      </Link>
      <div>
        <span className="signal-eyebrow">✧ Signature</span>
        <h2>
          <Link to={toPublicPostPath(post.id)}>{post.title}</Link>
        </h2>
        <p>{extractPreviewText(post.excerpt || post.subtitle || '')}</p>
        <HomePostMeta post={post} />
        <Link to={toPublicPostPath(post.id)} className="signal-primary">
          Read the story <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
export default HeroArchivePreview
