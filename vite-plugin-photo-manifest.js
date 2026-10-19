import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, extname, basename, sep } from 'node:path'
import { imageSize } from 'image-size'
import sharp from 'sharp'

const PHOTO_DIR = 'public/photography'
const MANIFEST_NAME = 'photo-manifest.json'
const THUMB_DIR_NAME = 'thumbs'
const THUMB_MAX_EDGE = 1600
const THUMB_QUALITY = 75
const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tif', '.tiff',
])

/**
 * Sort order:
 *  - files whose base name is purely numeric sort ascending by that number
 *    (so 10 comes after 9, not after 1)
 *  - everything else is appended afterwards, sorted alphabetically
 */
function preferWebpFiles(files) {
  const byBase = new Map()

  for (const file of files) {
    const base = basename(file, extname(file)).toLowerCase()
    const ext = extname(file).toLowerCase()
    const existing = byBase.get(base)

    if (!existing) {
      byBase.set(base, file)
      continue
    }

    if (ext === '.webp' && extname(existing).toLowerCase() !== '.webp') {
      byBase.set(base, file)
    }
  }

  return [...byBase.values()]
}

function sortPhotoFiles(files) {
  const numeric = []
  const other = []

  for (const file of files) {
    const name = basename(file, extname(file))
    if (/^\d+$/.test(name)) {
      numeric.push(file)
    } else {
      other.push(file)
    }
  }

  numeric.sort((a, b) => Number(basename(a, extname(a))) - Number(basename(b, extname(b))))
  other.sort((a, b) => a.localeCompare(b, undefined, { numeric: false }))

  return [...numeric, ...other]
}

function isThumbPath(file) {
  return file.split(sep).includes(THUMB_DIR_NAME)
}

function listSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isFile()) return false
      if (entry.name === MANIFEST_NAME || entry.name === THUMB_DIR_NAME) return false
      return IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())
    })
    .map((entry) => entry.name)
}

async function ensureThumb(dir, file, buffer, width, height) {
  const ext = extname(file).toLowerCase()
  const sourceRel = `photography/${file}`
  // Already a small enough WebP to use directly as the grid preview.
  if (ext === '.webp' && Math.max(width, height) <= THUMB_MAX_EDGE) {
    return { thumb: sourceRel, written: false }
  }

  const thumbName = `${basename(file, ext)}.webp`
  const thumbRel = `photography/${THUMB_DIR_NAME}/${thumbName}`
  const thumbDir = join(dir, THUMB_DIR_NAME)
  const thumbPath = join(thumbDir, thumbName)
  const sourceMtime = statSync(join(dir, file)).mtimeMs

  if (existsSync(thumbPath) && statSync(thumbPath).mtimeMs >= sourceMtime) {
    return { thumb: thumbRel, written: false }
  }

  if (!existsSync(thumbDir)) {
    mkdirSync(thumbDir, { recursive: true })
  }

  await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({
      width: THUMB_MAX_EDGE,
      height: THUMB_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMB_QUALITY })
    .toFile(thumbPath)

  return { thumb: thumbRel, written: true }
}

async function buildManifest(root) {
  const dir = join(root, PHOTO_DIR)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const files = preferWebpFiles(listSourceFiles(dir))
  const photos = []
  let written = 0

  for (const file of sortPhotoFiles(files)) {
    try {
      const sourcePath = join(dir, file)
      const buffer = readFileSync(sourcePath)
      const { width, height, orientation } = imageSize(buffer)
      if (!width || !height) {
        console.warn(`[photo-manifest] skipping ${file}: could not read dimensions`)
        continue
      }
      // EXIF orientations 5-8 rotate the image 90°, so the browser displays it
      // with width/height swapped relative to the stored pixels. Record the
      // displayed dimensions so the justified layout keeps the true aspect ratio.
      const rotated = orientation >= 5 && orientation <= 8
      const displayWidth = rotated ? height : width
      const displayHeight = rotated ? width : height
      let thumb = `photography/${file}`
      try {
        const preview = await ensureThumb(dir, file, buffer, displayWidth, displayHeight)
        thumb = preview.thumb
        if (preview.written) written += 1
      } catch (err) {
        console.warn(`[photo-manifest] preview failed for ${file}: ${err.message}`)
      }
      photos.push({
        src: `photography/${file}`,
        thumb,
        width: displayWidth,
        height: displayHeight,
      })
    } catch (err) {
      console.warn(`[photo-manifest] skipping ${file}: ${err.message}`)
    }
  }

  writeFileSync(join(dir, MANIFEST_NAME), `${JSON.stringify(photos, null, 2)}\n`)
  return { count: photos.length, written }
}

export default function photoManifest() {
  let root = process.cwd()
  let queue = Promise.resolve()

  const enqueueBuild = () => {
    const run = queue.then(() => buildManifest(root))
    queue = run.then(
      () => {},
      () => {},
    )
    return run
  }

  return {
    name: 'photo-manifest',

    configResolved(config) {
      root = config.root
    },

    async buildStart() {
      const { count, written } = await enqueueBuild()
      console.log(
        `[photo-manifest] generated manifest with ${count} photo(s), ${written} new preview(s)`,
      )
    },

    configureServer(server) {
      const dir = join(root, PHOTO_DIR)
      const regenerate = (file) => {
        // Ignore the manifest and generated previews so writes do not loop.
        if (basename(file) === MANIFEST_NAME || isThumbPath(file)) return
        enqueueBuild()
          .then(({ count, written }) => {
            console.log(
              `[photo-manifest] regenerated manifest with ${count} photo(s), ${written} new preview(s)`,
            )
            server.ws.send({ type: 'full-reload' })
          })
          .catch((err) => {
            console.warn(`[photo-manifest] regenerate failed: ${err.message}`)
          })
      }

      server.watcher.add(dir)
      server.watcher.on('add', regenerate)
      server.watcher.on('unlink', regenerate)
    },
  }
}
