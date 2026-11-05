'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type DragEvent } from 'react';
import Icon from './icons';
import { useLibrary, sizeLabel, type Source } from './library';

const extensions = '.mp4,.mov,.webm,.m4v,.mp3,.wav,.flac,.ogg,.m4a,.pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp';
function fileKind(file: File): Source['kind'] {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (['mp4','mov','webm','m4v'].includes(ext)) return 'video';
  if (['mp3','wav','flac','ogg','m4a'].includes(ext)) return 'audio';
  if (['txt','md'].includes(ext)) return 'text';
  if (['png','jpg','jpeg','webp'].includes(ext)) return 'image';
  return 'document';
}
export function SimulationList({ full = false }: { full?: boolean }) {
  const { records, error } = useLibrary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = records.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || (filter === 'Drafts' ? !item.demo : item.demo)));
  return <section className="simulation-list" aria-label="Simulations">
    <div className="list-heading"><h2>{full ? 'Your simulations' : 'Recent simulations'}</h2><span className="mono muted">{records.length.toString().padStart(2, '0')}</span></div>
    <div className="list-controls"><label className="list-search"><Icon name="search" /><input aria-label="Search simulations" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search simulations…" /></label><div className="segmented" aria-label="Filter simulations">{['All','Drafts','Examples'].map(option => <button key={option} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}</div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="table-scroll"><table className="sim-table"><thead><tr><th>Title</th><th>Sources</th><th>Status</th><th>Created</th><th><span className="workspace-sr-only">Open</span></th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><Link href={`/dashboard/simulations/${item.id}`}><span className="table-file-icon"><Icon name={item.sources[0]?.kind === 'video' ? 'video' : 'document'} /></span><span>{item.title}</span></Link></td><td className="mono muted">{item.sources.length}</td><td><span className={`state-label ${item.demo ? '' : 'draft'}`}>{item.demo ? 'Example' : item.brainJobId ? 'Model run' : 'Draft'}</span></td><td className="muted">{new Date(item.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', timeZone:'America/New_York' })}</td><td><Link className="table-open" aria-label={`Open ${item.title}`} href={`/dashboard/simulations/${item.id}`}><Icon name="arrow" /></Link></td></tr>)}</tbody></table></div>
    {!filtered.length && <p className="empty-list">No simulations match your search.</p>}
  </section>;
}
export default function Home() {
  const { save } = useLibrary();
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [sources, setSources] = useState<Source[]>([]);
  const [mode, setMode] = useState<'files'|'link'|'text'>('files');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cloudRights, setCloudRights] = useState(false);

  async function addFiles(files: File[]) {
    setError('');
    const supported = extensions.split(',');
    const invalid = files.find(file => !supported.includes(`.${file.name.split('.').pop()?.toLowerCase()}`) || !file.size || file.size > 50 * 1024 * 1024);
    if (invalid) { setError(`“${invalid.name}” is empty, unsupported, or larger than 50 MB. Choose one of the supported formats.`); return; }
    if (sources.reduce((sum,item) => sum + (item.size || 0), 0) + files.reduce((sum,item) => sum + item.size, 0) > 100 * 1024 * 1024) { setError('Keep the combined sources under 100 MB per simulation.'); return; }
    const added: Source[] = files.map(file => ({ id: crypto.randomUUID(), name:file.name, size:file.size, kind:fileKind(file), file }));
    setSources(items => [...items, ...added]);
  }
  function addLink() {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      setSources(items => [...items, { id:crypto.randomUUID(), name:parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname), kind:'link', url:parsed.href }]);
      setUrl(''); setMode('files'); setError('');
    } catch { setError('Enter a complete http:// or https:// source URL.'); }
  }
  function addText() {
    if (!text.trim()) { setError('Paste some lesson text first.'); return; }
    setSources(items => [...items, { id:crypto.randomUUID(), name:text.trim().split('\n')[0].slice(0,65), kind:'text', text:text.trim() }]);
    setText(''); setMode('files'); setError('');
  }
  async function create() {
    if (!sources.length || saving) return;
    if (mode === 'text' && text.trim() || mode === 'link' && url.trim()) { setError('Add or clear the text or link you’re editing before continuing.'); return; }
    setSaving(true); setError('');
    const id = crypto.randomUUID();
    try {
      let brainJobId: string | undefined;
      if (sources.length === 1 && sources[0].kind === 'video' && sources[0].file) {
        if (!cloudRights) throw new Error('Confirm that this is your lesson and you authorize cloud processing.');
        const body = new FormData();
        body.append('video', sources[0].file, sources[0].name);
        body.append('title', title.trim() || sources[0].name);
        body.append('cloud_rights', 'true');
        const response = await fetch('/api/brain/jobs', {method:'POST',body});
        const result = await response.json();
        if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'Could not start model processing.');
        brainJobId = result.job_id;
      }
      await save({ id, title:title.trim() || sources[0].name.replace(/\.[^/.]+$/, ''), createdAt:new Date().toISOString(), sources, brainJobId });
      router.push(`/dashboard/simulations/${id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save this simulation.'); setSaving(false); }
  }
  function drop(event: DragEvent) { event.preventDefault(); dragDepth.current=0; setDragging(false); if (!saving) void addFiles(Array.from(event.dataTransfer.files)); }

  return <div className="studio-home">
    <header className="studio-page-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Start with a lesson.</h1><p>Bring your materials together. See how a lesson could unfold.</p></div><span className="workspace-status"><span />Local workspace</span></header>
    <section className={`source-composer${dragging ? ' is-dragging' : ''}`} onDragEnter={event => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragLeave={() => { dragDepth.current--; if (dragDepth.current === 0) setDragging(false); }} onDragOver={event => event.preventDefault()} onDrop={drop} aria-label="Add lesson sources">
      <fieldset disabled={saving} className="composer-fields">
        <input className="workspace-sr-only" ref={picker} type="file" multiple accept={extensions} aria-label="Upload lesson files" tabIndex={-1} onChange={event => { void addFiles(Array.from(event.target.files || [])); event.target.value=''; }} />
        <div className="composer-drop">
          <div className="upload-glyph"><Icon name="upload" /></div>
          <h2>{dragging ? 'Drop your lesson here' : 'What would you like to simulate?'}</h2>
          <p>Drop videos, PDFs, audio, presentations, or other lesson materials.</p>
          <div className="source-actions"><button className="studio-button" onClick={() => picker.current?.click()}><Icon name="upload" />Upload files</button><button className="studio-button" aria-pressed={mode === 'link'} onClick={() => { setMode(mode === 'link' ? 'files' : 'link'); setError(''); }}><Icon name="link" />Add link</button><button className="studio-button" aria-pressed={mode === 'text'} onClick={() => { setMode(mode === 'text' ? 'files' : 'text'); setError(''); }}><Icon name="text" />Paste text</button></div>
          <span className="composer-formats mono">VIDEO · AUDIO · PDF · SLIDES · TEXT · IMAGES</span>
        </div>
        {mode === 'link' && <div className="inline-source"><label htmlFor="source-url">Source URL</label><div><input id="source-url" autoFocus type="url" placeholder="https://…" value={url} onChange={event => setUrl(event.target.value)} onKeyDown={event => { if(event.key === 'Enter') addLink(); }} /><button className="studio-button" onClick={addLink}>Add source</button></div><p>Links are saved as references. Content fetching is not connected yet.</p></div>}
        {mode === 'text' && <div className="inline-source"><label htmlFor="source-text">Lesson text</label><textarea id="source-text" autoFocus placeholder="Paste a lesson, transcript, or supporting context…" rows={5} maxLength={100000} value={text} onChange={event => setText(event.target.value)} /><button className="studio-button" onClick={addText}>Add text</button></div>}
        {!!sources.length && <div className="staged-sources"><label className="title-field">Simulation title<input maxLength={160} value={title} placeholder={sources[0].name.replace(/\.[^/.]+$/, '')} onChange={event => setTitle(event.target.value)} /></label><div className="staged-list">{sources.map(source => <div className="staged-source" key={source.id}><Icon name={source.kind === 'link' ? 'link' : source.kind === 'document' ? 'document' : source.kind} /><span>{source.name}</span><small className="mono">{source.size ? sizeLabel(source.size) : source.kind}</small><button aria-label={`Remove ${source.name}`} onClick={() => setSources(items => items.filter(item => item.id !== source.id))}><Icon name="close" /></button></div>)}</div></div>}
      </fieldset>
      {sources.length === 1 && sources[0].kind === 'video' && <label className="neural-upload-consent"><input type="checkbox" checked={cloudRights} onChange={event=>setCloudRights(event.target.checked)}/> I created this lesson and authorize cloud processing. Demo videos: MP4, MOV or WebM, up to 3 minutes. Predictions are experimental.</label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="composer-footer"><span className="mono">{sources.length ? `${sources.length} SOURCE${sources.length === 1 ? '' : 'S'} ADDED` : '50 MB / FILE'}<span className="footer-divider">/</span>Saved in this browser</span><button className="studio-button primary" disabled={!sources.length || saving} onClick={create}>{saving ? 'Saving…' : 'Create simulation'}<Icon name="arrow" /></button></footer>
    </section>
    <Link className="example-strip" href="/dashboard/simulations/qualified-neural-example"><span className="example-symbol"><Icon name="simulations" /></span><span><strong>Explore an actual model output</strong><small>Play a lesson with predicted cortex, EEG channels, and five response scores.</small></span><span className="example-open">Open example <Icon name="arrow" /></span></Link>
    <SimulationList />
  </div>;
}
