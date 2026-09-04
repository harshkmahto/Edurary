import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// --- Reusable Components ---

const MainButton = ({ children, link, className = '' }) => {
  return (
    <a href={link} className={`main-button ${className}`}>
      {children}
    </a>
  );
};

const SquareText = ({ children, className = '' }) => {
  return (
    <div className={`square-text ${className}`}>
      <span className="square-decoration"></span>
      {children}
    </div>
  );
};

// --- Main About Page ---

const About = () => {
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Heading word-by-word highlight
    const heading = headingRef.current;
    if (heading) {
      const words = heading.textContent.split(' ');
      heading.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
      const wordSpans = heading.querySelectorAll('.word');
      gsap.fromTo(wordSpans,
        { color: '#444', opacity: 0.3 },
        {
          color: '#f0e6d0',
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Description word-by-word highlight
    const desc = descriptionRef.current;
    if (desc) {
      const words = desc.textContent.split(' ');
      desc.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
      const wordSpans = desc.querySelectorAll('.word');
      gsap.fromTo(wordSpans,
        { color: '#777', opacity: 0.2 },
        {
          color: '#d4b8a0',
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          scrollTrigger: {
            trigger: desc,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Video width animation (700px -> 900px on scroll)
    if (videoRef.current) {
      gsap.fromTo(videoRef.current,
        { width: '700px' },
        {
          width: '900px',
          duration: 0.8,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: videoRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    // Cards: left (card1) tilted left, right (card2) tilted right, left (card3) tilted left
    // On scroll they straighten to 0deg and center
    const cards = [
      { ref: card1Ref, initialRotate: -10, x: -80 },
      { ref: card2Ref, initialRotate: 10, x: 80 },
      { ref: card3Ref, initialRotate: -8, x: -60 }
    ];

    cards.forEach(({ ref, initialRotate, x }) => {
      if (ref.current) {
        gsap.fromTo(ref.current,
          { rotate: initialRotate, x: x },
          {
            rotate: 0,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top bottom',
              end: 'top center',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 ref={headingRef} className="hero-title">Digital Library</h1>
          <p ref={descriptionRef} className="hero-description">
            The revolution of library digitally with e-book
          </p>
          <MainButton link="/auth/signin" className="hero-button">
            Let's Connect
          </MainButton>
        </div>
      </section>

      {/* Auto-scroll horizontal bar */}
      <section className="scroll-bar">
        <div className="scroll-track">
          <span>Books</span>
          <span>Courses</span>
          <span>Tests</span>
          <span>Study Material</span>
          <span>Magazines</span>
          <span>E-books</span>
          <span>Journals</span>
          <span>Articles</span>
          <span>Books</span>
          <span>Courses</span>
          <span>Tests</span>
          <span>Study Material</span>
          <span>Magazines</span>
          <span>E-books</span>
          <span>Journals</span>
          <span>Articles</span>
        </div>
      </section>

      {/* SquareText + About Edurary */}
      <section className="about-edurary">
        <SquareText>About</SquareText>
        <div className="about-text">
          <p>
            At Edurary, you can read a lot of e-books and courses available and tests for students.
            It's a digital library designed for the modern learner.
          </p>
          <p className="highlight-effect">
            Discover, learn, and grow with our vast collection.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div ref={videoRef} className="video-wrapper">
          <video controls src="https://www.w3schools.com/html/mov_bbb.mp4" />
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <h2 className="vision-title">Vision of Edurary</h2>
        <p className="vision-text">
          Its digital library so vision provide books for digital internet world.
          Empower every student with instant access to knowledge.
        </p>
        <div className="vision-cards">
          {/* Card 1: Books - left tilted */}
          <div ref={card1Ref} className="vision-card card-left">
            <div className="card-image">
              <img src="https://picsum.photos/seed/books/300/200" alt="Books" />
            </div>
            <div className="card-name">Books</div>
            <p>Multiple people trying to search — this is the best platform.</p>
          </div>

          {/* Card 2: Courses - right tilted */}
          <div ref={card2Ref} className="vision-card card-right">
            <div className="card-image">
              <img src="https://picsum.photos/seed/courses/300/200" alt="Courses" />
            </div>
            <div className="card-name">Courses</div>
            <p>Structured learning paths with expert guidance.</p>
          </div>

          {/* Card 3: Tests - left tilted */}
          <div ref={card3Ref} className="vision-card card-left">
            <div className="card-image">
              <img src="https://picsum.photos/seed/tests/300/200" alt="Tests" />
            </div>
            <div className="card-name">Tests</div>
            <p>Assess your knowledge with interactive quizzes.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Reset and base */
        .about-page {
          background: #0a0a0a;
          color: #f0e6d0;
          font-family: 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
          padding: 0;
          margin: 0;
        }

        /* Hero */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 40%, #3a1c1a 0%, #1a0b0a 60%, #000000 100%);
          text-align: center;
          padding: 2rem;
        }
        .hero-content {
          max-width: 900px;
        }
        .hero-title {
          font-size: clamp(2.5rem, 10vw, 5rem);
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 1rem;
          color: #f0e6d0;
          text-shadow: 0 0 30px rgba(180, 60, 40, 0.4);
        }
        .hero-description {
          font-size: clamp(1rem, 3vw, 1.8rem);
          margin-bottom: 2rem;
          color: #d4b8a0;
          font-weight: 300;
        }
        .hero-button {
          display: inline-block;
          background: #b84a3a;
          color: #fff;
          padding: 0.9rem 2.8rem;
          border-radius: 40px;
          font-size: 1.2rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(180, 60, 40, 0.3);
          border: 1px solid rgba(255, 200, 150, 0.2);
        }
        .hero-button:hover {
          background: #d45a48;
          transform: scale(1.05);
          box-shadow: 0 12px 30px rgba(180, 60, 40, 0.5);
        }

        /* Scroll bar */
        .scroll-bar {
          background: #111;
          padding: 0.8rem 0;
          border-top: 1px solid #2a1a18;
          border-bottom: 1px solid #2a1a18;
          overflow: hidden;
          white-space: nowrap;
        }
        .scroll-track {
          display: inline-block;
          animation: scrollHoriz 18s linear infinite;
          font-size: 1.3rem;
          font-weight: 400;
          letter-spacing: 2px;
          color: #c0a088;
        }
        .scroll-track span {
          margin: 0 2.5rem;
          display: inline-block;
        }
        @keyframes scrollHoriz {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* SquareText + About */
        .about-edurary {
          max-width: 1000px;
          margin: 4rem auto;
          padding: 0 2rem;
        }
        .square-text {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 2.5rem;
          font-weight: 600;
          color: #d4b8a0;
          margin-bottom: 1.5rem;
        }
        .square-decoration {
          display: inline-block;
          width: 20px;
          height: 20px;
          background: #b84a3a;
          transform: rotate(45deg);
          border-radius: 4px;
        }
        .about-text {
          font-size: 1.3rem;
          line-height: 1.8;
          color: #c5b0a0;
          border-left: 4px solid #b84a3a;
          padding-left: 2rem;
        }
        .about-text .highlight-effect {
          margin-top: 1rem;
          font-weight: 300;
          font-style: italic;
          color: #e0c8b8;
        }

        /* Video */
        .video-section {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem 1rem;
          background: #0d0d0d;
        }
        .video-wrapper {
          width: 700px;
          max-width: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          border: 1px solid #2a1a18;
        }
        .video-wrapper video {
          width: 100%;
          display: block;
        }

        /* Vision Section */
        .vision-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5rem 2rem 8rem;
        }
        .vision-title {
          font-size: 2.8rem;
          font-weight: 600;
          color: #f0e6d0;
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: 1px;
        }
        .vision-text {
          text-align: center;
          font-size: 1.2rem;
          max-width: 700px;
          margin: 0 auto 4rem;
          color: #b8a090;
          line-height: 1.7;
        }
        .vision-cards {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 3rem;
        }
        .vision-card {
          background: #121212;
          border: 2px dotted #4a2a22;
          border-radius: 24px;
          padding: 1.8rem 1.5rem 2rem;
          width: 280px;
          text-align: center;
          transition: transform 0.2s;
          backdrop-filter: blur(2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
          will-change: transform;
        }
        .vision-card .card-image {
          width: 100%;
          height: 180px;
          overflow: hidden;
          border-radius: 16px;
          margin-bottom: 1rem;
          background: #1e1e1e;
          border: 1px solid #2a1a18;
        }
        .vision-card .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .vision-card .card-name {
          font-size: 1.6rem;
          font-weight: 600;
          color: #e8d4c0;
          margin-bottom: 0.5rem;
        }
        .vision-card p {
          color: #a09080;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* Card initial tilts - will be animated by GSAP */
        .card-left {
          transform: rotate(-10deg) translateX(-80px);
        }
        .card-right {
          transform: rotate(10deg) translateX(80px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .video-wrapper {
            width: 100% !important;
          }
          .vision-card {
            width: 100%;
            max-width: 340px;
          }
          .card-left,
          .card-right {
            transform: rotate(0) translateX(0) !important;
          }
          .about-text {
            padding-left: 1rem;
            font-size: 1.1rem;
          }
          .square-text {
            font-size: 2rem;
          }
          .vision-title {
            font-size: 2.2rem;
          }
        }
        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .hero-button {
            padding: 0.7rem 2rem;
            font-size: 1rem;
          }
          .scroll-track {
            font-size: 1rem;
          }
          .scroll-track span {
            margin: 0 1.2rem;
          }
        }

        /* word highlight base */
        .word {
          display: inline-block;
          transition: color 0.3s;
        }
      `}</style>
    </div>
  );
};

export default About;