'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import CloudField from './CloudField';

const tabs = ['Home', 'About', 'Product'] as const;
type Tab = typeof tabs[number];

function Mark({ className = '' }: { className?: string }) {
  return <Image className={className} src="/superclass-mark.svg" alt="" width={24} height={24} priority />;
}

export default function Home() {
  const [active, setActive] = useState<Tab>('Home');
  const [rotation, setRotation] = useState(0);
  const [logoSpin, setLogoSpin] = useState(0);
  const nav = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLogoSpin(value => value + 1), 25_000);
    return () => window.clearTimeout(timer);
  }, [logoSpin]);

  function select(tab: Tab) {
    if (tab === active) return;
    setActive(tab);
    setRotation(value => value + 360);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    select(tabs[next]);
    nav.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }

  return <div className="site-shell">
    <aside className="sidebar">
      <a className="brand" href="#home" aria-label="superclass home" onClick={event => { event.preventDefault(); setLogoSpin(value => value + 1); select('Home'); }}>
        <span key={logoSpin} className={`brand-symbol${logoSpin > 0 ? ' is-spinning' : ''}`} aria-hidden="true"><Mark className="brand-mark" /></span><span>superclass</span>
      </a>
      <div ref={nav} className="site-tabs" role="tablist" aria-label="Main navigation" style={{ '--active': tabs.indexOf(active), '--turn': `${rotation}deg` } as CSSProperties}>
        <span className="tab-marker" aria-hidden="true" />
        {tabs.map((tab, index) => <button key={tab} id={`tab-${tab.toLowerCase()}`} role="tab" aria-selected={active === tab} aria-controls="page-panel" tabIndex={active === tab ? 0 : -1} onClick={() => select(tab)} onKeyDown={event => onKey(event, index)}>{tab}</button>)}
      </div>
    </aside>

    <main id="page-panel" className="page-panel" role="tabpanel" aria-labelledby={`tab-${active.toLowerCase()}`} tabIndex={-1}>
      {active === 'Home' && <article className="home-article">
        <button type="button" className="demo-button"><span className="status-dot" aria-hidden="true" />WATCH THE DEMO VIDEO</button>
        <h1><Mark className="headline-mark" />superclass is advancing the frontier of brain world models and building the future of student simulation.</h1>
        <Link className="get-started" href="/dashboard">GET STARTED</Link>

        <figure className="neural-scene" aria-label="White neural fibers, signals and numbers moving over a blue cloud field">
          <CloudField />
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/media/neural-still.svg" />
            {/* Native SVG animation stays self-contained and clips inside this frame. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="neural-overlay" src="/media/neural-bloom.svg" alt="" width="960" height="640" />
          </picture>
        </figure>

        <div className="article-copy">
          <h2>The learning simulation company</h2>
          <p>Today’s lessons are built blind. Teachers pour hours into content and only learn what didn’t land after students are already lost: on the test, in the grades, in the silence of a confused room. Engagement analytics measure clicks, not cognition. LLM-based tools judge whether something is “clear” by reading it the way a language model does, not the way a student’s brain does.</p>
          <p>We believe the path to better learning runs through the brain itself. We’re building toward a brain world model that can help explain how students respond to lesson content: where attention rises, where it drifts, where confusion sets in, and what gets understood. Our goal is to give educators a way to simulate how a classroom might learn before they teach.</p>
          <p>Our mission is to empower the next generation of educators, and through them, the next generation of students. We believe that within this decade, every lesson will be tested on a simulated classroom before it ever reaches a real one.</p>
        </div>
      </article>}
    </main>
  </div>;
}
