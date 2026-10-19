import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import SiteHeader from './components/SiteHeader'
import Header from './components/Header'
import SideNav from './components/SideNav'
import Hero from './components/Hero'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useParallax } from './hooks/useParallax'
import { prefetchPhotographyPreviews } from './photographyPrefetch'

function App() {
  const location = useLocation()
  useParallax()

  useEffect(() => {
    document.title = 'Kevin Jia — Computer Engineer'
  }, [])

  useEffect(() => {
    const run = () => prefetchPhotographyPreviews()
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(run, 200)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!location.hash) return undefined
    const id = location.hash.replace('#', '')
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.hash])

  return (
    <>
      <SiteHeader />
      <Header />
      <SideNav />
      <main>
        <Hero />
        <About />
        <Contact />
      </main>
      <Footer />
      <Analytics />
    </>
  )
}

export default App
