import { useCallback, useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, json, time } from './api';
import type { Finding, Item, Job, Lesson, Profile, Report, Run } from './types';

type View = 'Projects' | 'Lesson' | 'Simulation' | 'Findings' | 'Evidence';
const views: View[] = ['Projects', 'Lesson', 'Simulation', 'Findings', 'Evidence'];
const glyph: Record<View, string> = { Projects: '▦', Lesson: '▤', Simulation: '◈', Findings: '⌕', Evidence: '▥' };

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'blue' | 'amber' | 'green' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Upload({ onDone, onClose }: { onDone: (id: string, job: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([{ id: 'q1', prompt: '', options: ['', ''], correct_index: 0 }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function update(index: number, patch: Partial<Item>) { setItems(current => current.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const form = new FormData();
      form.append('title', title); form.append('transcript', transcript); form.append('assessment', JSON.stringify(items));
      if (!file) throw new Error('Choose a video.');
      form.append('video', file);
      const result = await api<{lesson: Lesson; job_id: string}>('/lessons', { method: 'POST', body: form });
      onDone(result.lesson.id, result.job_id);
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-heading" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><div><div className="eyebrow">NEW LESSON</div><h2 id="upload-heading">Add a lesson package</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
    <form onSubmit={submit} className="form-stack">
      <label>Lesson title<input required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The ideal rocket equation" /></label>
      <label>Video, 10 minutes or less<input required type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      <label>Transcript <span className="optional">optional at upload</span><textarea rows={5} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={'00:00 - 00:24 | Today we will…\n00:24 - 00:48 | Next…'} /><small>Use one timed passage per line for video linking. Untimed lines remain passage linked.</small></label>
      <div className="form-section"><div className="row between"><strong>Multiple-choice assessment</strong><button type="button" className="link-button" onClick={() => setItems([...items, { id: `q${items.length+1}`, prompt: '', options: ['', ''], correct_index: 0 }])}>+ Add item</button></div>
      {items.map((item, index) => <div className="item-editor" key={index}><label>Question {index + 1}<input required value={item.prompt} onChange={e => update(index, { prompt: e.target.value })} placeholder="What should the learner understand?" /></label><div className="option-grid">{item.options.map((option, o) => <label key={o}>Option {o + 1}<input required value={option} onChange={e => update(index, { options: item.options.map((v, i) => i === o ? e.target.value : v) })} /></label>)}</div><label>Correct option<select value={item.correct_index ?? 0} onChange={e => update(index, { correct_index: Number(e.target.value) })}>{item.options.map((_, i) => <option key={i} value={i}>Option {i + 1}</option>)}</select></label></div>)}</div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row end"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button disabled={busy} className="button primary">{busy ? 'Uploading…' : 'Analyze lesson'}</button></div>
    </form>
  </div></div>;
}

export default function App() {
  const [view, setView] = useState<View>('Projects');
  const [projects, setProjects] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [report, setReport] = useState<Report>({});
  const [job, setJob] = useState<Job | null>(null);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [assessment, setAssessment] = useState<Item[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileCount, setActiveProfileCount] = useState(12);
  const [seeds, setSeeds] = useState(3);
  const [maxActions, setMaxActions] = useState(20);
  const [maxTokens, setMaxTokens] = useState(500);
  const [maxCost, setMaxCost] = useState(5);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [conceptDraft, setConceptDraft] = useState('');
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null);
  const [parentRuns, setParentRuns] = useState<Run[]>([]);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [research, setResearch] = useState<{research_volume_mounted:boolean;internal_free_bytes:number;internal_reserve_bytes:number;numerical_execution_allowed:boolean} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const reload = useCallback(async (id?: string) => {
    const freshProjects = await api<Lesson[]>('/projects'); setProjects(freshProjects);
    if (id) {
      const [l, r, f, e, a, p] = await Promise.all([
        api<Lesson>(`/lessons/${id}`), api<Run[]>(`/simulations/${id}`),
        api<Finding[]>(`/findings/${id}`), api<Report>(`/reports/${id}`),
        api<Item[]>(`/lessons/${id}/assessment`), api<Profile[]>(`/lessons/${id}/profiles`)]);
      setLesson(l); setRuns(r); setFindings(f); setReport(e); setAssessment(a); setProfiles(p);
      setConceptDraft(l.concepts.join(', '));
      setTranscriptDraft(l.transcript.map(s => s.start == null ? s.text : `${time(s.start)} - ${time(s.end)} | ${s.text}`).join('\n'));
    }
  }, []);
  useEffect(() => { reload().catch(e => setError(String(e))); api<{research:NonNullable<typeof research>}>('/health').then(x => setResearch(x.research)).catch(() => {}); }, [reload]);
  useEffect(() => {
    if (!lesson?.parent_id) { setParentLesson(null); setParentRuns([]); return; }
    Promise.all([api<Lesson>(`/lessons/${lesson.parent_id}`), api<Run[]>(`/simulations/${lesson.parent_id}`)])
      .then(([l, r]) => { setParentLesson(l); setParentRuns(r); }).catch(e => setError(String(e)));
  }, [lesson?.parent_id]);
  useEffect(() => {
    if (view !== 'Lesson' || pendingSeek == null || !videoRef.current) return;
    const video = videoRef.current;
    const target = pendingSeek;
    const jump = () => { video.currentTime = target; video.play().catch(() => {}); setPendingSeek(null); };
    if (video.readyState >= 1) jump();
    else video.addEventListener('loadedmetadata', jump, { once: true });
    return () => video.removeEventListener('loadedmetadata', jump);
  }, [view, pendingSeek, lesson?.id]);
  useEffect(() => {
    if (!job) return;
    const source = new EventSource(`/api/jobs/${job.id}/events`);
    let finished = false;
    const refresh = () => api<Job>(`/jobs/${job.id}`).then(j => {
      if (finished) return;
      setJob(j);
      if (['complete', 'failed', 'cancelled'].includes(j.state)) { finished = true; source.close(); if (lesson) reload(lesson.id).catch(e => setError(String(e))); }
    }).catch(e => setError(String(e)));
    source.addEventListener('progress', refresh);
    source.addEventListener('queued', refresh);
    source.onerror = () => { source.close(); refresh(); };
    return () => source.close();
  }, [job?.id, lesson?.id, reload]);
  async function select(id: string, target: View = 'Lesson') { setError(''); await reload(id); setView(target); }
  function seek(value: number | null) { if (value != null) setPendingSeek(value); setView('Lesson'); }
  async function simulate() { if (!lesson) return; setBusy(true); setError(''); try { const result = await api<{job_id: string}>('/simulations', json('POST', { lesson_id: lesson.id, profiles, profile_count: activeProfileCount, seeds_per_profile: seeds, max_actions_per_run: maxActions, max_tokens_per_run: maxTokens, max_cost_usd_per_run: maxCost })); setJob(await api<Job>(`/jobs/${result.job_id}`)); } catch(e) { setError(String(e)); } finally { setBusy(false); } }
  async function makeRevision(findingId: string) { setBusy(true); setError(''); try { const revised = await api<Lesson>('/revisions', json('POST', { finding_id: findingId })); await select(revised.id, 'Lesson'); } catch(e) { setError(String(e)); } finally { setBusy(false); } }
  async function saveAssessment() { if (!lesson) return; setBusy(true); try { const revised = await api<Lesson>(`/lessons/${lesson.id}/assessment`, json('PUT', assessment)); await select(revised.id); } catch(e) { setError(String(e)); } finally { setBusy(false); } }
  async function saveTranscript() { if (!lesson) return; setBusy(true); try { const result = await api<{job_id: string;lesson:Lesson}>(`/lessons/${lesson.id}/transcript`, json('POST', { transcript: transcriptDraft })); await select(result.lesson.id); setJob(await api<Job>(`/jobs/${result.job_id}`)); } catch(e) { setError(String(e)); } finally { setBusy(false); } }
  async function saveConcepts() { if (!lesson) return; setBusy(true); try { const concepts = conceptDraft.split(',').map(x => x.trim()).filter(Boolean); const revised = await api<Lesson>(`/lessons/${lesson.id}/concepts`, json('PUT', { concepts })); await select(revised.id); } catch(e) { setError(String(e)); } finally { setBusy(false); } }
  const activeRun = runs.find(r => r.id === selectedRun) || runs[0];
  const activity = ['read_section', 'review_section', 'ask_question', 'attempt_item'].map(kind => ({ name: kind.replace('_', ' '), count: runs.reduce((n, run) => n + run.actions.filter(a => a.kind === kind).length, 0) }));

  return <div className="shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">CL</div><div><strong>Classroom Lab</strong><span>RESEARCH PROTOTYPE</span></div></div>
      <div className="nav-label">WORKSPACE</div><nav aria-label="Primary navigation">{views.map(v => <button key={v} className={`nav-item ${view === v ? 'active' : ''}`} onClick={() => setView(v)}><span className="nav-glyph">{glyph[v]}</span>{v}{v === 'Findings' && findings.length > 0 && <span className="nav-count">{findings.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-dot"/> <div><strong>Local workspace</strong><span>Evidence labels are always visible</span></div></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumb">Classroom Lab <span>/</span> {view}{lesson && view !== 'Projects' && <> <span>/</span> {lesson.title}</>}</div><div className="top-actions"><Badge tone="amber">Research prototype</Badge><button className="button primary small" onClick={() => setUploadOpen(true)}>+ New lesson</button></div></header>
      {error && <div className="alert" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
      {job && ['queued', 'running', 'failed'].includes(job.state) && <div className={`jobbar ${job.state === 'failed' ? 'failed' : ''}`}><span className="pulse"/><div><strong>{job.state === 'failed' ? 'Job failed' : job.stage === 'simulating' ? 'Running trajectories' : 'Processing lesson'}</strong><span>{job.error || `${job.stage} · ${job.progress}${job.stage === 'simulating' ? ' trajectories complete' : '%'}`}</span></div>{job.state === 'running' && <button className="link-button" onClick={async () => setJob(await api<Job>(`/jobs/${job.id}/cancel`, { method: 'POST' }))}>Cancel</button>}</div>}
      <div className="page">
      {view === 'Projects' && <><div className="page-head"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>Lessons under review</h1><p>Follow each lesson from source material to inspectable hypotheses and evidence.</p></div><button className="button primary" onClick={() => setUploadOpen(true)}>+ Add lesson</button></div>
        <div className="overview"><div><span>LESSONS</span><strong>{projects.length}</strong></div><div><span>TRAJECTORIES</span><strong>{projects.reduce((total, project) => total + (project.trajectory_count || 0), 0)}</strong></div><div><span>EVIDENCE STATUS</span><strong>Unvalidated</strong></div></div>
        {projects.length ? <div className="project-list">{projects.map(p => <button key={p.id} className="project-card" onClick={() => select(p.id)}><div className="project-icon">▤</div><div className="project-copy"><strong>{p.title}</strong><span>Version {p.version} · {p.sections.length} sections · {p.assessment.length} assessment items</span></div><Badge tone={p.status === 'ready' ? 'green' : 'amber'}>{p.status.replace('_', ' ')}</Badge><span className="arrow">→</span></button>)}</div> : <div className="empty"><div className="empty-icon">▤</div><h2>Start with a short lesson</h2><p>Upload a video and assessment. A timed transcript connects findings to the source.</p><button className="button primary" onClick={() => setUploadOpen(true)}>Add first lesson</button></div>}</>}

      {view === 'Lesson' && (lesson ? <><div className="page-head"><div><div className="eyebrow">LESSON WORKSPACE · VERSION {lesson.version}</div><h1>{lesson.title}</h1><p>Review source passages, extracted concepts and assessment coverage.</p></div><div className="head-badges"><Badge tone={lesson.status === 'ready' ? 'green' : 'amber'}>{lesson.status.replace('_', ' ')}</Badge><Badge>SHA {lesson.source_hash.slice(0, 10)}</Badge></div></div>
        {lesson.parent_id && <div className="notice"><Badge tone="blue">Revision package</Badge><span>Added explanation or checkpoint. Original video is retained; any improvement remains a hypothesis until tested with people.</span><button className="link-button" onClick={() => select(lesson.parent_id!, 'Lesson')}>Open original →</button></div>}
        <div className="lesson-grid"><div className="lesson-main"><div className="panel video-panel"><div className="panel-header"><h2>Source video</h2><span>{lesson.duration_seconds ? `${Math.round(lesson.duration_seconds)} sec` : '—'}</span></div><video ref={videoRef} controls preload="metadata" src={`/api/lessons/${lesson.id}/media`}/></div>
          <div className="panel"><div className="panel-header"><h2>Transcript & sections</h2><Badge>Source linked</Badge></div>{lesson.sections.length ? <div className="transcript-list">{lesson.sections.map(s => <button key={s.id} className="transcript-row" onClick={() => seek(s.start)}><span className="timestamp">{time(s.start)}</span><span><strong>{s.title}</strong><small>{s.text}</small>{s.added_by_revision && <Badge tone="blue">Proposed repair</Badge>}</span></button>)}</div> : <div className="panel-empty">No transcript analyzed yet.</div>}</div></div>
          <div className="lesson-side"><div className="panel"><div className="panel-header"><h2>Concepts</h2><Badge tone={lesson.concepts_reviewed ? 'green' : 'amber'}>{lesson.concepts_reviewed ? 'Educator reviewed' : 'Review needed'}</Badge></div><p className="muted smalltext">Extracted from transcript frequency. Edit the comma-separated list to confirm it.</p><div className="chips">{lesson.concepts.length ? lesson.concepts.map(c => <span className="chip" key={c}>{c}</span>) : <span className="muted">Awaiting transcript</span>}</div><textarea rows={2} aria-label="Edit concepts" value={conceptDraft} onChange={e => setConceptDraft(e.target.value)}/><button className="button secondary full" disabled={busy || lesson.status !== 'ready'} onClick={saveConcepts}>Save reviewed concepts</button></div>
            {lesson.status === 'needs_transcript' && <div className="panel"><h2>Add transcript</h2><p className="muted smalltext">Video transcription requires a configured provider. Supply a transcript to continue now.</p><textarea rows={7} value={transcriptDraft} onChange={e => setTranscriptDraft(e.target.value)}/><button disabled={busy} className="button primary" onClick={saveTranscript}>Analyze transcript</button></div>}
            <div className="panel"><div className="panel-header"><h2>Assessment editor</h2><span>{assessment.length} items</span></div>{assessment.map((item, index) => <div className="assessment-editor" key={item.id}><label>Question {index+1}<input value={item.prompt} onChange={e => setAssessment(assessment.map((x,i) => i === index ? {...x,prompt:e.target.value} : x))}/></label>{item.options.map((option, oi) => <label key={oi}>Option {oi+1}<input value={option} onChange={e => setAssessment(assessment.map((x,i) => i === index ? {...x,options:x.options.map((v,j) => j === oi ? e.target.value : v)} : x))}/></label>)}<label>Answer key<select value={item.correct_index} onChange={e => setAssessment(assessment.map((x,i) => i === index ? {...x,correct_index:Number(e.target.value)} : x))}>{item.options.map((_, i) => <option key={i} value={i}>Option {i+1}</option>)}</select></label></div>)}<button disabled={busy} className="button secondary full" onClick={saveAssessment}>Save assessment</button><small className="muted">Answer keys are stored outside student action records.</small></div>
          </div></div></> : <EmptySelect onAdd={() => setUploadOpen(true)}/>)}

      {view === 'Simulation' && (lesson ? <><div className="page-head"><div><div className="eyebrow">EXPERIMENT COORDINATOR</div><h1>Simulated learning sessions</h1><p>Inspect scripted actions across matched profiles and seeds. These are not human participants.</p></div><button className="button primary" disabled={busy || lesson.status !== 'ready' || !profiles.length || activeProfileCount * seeds > 100} onClick={simulate}>Run {activeProfileCount} profiles × {seeds} seeds</button></div>
        <div className="notice"><Badge tone="amber">Authored assumption</Badge><span>Actions use restricted tools and exposed sections. No calibrated outcome probabilities or measured mastery changes are available.</span></div>
        <details className="panel profile-config"><summary>Configure learner profiles and run limits <span>{activeProfileCount * seeds} trajectories</span></summary><div className="profile-rows">{profiles.map((p, index) => <div className="profile-row" key={p.id}><strong>{p.name}</strong><label>Prior knowledge<select value={p.prior_knowledge} onChange={e => setProfiles(profiles.map((x,i) => i === index ? {...x,prior_knowledge:e.target.value as Profile['prior_knowledge']} : x))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Misconceptions<input value={p.misconceptions.join(', ')} onChange={e => setProfiles(profiles.map((x,i) => i === index ? {...x,misconceptions:e.target.value.split(',').map(v => v.trim()).filter(Boolean),provenance:'educator-authored'} : x))} placeholder="Comma-separated concepts" /></label></div>)}</div><div className="limit-controls"><label>Profiles to run<input type="number" min={1} max={12} value={activeProfileCount} onChange={e => setActiveProfileCount(Number(e.target.value))}/></label><label>Seeds / profile<input type="number" min={1} max={100} value={seeds} onChange={e => setSeeds(Number(e.target.value))}/></label><label>Max actions / run<input type="number" min={1} max={100} value={maxActions} onChange={e => setMaxActions(Number(e.target.value))}/></label><label>Max tokens / run<input type="number" min={0} max={10000} value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))}/></label><label>Cost ceiling / run ($)<input type="number" min={0} max={5} step="0.1" value={maxCost} onChange={e => setMaxCost(Number(e.target.value))}/></label></div><p className="footnote">Current scripted renderer uses zero tokens and zero model cost. Profiles are stored with each run for reproducibility.</p></details>
        <div className="stat-grid"><div className="stat"><span>TRAJECTORIES</span><strong>{runs.length}</strong><small>Generated, not independent people</small></div><div className="stat"><span>LEARNER PROFILES</span><strong>{new Set(runs.map(r => r.profile.id)).size}</strong><small>Authored prior knowledge</small></div><div className="stat"><span>MODEL PREDICTIONS</span><strong>Unavailable</strong><small>Awaiting validated behavioral head</small></div></div>
        {runs.length > 0 && <div className="simulation-grid"><div className="panel"><div className="panel-header"><h2>Action trace</h2><span>{runs.length} runs</span></div><div className="run-list">{runs.map(r => <button key={r.id} className={`run-row ${activeRun?.id === r.id ? 'selected' : ''}`} onClick={() => setSelectedRun(r.id)}><span className="run-avatar">{r.profile.id.slice(-2)}</span><span><strong>{r.profile.name}</strong><small>Seed {r.seed} · {r.actions.length} actions</small></span><span className="arrow">→</span></button>)}</div></div><div><div className="panel"><div className="panel-header"><h2>{activeRun?.profile.name || 'Select a run'}</h2><Badge tone="amber">Scripted</Badge></div><div className="run-meta">Prior knowledge: {activeRun?.profile.prior_knowledge} · Misconceptions: {activeRun?.profile.misconceptions.join(', ') || 'none'} · {activeRun?.tokens_used} tokens · ${activeRun?.cost_usd.toFixed(2)}</div><div className="trace">{activeRun?.actions.map((a,i) => <div className="trace-row" key={i}><div className="trace-number">{String(i+1).padStart(2,'0')}</div><div><strong>{a.kind.replace('_',' ')}</strong><p>{a.text}{a.selected_option != null && ` Option ${a.selected_option+1}.`}</p>{a.source_start != null && <button className="link-button" onClick={() => seek(a.source_start)}>Open {time(a.source_start)} ↗</button>}</div></div>)}</div></div><div className="panel chart-panel"><div className="panel-header"><h2>Agent action counts</h2><Badge tone="amber">Simulation only</Badge></div><ResponsiveContainer width="100%" height={190}><BarChart data={activity} margin={{top:8,right:8,bottom:0,left:-28}}><CartesianGrid stroke="#e8ecec" vertical={false}/><XAxis dataKey="name" tick={{fontSize:11, fill:'#687679'}}/><YAxis tick={{fontSize:11, fill:'#687679'}}/><Tooltip/><Bar dataKey="count" fill="#507e79" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div></div></div>}
        {!runs.length && <div className="empty compact"><div className="empty-icon">◈</div><h2>No trajectories yet</h2><p>Run the default profiles to create inspectable, constrained action traces.</p></div>}</> : <EmptySelect onAdd={() => setUploadOpen(true)}/>)}

      {view === 'Findings' && (lesson ? <><div className="page-head"><div><div className="eyebrow">SOURCE-LINKED REVIEW</div><h1>Findings & repairs</h1><p>Each candidate weakness points to supplied source material and carries an evidence label.</p></div><Badge tone="amber">{findings.length} hypotheses</Badge></div>
        {findings.length ? <div className="finding-list">{findings.map(f => <article className="finding-card" key={f.id}><div className="finding-top"><Badge tone="amber">{f.evidence_label}</Badge><button className="source-link" onClick={() => seek(f.source_start)}>{time(f.source_start)} · Open passage ↗</button></div><h2>{f.title}</h2><p>{f.explanation}</p><blockquote>{f.source_excerpt}</blockquote><div className="repair"><div><span className="eyebrow">PROPOSED REPAIR</span><p>{f.suggested_repair}</p></div><button disabled={busy} className="button secondary" onClick={() => makeRevision(f.id)}>Create revision →</button></div></article>)}</div> : <div className="empty compact"><div className="empty-icon">⌕</div><h2>No findings yet</h2><p>Run a simulation to generate source-linked content checks.</p></div>}</> : <EmptySelect onAdd={() => setUploadOpen(true)}/>)}

      {view === 'Evidence' && (lesson ? <><div className="page-head"><div><div className="eyebrow">EVIDENCE & REPRODUCIBILITY</div><h1>What the results support</h1><p>Model comparisons, dataset coverage and limitations stay separate from agent hypotheses.</p></div><a className="button secondary" href={`/api/reports/${lesson.id}/export`} target="_blank" rel="noreferrer">Export HTML report ↗</a></div>
        <div className="evidence-status"><div className="evidence-mark">!</div><div><div className="eyebrow">CURRENT EVIDENCE STATUS</div><h2>Behavioral prediction unavailable</h2><p>{report.prediction?.reason || 'No validated benchmark artifact is attached to this lesson.'}</p></div></div>
        {research && <div className="readiness"><span className="eyebrow">RESEARCH EXECUTION GATE</span><div><Badge tone={research.numerical_execution_allowed ? 'green' : 'amber'}>{research.numerical_execution_allowed ? 'Precheck passed' : 'Blocked'}</Badge><span>Research volume {research.research_volume_mounted ? 'mounted' : 'unmounted'} · internal free {(research.internal_free_bytes / 1024**3).toFixed(1)} GiB / {(research.internal_reserve_bytes / 1024**3).toFixed(0)} GiB reserve. A separate label and media audit is still required.</span></div></div>}
        {parentLesson && <div className="panel comparison"><div className="panel-header"><h2>Version comparison</h2><Badge tone="amber">Content hypothesis only</Badge></div><div className="comparison-cols"><div><span>ORIGINAL · V{parentLesson.version}</span><strong>{parentLesson.sections.length} sections</strong><small>{parentRuns.length} scripted trajectories</small></div><div><span>CURRENT · V{lesson.version}</span><strong>{lesson.sections.length} sections</strong><small>{runs.length} scripted trajectories</small></div></div><p className="footnote">Matched profile and seed runs can be inspected in Simulation. Action counts are generated traces, not improvement scores. Equivalent human assessment has not been conducted.</p></div>}
        <div className="evidence-grid"><div className="panel"><div className="panel-header"><h2>Predetermined comparisons</h2><Badge tone="amber">Pending</Badge></div><table><thead><tr><th>Feature block</th><th>Attention MAE</th><th>Quiz Brier</th></tr></thead><tbody>{['Training mean / progress','Content only','Content + predicted EEG','Content + TRIBE','All blocks'].map(name => <tr key={name}><td>{name}</td><td>—</td><td>—</td></tr>)}</tbody></table><p className="footnote">A dash means no score was computed. It does not indicate zero error.</p></div><div className="panel"><div className="panel-header"><h2>Claim limits</h2></div><ul className="limit-list">{(report.limitations || ['No report is available yet.']).map(x => <li key={x}>{x}</li>)}</ul><div className="brain-placeholder"><div className="brain-symbol">◎</div><div><strong>Predicted brain view pending</strong><span>Display only when a qualified TRIBE artifact exists. Never label it measured attention.</span></div></div></div></div>
        <div className="panel provenance"><div className="panel-header"><h2>Reproducibility record</h2></div><dl><div><dt>Lesson version</dt><dd>{lesson.version}</dd></div><div><dt>Source hash</dt><dd className="mono">{lesson.source_hash}</dd></div><div><dt>Content hash</dt><dd className="mono">{lesson.content_hash}</dd></div><div><dt>Analysis</dt><dd>{lesson.analysis_provenance}</dd></div><div><dt>Dataset / split</dt><dd>Not attached to this lesson</dd></div><div><dt>Human sample size</dt><dd>Not inferred from {runs.length} simulation runs</dd></div></dl></div></> : <EmptySelect onAdd={() => setUploadOpen(true)}/>)}
      </div>
    </main>
    {uploadOpen && <Upload onClose={() => setUploadOpen(false)} onDone={async (id, jobId) => { setUploadOpen(false); await select(id); setJob(await api<Job>(`/jobs/${jobId}`)); }}/ >}
  </div>;
}

function EmptySelect({ onAdd }: { onAdd: () => void }) { return <div className="empty"><div className="empty-icon">▤</div><h2>Select a lesson to continue</h2><p>Open an existing project or add a short video lesson.</p><button className="button primary" onClick={onAdd}>Add lesson</button></div>; }
