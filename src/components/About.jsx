import React from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import GhostNumber from './GhostNumber'

function About() {
  const sectionRef = useIntersectionObserver()

  return (
    <section id="about" className="section" ref={sectionRef}>
      <GhostNumber value="01" speed={0.22} />
      <div className="grid">
        <div className="section-header">
          <span className="section-header__label">[ About ]</span>
          <span className="section-header__index">001 / 002</span>
        </div>

        <div className="about__copy reveal">
          <h2 className="about__heading">
            Engineer who treats software like a craft.
          </h2>
          <div className="about__body">
            <p>
              I'm a Computer Science student at UC Davis with a focus
              on growth and building products people actually use. 
              Most recently, I worked as a Data Analytics Intern at Travis Credit Union, 
              a member-owned financial institution serving over 268,000 members and built to serve people instead of shareholders. 
              I care about the intersection of engineering and consumer behavior: creating products that people actually use
              and measuring the results.
            </p>
            <p>
              Outside of engineering, I work for UC Davis's Chinese American Student Association as Co-President,
              shoot street and documentary photography/videography, and build mechanical keyboards.
            </p>
          </div>
        </div>

        <div className="about__photo reveal">
          <img src="/assets/profilepic.jpg" alt="Kevin Jia portrait" />
        </div>

        <div className="about__stats reveal">
          <div className="about__stat">
            <span className="about__stat-value">4th</span>
            <span className="about__stat-label">Year — UC Davis CS</span>
          </div>
          <div className="about__stat">
            <span className="about__stat-value">San Jose</span>
            <span className="about__stat-label">California, USA</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
