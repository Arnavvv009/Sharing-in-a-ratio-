import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';

const Slide1Illustration = () => (
  <img
    src="/assets/images/slide1-what-is-a-ratio.svg"
    alt="A ratio of 4 to 5 drawn as nine equal blocks split between two people"
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const Slide2Illustration = () => (
  <img
    src="/assets/images/slide2-add-the-parts.svg"
    alt="Adding the ratio parts to get nine, then dividing forty-five by nine to find one part"
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const Slide3Illustration = () => (
  <img
    src="/assets/images/slide3-multiply-out.svg"
    alt="Multiplying each ratio number by the value of one part to find each share"
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const Slide4Illustration = () => (
  <img
    src="/assets/images/slide4-check-it.svg"
    alt="Checking that twenty plus twenty-five adds back up to forty-five"
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const slidesData = [
  {
    title: "What a Ratio Really Means",
    body: "Robo writes the ratio 4 : 5 and reads it aloud as \u201cfour parts to five parts\u201d. A ratio compares PARTS against each other, not against the whole. Every single block is the same size \u2014 Aisha simply holds 4 of them and Ben holds 5.",
    fact: "Order matters! 4 : 5 is not the same as 5 : 4",
    nudge: "So how many equal parts is the whole jar cut into?",
    Illustration: Slide1Illustration
  },
  {
    title: "Add the Parts, Find One Part",
    body: "Step 1: ADD the ratio numbers \u2014 4 + 5 = 9, so the jar splits into 9 equal parts. Step 2: divide the total by that number \u2014 45 \u00F7 9 = 5. Now Robo knows the magic number: every single part is worth 5 sweets.",
    fact: "One part = total amount \u00F7 total parts",
    nudge: "Once you know one part, every share is just a multiplication!",
    Illustration: Slide2Illustration
  },
  {
    title: "Multiply Out Each Share",
    body: "Step 3: multiply each ratio number by the value of one part. Aisha has 4 parts, so 4 \u00D7 5 = 20 sweets. Ben has 5 parts, so 5 \u00D7 5 = 25 sweets. The person with more parts gets more sweets \u2014 that is what sharing in a ratio means.",
    fact: "Share = ratio number \u00D7 value of one part",
    nudge: "But how do we know for sure that we got it right?",
    Illustration: Slide3Illustration
  },
  {
    title: "Check It Adds Back Up",
    body: "Step 4: add every share together. 20 + 25 = 45, which matches the original total exactly. If your shares ever fail to add back to the starting amount, something went wrong \u2014 so this final check catches almost every mistake.",
    fact: "All the shares must add back to the original total",
    nudge: "Now let's go share some amounts ourselves!",
    Illustration: Slide4Illustration
  }
];

export default function StoryPhase({ onNext, speak }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const currentSlide = slidesData[slideIdx];

  useEffect(() => {
    speak(currentSlide.body);
  }, [slideIdx, speak]);

  const handleNext = () => {
    if (slideIdx < slidesData.length - 1) {
      setSlideIdx(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    if (slideIdx > 0) setSlideIdx(prev => prev - 1);
  };

  const pct = Math.round(((slideIdx + 1) / slidesData.length) * 100);
  const CurrentIllustration = currentSlide.Illustration;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', height: '100%', overflow: 'hidden' }}>
      <div className="story-header" style={{ flexShrink: 0 }}>
        <span>Slide {slideIdx + 1} of 4</span>
        <div className="story-dots">
          {slidesData.map((_, idx) => (
            <div key={idx} className={`story-dot ${idx === slideIdx ? 'story-dot--active' : ''}`} />
          ))}
        </div>
        <span>{pct}%</span>
      </div>

      <div className="progress-track" style={{ flexShrink: 0 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '16px 14px 20px 14px', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out', marginTop: '8px' }}>
        <div className="story-img-bleed" style={{ aspectRatio: '2.5', height: 'auto', maxHeight: '360px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', overflow: 'hidden', flexShrink: 0, marginLeft: '-14px', width: 'calc(100% + 28px)' }}>
          <CurrentIllustration />
        </div>

        <div className="story-content-section" style={{ paddingTop: '12px', gap: '10px' }}>
          <h2 className="story-title" style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px', lineHeight: '1.2' }}>{currentSlide.title}</h2>
          <p className="story-body" style={{ fontSize: '21px', fontWeight: '700', color: '#ece9f5', lineHeight: '1.45', marginBottom: '4px' }}>{currentSlide.body}</p>
          <div className="hint-fact-pill" style={{ alignSelf: 'flex-start', fontSize: '17px', fontWeight: '900', padding: '6px 14px', marginBottom: '4px' }}>
            ✨ {currentSlide.fact} ✨
          </div>
          <Mascot mood="idle" bubble={<span style={{ fontSize: '18px', fontWeight: '800' }}>{currentSlide.nudge}</span>} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', flexShrink: 0 }}>
        <button className="btn-nav-outline" onClick={handlePrev} disabled={slideIdx === 0} style={{ opacity: slideIdx === 0 ? 0.5 : 1, fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
          ← Previous
        </button>
        <button className="btn-nav-outline" onClick={handleNext} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
          {slideIdx < slidesData.length - 1 ? "Next ➔" : "Go to Practice ➔"}
        </button>
      </div>
    </div>
  );
}
