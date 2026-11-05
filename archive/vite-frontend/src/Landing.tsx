import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Play } from 'lucide-react';
import superclassMark from './assets/superclass-mark.svg';
import workspacePreview from './assets/workspace-preview.png';
import NeuralField from './NeuralField';
import './landing.css';
import './save-inspired.css';

type LandingProps = { onEnter: () => void };
type SystemKey = 'source' | 'paths' | 'evidence';

const systems: { key: SystemKey; index: string; label: string; title: string; detail: string }[] = [
  { key: 'source', index: '01', label: 'Lesson source', title: 'Begin with the lesson you already teach.', detail: 'Bring a short video, transcript, and questions into one working space. Every observation can point back to the material that produced it.' },
  { key: 'paths', index: '02', label: 'Learner paths', title: 'Explore different starting points.', detail: 'Run simulated learners with varied prior knowledge and inspect the actions, attempts, and explanations along each path.' },
  { key: 'evidence', index: '03', label: 'Evidence trail', title: 'Keep the reasoning visible.', detail: 'Review findings beside their source passages, compare lesson versions, and decide what still needs human validation.' },
];

const steps = [
  { number: '01 / PREPARE', title: 'Bring a lesson', detail: 'Add a short video, transcript, and assessment questions.' },
  { number: '02 / EXPLORE', title: 'Run simulations', detail: 'See how varied learner profiles move through the material.' },
  { number: '03 / REVISE', title: 'Follow the evidence', detail: 'Inspect source-linked hypotheses before making a change.' },
];

function SystemVisual({ selected }: { selected: SystemKey }) {
  if (selected === 'source') return <div className="landing-visual-screen landing-visual-source" key={selected}>
    <div className="landing-visual-top"><span>LESSON / 01</span><span>00:00 — 04:32</span></div>
    <div className="landing-source-video"><div className="landing-source-orbit"><span>superclass</span></div><span className="landing-source-play"><Play size={17} fill="currentColor" /></span></div>
    <div className="landing-source-timeline"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
    <div className="landing-source-lines"><i/><i/><i/></div>
  </div>;
  if (selected === 'paths') return <div className="landing-visual-screen landing-visual-paths" key={selected}>
    <div className="landing-visual-top"><span>LEARNER TRAJECTORIES</span><span>ILLUSTRATIVE</span></div>
    <div className="landing-paths-grid">
      {['A', 'B', 'C', 'D'].map((profile, index) => <div className="landing-path-row" key={profile}><span>PROFILE {profile}</span><div className="landing-path-track"><i/><i/><i/><i/><b style={{ left: `${54 + index * 10}%` }}/></div><strong>{['Revisit', 'Advance', 'Question', 'Revise'][index]}</strong></div>)}
    </div>
    <div className="landing-paths-footer"><span>Different starting points</span><span>Different routes through the same lesson</span></div>
  </div>;
  return <div className="landing-visual-screen landing-visual-evidence" key={selected}>
    <div className="landing-visual-top"><span>FINDING / 01</span><span>SOURCE LINKED</span></div>
    <div className="landing-evidence-grid"><div><small>OBSERVATION</small><strong>A step may need a clearer bridge.</strong><p>Several simulated paths pause after the concept is introduced.</p><span>Hypothesis · Needs review</span></div><div><small>SOURCE PASSAGE</small><div className="landing-evidence-lines"><i/><i/><i/><i className="highlight"/><i/><i/></div><span>Transcript · 02:18</span></div></div>
    <div className="landing-evidence-foot"><Check size={14}/> Traceable to the source material</div>
  </div>;
}

