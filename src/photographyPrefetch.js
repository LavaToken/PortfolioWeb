const BASE = import.meta.env.BASE_URL
const MANIFEST_URL = `${BASE}photography/photo-manifest.json`
const PREVIEW_COUNT = 8

let started = false
let manifestPromise = null

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .catch((err) => {
        manifestPromise = null
        throw err
      })
  }
  return manifestPromise
}

function preloadImage(src) {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  img.decode?.().catch(() => {})
}

export function prefetchPhotographyPreviews() {
  if (started) return
  started = true

  loadManifest()
    .then((data) => {
      const photos = Array.isArray(data) ? data : []
      photos.slice(0, PREVIEW_COUNT).forEach((photo) => {
        const path = photo.thumb || photo.src
        if (path) preloadImage(`${BASE}${path}`)
      })
    })
    .catch(() => {
      started = false
    })
}
