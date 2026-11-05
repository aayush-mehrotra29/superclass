'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './icons';
import { useLibrary } from './library';

const sections = [
  { name: 'Home', icon: 'home', href: '/dashboard' },
  { name: 'Simulations', icon: 'simulations', href: '/dashboard/simulations' },
  { name: 'Memory', icon: 'memory', href: '/dashboard/memory' },
  { name: 'Files', icon: 'files', href: '/dashboard/files' },
];
export default function Workspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { records } = useLibrary();
  const recents = records.slice(0, 8).map(item => ({ name: item.title, href: `/dashboard/simulations/${item.id}` }));
  const active = [...sections, ...recents].find(item => item.href === pathname)?.name ?? 'Workspace';
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const term = query.trim().toLowerCase();
  const results = term ? records.filter(record => [record.title, ...record.sources.flatMap(source => [source.name, source.text || '', source.url || ''])].some(value => value.toLowerCase().includes(term))).map(record => ({ name: record.title, href: `/dashboard/simulations/${record.id}` })) : recents;
  function openSearch() { setCollapsed(false); setSearchOpen(true); }
  function closeSearch() { setSearchOpen(false); setQuery(''); searchButton.current?.focus(); }
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => { setSearchOpen(false); setQuery(''); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const adapt = () => setCollapsed(media.matches);
    adapt();
    media.addEventListener('change', adapt);
    return () => media.removeEventListener('change', adapt);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
        searchInput.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <div className={`workspace${collapsed ? ' is-collapsed' : ''}`}>
    <aside className="workspace-sidebar" aria-label="Workspace sidebar">
      <header className="workspace-toolbar">
        <Link className="workspace-logo" href="/" aria-label="Superclass website"><Image src="/dashboard/logo.svg" alt="" width={22} height={22} priority /></Link>
        <div className="workspace-tools">
          <button className="workspace-icon-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => { setCollapsed(value => !value); setSearchOpen(false); setQuery(''); }}><Icon name="sidebar" /></button>
        </div>
      </header>


      <nav className="workspace-navigation" aria-label="Workspace navigation">
        <div className={`sidebar-search${searchOpen ? ' is-open' : ''}`}>
          <button ref={searchButton} className="workspace-nav-item sidebar-search-trigger" aria-label="Search workspace" aria-expanded={searchOpen} aria-controls="sidebar-search-form" title={collapsed ? 'Search' : 'Search (⌘K / Ctrl+K)'} tabIndex={searchOpen ? -1 : 0} onClick={openSearch}><span className="workspace-icon-slot"><Icon name="search" /></span><span className="workspace-label">Search</span></button>
          <form id="sidebar-search-form" className="sidebar-search-form" role="search" inert={!searchOpen} aria-hidden={!searchOpen} onSubmit={event => { event.preventDefault(); }}>
            <Icon name="search" />
            <input ref={searchInput} aria-label="Search workspace" placeholder="Search…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if(event.key === 'Escape') { event.preventDefault(); closeSearch(); } }} />
            <button type="button" aria-label="Close search" onClick={closeSearch}><Icon name="close" /></button>
          </form>
        </div>
        {sections.map(section => <Link key={section.name} href={section.href} className="workspace-nav-item" aria-label={section.name} aria-current={pathname === section.href ? 'page' : undefined} title={collapsed ? section.name : undefined}><span className="workspace-icon-slot"><Icon name={section.icon} /></span><span className="workspace-label">{section.name}</span></Link>)}
      </nav>

      {!collapsed && <section className="workspace-recents" aria-label={term ? 'Search results' : 'Recent simulations'}>
        <h2 className="workspace-recents-heading">{term ? 'Search results' : 'Recents'}</h2>
        <div id="workspace-recents-list">{results.map(item => <Link className="workspace-recent" key={item.href} href={item.href} title={item.name} aria-current={pathname === item.href ? 'page' : undefined}>{item.name}</Link>)}</div>
        {term && <p className="sidebar-search-count" role="status">{results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'No matches found.'}</p>}
      </section>}
    </aside>
    <main className="workspace-canvas" aria-label={`${active} workspace`}>
      {children}
    </main>
  </div>;
}
