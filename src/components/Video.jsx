import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const videos = [
  {
    heading: 'Latest clip.',
    subtitle: 'Not everything I make is code.',
    caption: 'Recent trip to Boston',
    src: 'https://www.youtube.com/embed/q77fmTOMGyg',
    title: 'Latest creative piece — Boston',
    flip: false,
  },
  {
    heading: 'Episode 2.',
    subtitle: 'A series I cut on contract.',
    caption: "Ren's Chinese Culture",
    src: 'https://www.youtube.com/embed/tN1PbhZdmxo',
    title: 'Episode 2 — China',
    flip: true,
  },
  {
    heading: 'Episode 6.',
    subtitle: 'Another cut from the same gig.',
    caption: "Sally's Beli-maxxing.",
    src: 'https://www.youtube.com/embed/bvs9V_Nx8Hs',
    title: "Episode 6 — Sally's Beli-maxxing",
    flip: false,
  },
]

function Video() {
  useEffect(() => {
    document.title = 'Video — Kevin Jia'
  }, [])

  return (
    <div className="video-page">
      <header className="video-page__bar">
        <Link to="/" className="video-page__back">
          ← back
        </Link>
        <span className="video-page__title">[ Video ]</span>
        <span className="video-page__spacer" aria-hidden="true" />
      </header>

      <main className="video-page__body">
        {videos.map((video, i) => {
          const Heading = i === 0 ? 'h1' : 'h2'
          const copy = (
            <div className="video-page__copy">
              <Heading className="video-page__heading">{video.heading}</Heading>
              <p className="video-page__subtitle">{video.subtitle}</p>
              <p className="video-page__caption">{video.caption}</p>
            </div>
          )
          const embed = (
            <div className="video-page__embed">
              <iframe
                src={video.src}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )

          return (
            <section
              key={video.src}
              className={`video-page__row${video.flip ? ' video-page__row--flip' : ''}`}
            >
              {video.flip ? (
                <>
                  {embed}
                  {copy}
                </>
              ) : (
                <>
                  {copy}
                  {embed}
                </>
              )}
              {i === 0 && (
                <button
                  type="button"
                  className="video-page__more"
                  aria-label="More videos below"
                  onClick={() => {
                    document
                      .querySelectorAll('.video-page__row')[1]
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M4 6.5 9 11.5 14 6.5" />
                  </svg>
                </button>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}

export default Video
