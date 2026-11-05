'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import Icon from '../icons';
import { sizeLabel, useLibrary } from '../library';
import { createGraph, type MemoryNode } from './graph';

const short = (value: string, max = 27) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const clamp = (n: number) => Math.min(2.5, Math.max(.5, n));

export default function MemoryMap() {
  const { records, loaded, error } = useLibrary();
  const [examples, setExamples] = useState(true);
  const graph = useMemo(() => createGraph(records, examples), [records, examples]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [local, setLocal] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const svg = useRef<SVGSVGElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const detail = useRef<HTMLElement>(null);
  const lastNode = useRef<string | null>(null);
  const drag = useRef<{ id?: string; x: number; y: number; originalX: number; originalY: number; moved: boolean } | null>(null);
  const node = graph.nodes.find(n => n.id === selected);
  const lookup = new Map(graph.nodes.map(n => [n.id, n]));
  const neighbors = new Set(graph.edges.filter(e => e.from === selected || e.to === selected).flatMap(e => [e.from, e.to]));
  const visible = graph.nodes.filter(n => (!local || !node || neighbors.has(n.id)) && (kind === 'all' || n.kind === kind || n.id === selected));
  const visibleIds = new Set(visible.map(n => n.id));
  const edges = graph.edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
  const term = query.trim().toLowerCase();
  const matches = term ? visible.filter(n => `${n.label} ${n.body}`.toLowerCase().includes(term)) : [];
  const matched = new Set(matches.map(n => n.id));
  const xy = (n: MemoryNode) => positions[n.id] || n;
  const reset = () => { setView({ x: 0, y: 0, scale: 1 }); setPositions({}); };
  const zoom = (factor: number) => setView(v => ({ ...v, scale: clamp(v.scale * factor) }));
  function select(id: string) { lastNode.current = id; setSelected(id); }
  function dismiss() {
    setSelected(null); setLocal(false);
    const target = Array.from(svg.current?.querySelectorAll<SVGGElement>('[data-node]') || []).find(el => el.dataset.node === lastNode.current);
    target?.focus();
  }
  useEffect(() => { if (selected) { close.current?.focus({ preventScroll: true }); detail.current?.scrollTo(0, 0); } }, [selected]);
  useEffect(() => {
    if (!local || !selected) return;
    const ids = new Set(graph.edges.filter(e => e.from === selected || e.to === selected).flatMap(e => [e.from, e.to]));
    const points = graph.nodes.filter(n => ids.has(n.id));
    if (!points.length) return;
    const left = Math.min(...points.map(n => n.x)), right = Math.max(...points.map(n => n.x));
    const top = Math.min(...points.map(n => n.y)), bottom = Math.max(...points.map(n => n.y));
    const scale = Math.min(1.6, 700 / Math.max(1, right-left), 380 / Math.max(1, bottom-top));
    setView({ x: (500-(left+right)/2)*scale, y: (330-(top+bottom)/2)*scale, scale });
  }, [local, selected, graph]);
  useEffect(() => {
    const canvas = svg.current;
    if (!canvas) return;
    const wheel = (event: WheelEvent) => { event.preventDefault(); zoom(Math.exp(-event.deltaY * .0015)); };
    canvas.addEventListener('wheel', wheel, { passive: false });
    return () => canvas.removeEventListener('wheel', wheel);
  }, []);
  function point(event: PointerEvent<SVGSVGElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  }
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const target = (event.target as Element).closest<SVGGElement>('[data-node]');
    const id = target?.dataset.node;
    const p = point(event), n = id ? lookup.get(id) : null;
    const origin = n ? xy(n) : view;
    drag.current = { id, x: p.x, y: p.y, originalX: origin.x, originalY: origin.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d) return;
    const p = point(event), dx = p.x - d.x, dy = p.y - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.id) setPositions(old => ({ ...old, [d.id!]: { x: d.originalX + dx / view.scale, y: d.originalY + dy / view.scale } }));
    else setView(v => ({ ...v, x: d.originalX + dx, y: d.originalY + dy }));
  }
  function pointerUp(event: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (d?.id && !d.moved) select(d.id);
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  const related = node ? graph.edges.filter(e => e.from === node.id || e.to === node.id).map(e => ({ edge: e, node: lookup.get(e.from === node.id ? e.to : e.from)! })) : [];
  const source = node?.source;
  const [filePreview, setFilePreview] = useState<{ source: typeof source; url: string } | null>(null);
  const fileUrl = filePreview?.source === source ? filePreview?.url : undefined;
  const [textPreview, setTextPreview] = useState<{ id: string; text: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (source?.kind === 'text' && source.file && node) {
      const id = node.id;
      source.file.text().then(text => { if (!cancelled) setTextPreview({ id, text: text || 'This text file is empty.' }); }).catch(() => { if (!cancelled) setTextPreview({ id, text: 'Preview unavailable. Download the source to inspect it.' }); });
    }
    return () => { cancelled = true; };
  }, [source, node]);
  useEffect(() => {
    if (!source?.file) { setFilePreview(null); return; }
    const url = URL.createObjectURL(source.file); setFilePreview({ source, url });
    return () => URL.revokeObjectURL(url);
  }, [source]);

  return <section className="memory-page" aria-label="Memory workspace">
    <header className="memory-heading">
      <div><span className="eyebrow">WORKSPACE / MEMORY</span><h1>Everything, connected.</h1><p>Explore the lessons, sources, and ideas in your workspace.</p></div>
      <span className="memory-local"><span />LOCAL MEMORY</span>
    </header>
    <div className="memory-toolbar">
      <div className="memory-search-wrap">
        <label className="memory-search"><Icon name="search" /><input aria-label="Find a memory" placeholder="Find a memory…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear memory search" onClick={() => setQuery('')}><Icon name="close" /></button>}</label>
        {term && <div className="memory-search-results" aria-label="Memory search results"><span className="eyebrow" role="status">{matches.length} MATCH{matches.length === 1 ? '' : 'ES'}</span>{matches.length ? matches.map(n => <button key={n.id} onClick={() => { select(n.id); setQuery(''); }}><i className={`memory-dot ${n.kind}`} /><span>{n.label}</span><small>{n.kind}</small></button>) : <p>No memories match “{query}”.</p>}</div>}
      </div>
      <label className="memory-filter"><span className="workspace-sr-only">Filter memory type</span><select aria-label="Filter memory type" value={kind} onChange={e => setKind(e.target.value)}><option value="all">All types</option><option value="lesson">Lessons</option><option value="source">Sources</option><option value="concept">Concepts</option></select></label>
      <label className="memory-examples"><input type="checkbox" checked={examples} onChange={e => { setExamples(e.target.checked); setSelected(null); setLocal(false); reset(); }} />Show examples</label>
      <span className="memory-count" aria-live="polite">{visible.length} nodes<span> / </span>{edges.length} connections</span>
    </div>
    {error && <p className="memory-error" role="status">{error}</p>}
    <div className={`memory-body${node ? ' has-detail' : ''}`}>
      <div className="memory-graph-area">
        <div className="memory-map-caption"><span className="memory-cross">+</span><span>{local && node ? 'CONNECTED MEMORIES' : 'WORKSPACE GRAPH'}<small>{examples ? 'Includes illustrative concept connections' : 'Saved lessons and sources'}</small></span></div>
        <svg ref={svg} className="memory-graph" viewBox="0 0 1000 660" role="group" aria-label="Interactive memory graph. Select a node to inspect it. Drag to pan; use plus and minus to zoom." tabIndex={0} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => {
          if (e.key === 'Escape') dismiss();
          if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.2); }
          if (e.key === '-') { e.preventDefault(); zoom(1 / 1.2); }
          if (e.key.toLowerCase() === 'r') reset();
          if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); setView(v => ({ ...v, x: v.x + (e.key === 'ArrowLeft' ? 30 : e.key === 'ArrowRight' ? -30 : 0), y: v.y + (e.key === 'ArrowUp' ? 30 : e.key === 'ArrowDown' ? -30 : 0) })); }
        }}>
          <g transform={`translate(${500 + view.x} ${330 + view.y}) scale(${view.scale}) translate(-500 -330)`}>
            {edges.map(e => { const a = xy(lookup.get(e.from)!), b = xy(lookup.get(e.to)!); const active = e.from === selected || e.to === selected; return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`memory-edge${active ? ' is-connected' : ''}${node && !active ? ' is-muted' : ''}`}><title>{`${lookup.get(e.from)!.label} → ${e.relation} → ${lookup.get(e.to)!.label}`}</title></line>; })}
            {visible.map(n => {
              const p = xy(n), isSelected = n.id === selected, muted = (term && !matched.has(n.id)) || (node && !neighbors.has(n.id) && n.id !== node.id);
              const r = n.kind === 'workspace' ? 13 : n.kind === 'lesson' ? 10 : n.kind === 'concept' ? 5 : 5;
              return <g key={n.id} data-node={n.id} transform={`translate(${p.x} ${p.y})`} className={`memory-node ${n.kind}${isSelected ? ' is-selected' : ''}${muted ? ' is-muted' : ''}`} role="button" aria-label={`${n.label}, ${n.kind}${n.example ? ', example' : ''}`} aria-pressed={isSelected} tabIndex={0} onClick={e => { if (e.detail === 0) select(n.id); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); select(n.id); } }}>
                <title>{n.label}</title><circle className="node-hit" r="23" /><circle className="node-halo" r={r + 7} />
                {n.kind === 'source' ? <rect className="node-shape" x="-5" y="-5" width="10" height="10" /> : <circle className="node-shape" r={r} />}
                {n.kind === 'workspace' && <path d="M-5 0h10M0-5v10" stroke="white" strokeWidth="1.5" />}
                <text y={r + 20} textAnchor="middle">{short(n.label)}</text>
              </g>;
            })}
          </g>
        </svg>
        {!loaded && <span className="memory-loading" role="status">Loading saved memories…</span>}
        {(visible.length === 0 || (kind === 'all' && graph.nodes.length === 1)) && loaded && <div className="memory-empty"><strong>{kind !== 'all' ? 'No memories of this type yet.' : 'Your map starts here.'}</strong><p>{kind !== 'all' ? 'Choose another type or show examples.' : 'Add a lesson on Home to connect your first sources.'}</p>{kind === 'all' && <Link href="/dashboard" className="studio-button">Add a lesson</Link>}</div>}
        <div className="memory-map-footer"><span>DRAG TO EXPLORE · CLICK TO INSPECT</span><div className="memory-zoom"><button aria-label="Zoom out" onClick={() => zoom(1 / 1.2)}>−</button><span>{Math.round(view.scale * 100)}%</span><button aria-label="Zoom in" onClick={() => zoom(1.2)}>+</button><button aria-label="Reset graph view" title="Reset view (R)" onClick={reset}><Icon name="reset" /></button></div></div>
      </div>
      {node && <aside ref={detail} className="memory-detail" aria-label="Memory details" onKeyDown={e => { if (e.key === 'Escape') dismiss(); }}>
        <div className="memory-detail-top"><span className="eyebrow">MEMORY DETAILS</span><button ref={close} className="workspace-icon-button" aria-label="Close memory details" onClick={dismiss}><Icon name="close" /></button></div>
        <div className="memory-detail-content" key={node.id}>
          <span className="memory-kind"><i className={`memory-dot ${node.kind}`} />{node.kind}{node.example && <small>EXAMPLE</small>}</span>
          <h2>{node.label}</h2>
          <p className="memory-node-body">{textPreview?.id === node.id ? textPreview.text : node.body}</p>
          <dl className="memory-properties"><div><dt>Origin</dt><dd>{node.example ? 'Curated example' : 'Local workspace'}</dd></div><div><dt>Connections</dt><dd>{related.length}</dd></div>{source && <div><dt>Format</dt><dd>{source.kind}{source.size ? ` · ${sizeLabel(source.size)}` : ''}</dd></div>}</dl>
          {node.example && <p className="memory-provenance">Illustrative content for exploring the map. These connections were not extracted by a model.</p>}
          <div className="memory-detail-actions">{node.lessonId && <Link className="studio-button" href={`/dashboard/simulations/${node.lessonId}`}>Open simulation<Icon name="arrow" /></Link>}{fileUrl && source && <a className="studio-button" href={fileUrl} download={source.name}>Download source<Icon name="document" /></a>}{source?.url && /^https?:\/\//i.test(source.url) && <a className="studio-button" href={source.url} target="_blank" rel="noreferrer">Open source<Icon name="link" /></a>}</div>
          <div className="memory-connections-heading"><h3>Connected memories</h3><span>{related.length.toString().padStart(2,'0')}</span></div>
          <button className="studio-button memory-focus" aria-pressed={local} onClick={() => { setLocal(v => !v); setKind('all'); setQuery(''); reset(); }}>{local ? 'Show full map' : 'Isolate connections'}</button>
          <div className="memory-connections">{related.map(({node: other, edge}) => <button key={other.id} onClick={() => select(other.id)}><i className={`memory-dot ${other.kind}`} /><span><strong>{other.label}</strong><small>{edge.from === node.id ? edge.relation : `Connected via “${edge.relation}”`}</small></span><Icon name="arrow" /></button>)}</div>
        </div>
      </aside>}
    </div>
    <footer className="memory-legend"><div><span><i className="memory-dot lesson" />Lesson</span><span><i className="memory-dot source" />Source</span><span><i className="memory-dot concept" />Concept</span><span className="memory-link-key">— Connection</span></div><span>Stored in this browser</span></footer>
  </section>;
}