export default function Landing({ onEnter }: LandingProps) {
  const [selected, setSelected] = useState<SystemKey>('source');
  const activeSystem = systems.find(system => system.key === selected)!;

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.landing [data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <div className="landing"><div className="landing-stage">
    <header className="landing-header">
      <a className="landing-brand" href="#top" aria-label="superclass home"><img src={superclassMark} alt=""/><span>superclass</span></a>
      <nav className="landing-nav" aria-label="Landing navigation"><a href="#approach">Approach</a><a href="#inside-superclass">Workspace</a><a href="#method">How it works</a></nav>
      <button className="landing-header-cta" type="button" onClick={onEnter}>Open workspace <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true"/></button>
    </header>

    <main id="top">
      <section className="landing-hero" aria-labelledby="landing-heading">
        <div className="landing-hero-copy" data-reveal><span className="landing-kicker"><i/> LESSON SIMULATION WORKSPACE</span><h1 id="landing-heading">See how a <span className="pixel-accent">lesson</span><br/>could land.</h1><p>Explore how different learners might move through your material, then trace every finding back to the lesson before you revise.</p><div className="landing-hero-actions"><button className="landing-primary" type="button" onClick={onEnter}>Explore the workspace <ArrowRight size={17}/></button><a href="#approach">Learn how it works <ArrowRight size={16}/></a></div></div>
        <div className="landing-hero-art"><div className="landing-art-caption landing-art-caption--left">SIMULATED LEARNING SIGNAL<br/>01 / 03</div><NeuralField/><div className="landing-art-caption landing-art-caption--right">SOURCE → PATHS → EVIDENCE<br/>ILLUSTRATIVE VISUALIZATION</div><div className="landing-art-crosshair landing-art-crosshair--left">+</div><div className="landing-art-crosshair landing-art-crosshair--right">+</div><div className="landing-hero-window"><div className="landing-hero-window-bar"><span className="landing-window-dots"><i/><i/><i/></span><span>superclass / workspace</span><span>LESSON / 01</span></div><img src={workspacePreview} alt="A real superclass lesson workspace showing sections, simulated trajectories, and evidence"/></div></div>
        <div className="landing-hero-bottom"><span>SUPERCLASS / RESEARCH PROTOTYPE</span><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div>
      </section>

      <section className="landing-intro" id="approach" aria-labelledby="landing-intro-heading"><div className="landing-section-label" data-reveal>01 / THE APPROACH</div><div className="landing-intro-main" data-reveal><h2 id="landing-intro-heading">A closer look at the moment <span className="pixel-accent">learning</span> happens.</h2><div><p>superclass gives educators and curriculum teams a way to explore a lesson before it reaches a classroom. Simulated learners reveal possible points of confusion, curiosity, and progress.</p><p>Each path is an inspectable hypothesis. The source stays in view, and human validation stays part of the process.</p></div></div></section>

      <section className="landing-platform" id="inside-superclass" aria-labelledby="landing-platform-heading"><div className="landing-platform-head" data-reveal><span className="landing-section-label">02 / INSIDE SUPERCLASS</span><h2 id="landing-platform-heading">From source to <span className="pixel-accent">insight</span>,<br/>in one workspace.</h2></div><div className="landing-system-tabs" role="tablist" aria-label="Explore superclass features">{systems.map(system => <button key={system.key} type="button" role="tab" id={`landing-tab-${system.key}`} aria-selected={selected === system.key} aria-controls="landing-system-panel" className={selected === system.key ? 'is-selected' : ''} onClick={() => setSelected(system.key)}><span>{system.index}</span>{system.label}</button>)}</div><div className="landing-system-panel" id="landing-system-panel" role="tabpanel" aria-labelledby={`landing-tab-${selected}`}><div className="landing-system-visual"><SystemVisual selected={selected}/><span className="landing-system-visual-note">CONCEPTUAL PRODUCT VIEW / NOT MEASURED LEARNER DATA</span></div><div className="landing-system-copy" key={selected}><span>{activeSystem.index} / {activeSystem.label.toUpperCase()}</span><h3>{activeSystem.title}</h3><p>{activeSystem.detail}</p><button type="button" onClick={onEnter}>Open workspace <ArrowUpRight size={17}/></button></div></div></section>

      <section className="landing-preview" aria-label="superclass workspace preview" data-reveal><div className="landing-preview-head"><span>THE ACTUAL WORKSPACE</span><span>Synthetic demo / paper bridge lesson</span></div><div className="landing-preview-frame"><img src={workspacePreview} alt="superclass lesson workspace with lesson sections, simulated trajectories, and an evidence panel" loading="lazy"/></div></section>

      <section className="landing-method" id="method" aria-labelledby="landing-method-heading"><div className="landing-method-heading" data-reveal><span className="landing-section-label">03 / THE WORKFLOW</span><h2 id="landing-method-heading">Make the next revision<br/>more <span className="pixel-accent">informed.</span></h2></div><div className="landing-method-steps">{steps.map(step => <div className="landing-method-step" key={step.number} data-reveal><span>{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p><ArrowUpRight size={19} strokeWidth={1.5}/></div>)}</div><div className="landing-final" data-reveal><span>Bring a lesson you already teach.</span><button type="button" onClick={onEnter}>Open superclass <ArrowRight size={18}/></button></div></section>
    </main>

    <footer className="landing-footer"><a className="landing-brand" href="#top"><img src={superclassMark} alt=""/><span>superclass</span></a><p>Simulated findings are hypotheses, not validated predictions.</p><span>© 2026 SUPERCLASS</span></footer>
  </div></div>;
}
