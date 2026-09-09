import { AnimatePresence } from 'framer-motion'
import HorizonLoading from '../../../components/ui/HorizonLoading'
import { Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import HeroArchivePreview from '../components/HeroArchivePreview'
import StoryCard from '../components/StoryCard'
import SeriesShelf from '../../series/components/SeriesShelf'
import { useHomeWriting } from '../useHomeWriting'
import '../signal-home.css'
const HomePage = () => {
  const { signature, latest, loading, error, retry } = useHomeWriting()
  return (
    <div className="signal-home">
      <AnimatePresence>{loading && <HorizonLoading key="home-loading" />}</AnimatePresence>
      <header className="signal-intro">
        <h1>
          Ideas worth understanding<span>.</span>
        </h1>
      </header>
      {loading ? null : error ? (
        <section className="signal-feedback" role="alert">
          <h2>Writing could not load</h2>
          <p>Please try again.</p>
          <Button onClick={retry}>Try again</Button>
        </section>
      ) : signature ? (
        <>
          <HeroArchivePreview post={signature} />
          <div className="signal-series">
            <SeriesShelf editorial />
          </div>
          {latest.length > 0 && (
            <section className="signal-latest">
              <div className="signal-section-heading">
                <div>
                  <span className="signal-eyebrow">Fresh perspectives</span>
                  <h2>Latest writing</h2>
                </div>
                <Link to="/blog">
                  Explore all writing <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className="signal-grid">
                {latest.map((post) => (
                  <StoryCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="signal-feedback">
          <h2>A little space for new ideas.</h2>
          <p>New writing will appear here when it is published.</p>
          <Link to="/blog">Explore the blog</Link>
        </section>
      )}
      {!loading && (error || !signature) && (
        <div className="signal-series">
          <SeriesShelf editorial />
        </div>
      )}
    </div>
  )
}
export default HomePage
