import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoAlbum from 'react-photo-album'
import 'react-photo-album/rows.css'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const BASE = import.meta.env.BASE_URL
const MANIFEST_URL = `${BASE}photography/photo-manifest.json`
const PHOTOS_URL =
  'https://www.amazon.com/photos/shared/yH1eG0HKTqyo7-iEKtYoVA.jBfIncrso6uFXPr6cexanX'

function LightboxStage({ slide, children }) {
  if (!slide.thumb || slide.thumb === slide.src) return children

  const style = {
    maxWidth: slide.width ? `min(${slide.width}px, 100%)` : '100%',
    maxHeight: slide.height ? `min(${slide.height}px, 100%)` : '100%',
  }

  return (
    <div className="photo-page__lightbox-stage">
      <img
        className="photo-page__lightbox-preview"
        src={slide.thumb}
        alt=""
        aria-hidden="true"
        draggable="false"
        style={style}
      />
      {children}
    </div>
  )
}

function Photography() {
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('loading')
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    let cancelled = false

    fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const resolved = (Array.isArray(data) ? data : []).map((photo) => {
          const src = `${BASE}${photo.src}`
          return {
            src,
            thumb: `${BASE}${photo.thumb || photo.src}`,
            width: photo.width,
            height: photo.height,
          }
        })
        setPhotos(resolved)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.title = 'Photography — Kevin Jia'
  }, [])

  const albumPhotos = useMemo(
    () =>
      photos.map((photo) => ({
        src: photo.thumb || photo.src,
        width: photo.width,
        height: photo.height,
        key: photo.src,
      })),
    [photos],
  )

  const slides = useMemo(
    () =>
      photos.map(({ src, thumb, width, height }) => ({
        src,
        thumb,
        width,
        height,
      })),
    [photos],
  )

  return (
    <div className="photo-page">
      <header className="photo-page__bar">
        <Link to="/" className="photo-page__back">
          ← back
        </Link>
        <span className="photo-page__title">[ Photography ]</span>
        <span className="photo-page__count">
          {status === 'ready' ? String(photos.length).padStart(3, '0') : '—'}
        </span>
      </header>

      <main className="photo-page__body">
        {status === 'loading' && (
          <p className="photo-page__note">Loading photographs…</p>
        )}

        {status === 'error' && (
          <p className="photo-page__note">Could not load the photo manifest.</p>
        )}

        {status === 'ready' && photos.length === 0 && (
          <p className="photo-page__note">
            No photographs yet. Drop images into <code>public/photography/</code>.
          </p>
        )}

        {status === 'ready' && photos.length > 0 && (
          <PhotoAlbum
            layout="rows"
            photos={albumPhotos}
            spacing={4}
            targetRowHeight={320}
            onClick={({ index: current }) => setIndex(current)}
          />
        )}
      </main>

      <footer className="photo-page__footer">
        <a
          className="photo-page__portfolio-link"
          href={PHOTOS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Full photography portfolio ↗
        </a>
      </footer>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        render={{ slideContainer: LightboxStage }}
      />
    </div>
  )
}

export default Photography
