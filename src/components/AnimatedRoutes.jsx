import React, { useEffect, useRef, useState } from 'react'
import { Routes, useLocation } from 'react-router-dom'

const PAGE_ANIMATIONS = new Set(['page-out', 'page-in'])

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// html { scroll-behavior: smooth } would animate scrollTo(0, 0). The gallery
// mounts while that animation is still running, so the browser treats the
// first rows as off-screen and never loads them until the next user scroll.
function scrollToTop() {
  const html = document.documentElement
  const previous = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  html.style.scrollBehavior = previous
}

function AnimatedRoutes({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [phase, setPhase] = useState('idle')
  const pendingLocation = useRef(null)

  useEffect(() => {
    if (location.key === displayLocation.key) return

    if (location.pathname === displayLocation.pathname) {
      setDisplayLocation(location)
      return
    }

    if (prefersReducedMotion()) {
      setDisplayLocation(location)
      scrollToTop()
      return
    }

    pendingLocation.current = location
    setPhase('out')
  }, [location, displayLocation])

  const handleAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return
    if (!PAGE_ANIMATIONS.has(event.animationName)) return

    if (phase === 'out' && pendingLocation.current) {
      setDisplayLocation(pendingLocation.current)
      pendingLocation.current = null
      scrollToTop()
      setPhase('in')
      return
    }

    if (phase === 'in') {
      setPhase('idle')
    }
  }

  const phaseClass = phase === 'idle' ? '' : ` page-transition--${phase}`

  return (
    <div
      className={`page-transition${phaseClass}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <Routes location={displayLocation}>{children}</Routes>
    </div>
  )
}

export default AnimatedRoutes
