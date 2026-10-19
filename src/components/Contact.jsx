import React from 'react'
import { Link } from 'react-router-dom'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import GhostNumber from './GhostNumber'

const RESUME_URL =
  'https://docs.google.com/document/d/13MnRyka_OEvYgl3EnyZNQ9iaPzpfow7H2QxLVrufibs/edit?usp=sharing'

function Contact() {
  const sectionRef = useIntersectionObserver()

  return (
    <section id="contact" className="section" ref={sectionRef}>
      <GhostNumber value="02" speed={0.22} />
      <div className="grid">
        <div className="section-header">
          <span className="section-header__label">[ Contact ]</span>
          <span className="section-header__index">002 / 002</span>
        </div>

        <div className="contact__inner reveal">
          <h2 className="contact__cta">Let&rsquo;s build something.</h2>

          <a className="contact__email" href="mailto:kevinjia05@gmail.com">
            kevinjia05@gmail.com
          </a>

          <div className="contact__socials">
            <a
              href="https://github.com/LavaToken"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/kevin-jia-4120a2193/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>

          <div className="contact__external">
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
              Resume ↗
            </a>
            <Link to="/photography">Photography →</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
