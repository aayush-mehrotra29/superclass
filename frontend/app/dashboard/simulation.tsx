'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from './icons';
import { useLibrary, sizeLabel, type Source } from './library';
import { Radar, ResponseChart, responseNames, responseValues } from './simulation-charts';
const BrainViewer=dynamic(()=>import('./brain-viewer'), {ssr:false, loading:()=> <div className="cortex-canvas"><span className="brain-status">Loading 3D viewer…</span></div>});
const formatTime=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
const segments=[['Opening context',0,60],['The shift to industry',60,130],['Inventions and innovators',130,220],['Connecting the ideas',220,300]] as const;

function SourceDetail({ source }: { source?:Source }) {
  const [content,setContent]=useState('');
  const [url,setUrl]=useState('');
  useEffect(()=> {
    let cancelled=false;
    setContent(source?.text || ''); setUrl('');
    if(source?.kind === 'text' && source.file) source.file.text().then(value=>{if(!cancelled) setContent(value.slice(0,100000));}).catch(()=>{if(!cancelled) setContent('This text file could not be read.');});
    const objectUrl=source?.file ? URL.createObjectURL(source.file):'';
    setUrl(objectUrl);
    return ()=>{cancelled=true;if(objectUrl) URL.revokeObjectURL(objectUrl);};
  },[source]);
  if(!source) return null;
  return <div className="selected-source-detail">
    <div><span className="eyebrow">SELECTED SOURCE</span><span className="mono muted">{source.kind.toUpperCase()}{source.size ? ` / ${sizeLabel(source.size)}`:''}</span></div>
    <strong>{source.name}</strong>
    {content && <p className="source-text-preview">{content}</p>}
    {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-external">Open source link <Icon name="arrow" /></a>}
    {url && <a href={url} download={source.name} className="source-external">Download original <Icon name="arrow" /></a>}
  </div>;
}
export default function SimulationView({ id }: {id:string}) {
  const {records, loaded, error}=useLibrary();
  const record=records.find(item=>item.id===id);
  const [time,setTime]=useState(65);
  const [playing,setPlaying]=useState(false);
  const [selected,setSelected]=useState(0);
  const [view,setView]=useState('Lateral');
  const [reset,setReset]=useState(0);
  const [overlay,setOverlay]=useState(true);
  const [tab,setTab]=useState('Overview');
  const [metric,setMetric]=useState(0);
  const demo=!!record?.demo;
  useEffect(()=>{setTime(65);setPlaying(false);setSelected(0);setTab('Overview');},[id]);
  useEffect(()=> {
    if(!playing || !demo) return;
    const timer=setInterval(()=>setTime(value=>{ if(value>=300){setPlaying(false);return 300;}return value+1;}),1000);
    return ()=>clearInterval(timer);
  },[playing,demo]);
  if(!record && !loaded) return <div className="studio-loading">Opening simulation…</div>;
  if(!record) return <div className="studio-home"><h1>Simulation not found</h1><p>{error || 'This draft is not saved in this browser.'}</p><Link className="studio-button" href="/dashboard">Back to Home</Link></div>;
  const values=responseValues(time);
  const source=record.sources[selected];
  return <div className="simulation-page">
    <header className="simulation-topbar"><Link href="/dashboard/simulations">Simulations</Link><span>/</span><span className="simulation-breadcrumb">{record.title}</span><span className="state-label">{demo?'Example preview':'Draft'}</span></header>
    <div className="simulation-grid">
      <section className="lesson-column" aria-label="Lesson and sources">
        <div className="panel-kicker"><span className="eyebrow">SOURCE PREVIEW</span><span className="mono muted">{String(selected+1).padStart(2,'0')} / {String(record.sources.length).padStart(2,'0')}</span></div>
        <div className="source-placeholder"><div><span className="placeholder-icon"><Icon name={source?.kind === 'link' ? 'link' : source?.kind || 'video'} /></span><span>{source?.kind === 'video' ? 'Video' : source?.kind === 'audio' ? 'Audio' : 'Source'} preview</span><small>{source?.name}</small><span className="mono placeholder-note">MEDIA PLACEHOLDER</span></div></div>
        <div className="source-timebar"><button className="studio-icon-button" disabled={!demo} aria-label={playing?'Pause preview timeline':'Play preview timeline'} onClick={()=>{if(time>=300)setTime(0);setPlaying(value=>!value);}}><Icon name={playing?'pause':'play'} /></button><span className="mono">{demo?formatTime(time):'—:—'}</span><input type="range" aria-label="Simulation timeline" min="0" max="300" step="1" value={demo?time:0} disabled={!demo} onChange={event=>setTime(Number(event.target.value))}/><span className="mono muted">{demo?'05:00':'—:—'}</span></div>
        <h1>{record.title}</h1>
        <p className="lesson-description">{demo ? (id === 'cold-war' ? 'A lesson on the events, ideas, and decisions that shaped the Cold War.' : 'Explore the people, inventions, and ideas behind the shift from hand production to mechanized industry.') : `${record.sources.length} source${record.sources.length===1?'':'s'} saved for this lesson. Your materials are ready to connect to a model run.`}</p>
        <div className="source-switcher" aria-label="Lesson sources">{record.sources.map((item,i)=><button className="source-chip" key={item.id} aria-pressed={selected===i} onClick={()=>setSelected(i)}><Icon name={item.kind}/><span>{item.name}</span></button>)}</div>
        <SourceDetail source={source}/>
      </section>
      <aside className="analysis-column" aria-label="Neural and categorical analysis">
        <section className="cortex-panel">
          <div className="panel-heading"><div><span className="eyebrow">NEURAL RESPONSE</span><h2>Brain activity</h2></div><span className="mono panel-format">fMRI</span></div>
          <div className="cortex-toolbar"><div className="segmented" aria-label="Brain view">{['Lateral','Anterior','Superior'].map(option=><button key={option} aria-pressed={view===option} onClick={()=>setView(option)}>{option}</button>)}</div><button className="studio-icon-button" title="Reset brain view" aria-label="Reset brain view" onClick={()=>setReset(value=>value+1)}><Icon name="reset" /></button></div>
          <BrainViewer time={time} preview={demo && overlay} view={view} reset={reset}/>
          <div className="cortex-legend"><span className="mono">DRAG TO ROTATE</span>{demo && <label><input type="checkbox" checked={overlay} onChange={event=>setOverlay(event.target.checked)}/>Example overlay</label>}</div>
          <p className="panel-note">{demo ? 'Illustrative anatomy and overlay. Not an fMRI prediction or a registered cortical surface.' : 'Anatomical preview. Cortical predictions will appear here when model output is connected.'}</p>
        </section>
        <section className="category-panel"><div className="panel-heading"><div><span className="eyebrow">CATEGORICAL RESPONSE</span><h2>Learning response</h2></div><span className="state-label">{demo?'Illustrative':'Not available'}</span></div><div className="category-body"><Radar time={time} demo={demo}/><dl>{responseNames.map((name,i)=><div key={name}><dt>{name}</dt><dd className="mono">{demo?values[i]:'—'}{demo && <small>/100</small>}</dd></div>)}</dl></div><p className="panel-note">{demo ? 'Example scores for the interface, not validated student outcomes.' : 'The current neural model does not provide these categorical scores.'}</p></section>
      </aside>
    </div>
    <section className="simulation-details" aria-label="Detailed simulation data">
      <div className="details-tabbar"><div role="tablist" aria-label="Simulation details">{['Overview','Segments','Sources'].map(name=><button role="tab" aria-selected={tab===name} aria-controls={`panel-${name.toLowerCase()}`} id={`tab-${name.toLowerCase()}`} tabIndex={tab===name?0:-1} key={name} onClick={()=>setTab(name)} onKeyDown={event=>{const names=['Overview','Segments','Sources'];let next=names.indexOf(name);if(event.key==='ArrowRight')next=(next+1)%3;else if(event.key==='ArrowLeft')next=(next+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();setTab(names[next]);document.getElementById(`tab-${names[next].toLowerCase()}`)?.focus();}}>{name}{name === 'Sources' && <span>{record.sources.length}</span>}</button>)}</div><span className="mono muted">{demo?'ILLUSTRATIVE DATA':'AWAITING MODEL OUTPUT'}</span></div>
      <div role="tabpanel" id={`panel-${tab.toLowerCase()}`} aria-labelledby={`tab-${tab.toLowerCase()}`}>
        {tab==='Overview' && <><div className="chart-heading"><div><h2>Response over time</h2><p>{demo?'Select a moment to inspect the example response.':'Your lesson timeline and supported outputs will appear here.'}</p></div><label className="metric-select"><span className="workspace-sr-only">Chart response category</span><select value={metric} onChange={event=>setMetric(Number(event.target.value))}>{responseNames.map((name,i)=><option value={i} key={name}>{name}</option>)}</select></label></div><ResponseChart time={time} demo={demo} metric={metric} onTime={setTime}/><div className="output-summary"><div><span className="eyebrow">CORTICAL OUTPUT</span><strong>{demo?'Preview only':'Not connected'}</strong><small>fMRI response surface</small></div><div><span className="eyebrow">EEG FEATURES</span><strong>Awaiting output</strong><small>Channel means & log-variance</small></div><div><span className="eyebrow">SOURCE COVERAGE</span><strong>{record.sources.length} sources</strong><small>{demo?'Example materials':'Saved in this browser'}</small></div></div></>}
        {tab==='Segments' && <div className="table-scroll"><table className="sim-table segment-table"><thead><tr><th>Segment</th><th>Time range</th><th>Attention</th><th>Comprehension</th><th>Status</th></tr></thead><tbody>{demo && segments.map(([name,start,end])=><tr key={name}><td><button onClick={()=>{setTime(start);setTab('Overview');}}>{name}</button></td><td className="mono">{formatTime(start)} – {formatTime(end)}</td><td className="mono">{responseValues(start)[0]}</td><td className="mono">{responseValues(start)[2]}</td><td><span className="state-label">Illustrative</span></td></tr>)}</tbody></table>{!demo && <p className="empty-list">No segment results yet. Your source files are saved.</p>}</div>}
        {tab==='Sources' && <div className="source-detail-list">{record.sources.map((item,i)=><button key={item.id} onClick={()=>{setSelected(i);window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}><Icon name={item.kind}/><span><strong>{item.name}</strong><small>{item.kind}{item.size?` · ${sizeLabel(item.size)}`:''}</small></span><Icon name="arrow"/></button>)}</div>}
      </div>
    </section>
  </div>;
}
