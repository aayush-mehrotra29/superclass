import type { ReactNode } from 'react';

// A shared 24px grid and stroke weight keep every sidebar symbol consistent.
const drawings: Record<string, ReactNode> = {
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" /></>,
  link: <><path d="m10 14 4-4M8 16l-1 1a4.2 4.2 0 0 1-6-6l4-4a4.2 4.2 0 0 1 6 0M16 8l1-1a4.2 4.2 0 0 1 6 6l-4 4a4.2 4.2 0 0 1-6 0" transform="translate(1 0) scale(.92 1)" /></>,
  text: <><path d="M4 5h16M12 5v15M8 20h8M4 5v3M20 5v3" /></>,
  document: <><path d="M5 3h9l5 5v13H5ZM14 3v5h5M8 12h8M8 16h6" /></>,
  video: <><rect x="3" y="5" width="18" height="14" /><path d="m10 9 5 3-5 3Z" /></>,
  audio: <><path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" /></>,
  image: <><rect x="3" y="3" width="18" height="18" /><circle cx="8" cy="8" r="1.5" /><path d="m3 18 6-6 4 4 4-6 4 6" /></>,
  play: <path d="m8 4 12 8-12 8Z" />,
  pause: <><path d="M8 4v16M16 4v16" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  reset: <><path d="M4 9a8 8 0 1 1 0 6M4 3v6h6" /></>,
  plus: <path d="M12 4v16M4 12h16" />,
  home: <><path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" /></>,
  simulations: <><path d="M12 3a9 9 0 1 0 9 9h-9Z" /><path d="M16 3.9A9 9 0 0 1 20.1 8H16Z" /></>,
  memory: <><path d="M12 5a3 3 0 0 0-5.7-1A3.7 3.7 0 0 0 3 9.6a4 4 0 0 0 .6 7.4A3.7 3.7 0 0 0 12 20V5Zm0 0a3 3 0 0 1 5.7-1A3.7 3.7 0 0 1 21 9.6a4 4 0 0 1-.6 7.4A3.7 3.7 0 0 1 12 20" /><path d="M6.3 4.1v3.4M17.7 4.1v3.4M5 13h3v4M19 13h-3v4M8 10h4m0 5h4" /></>,
  files: <><path d="M3 6h6l2 2h10v12H3Z" /><path d="M3 6V4h7l2 2h9v2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx=".5" /><path d="M9 4v16M5.5 8h1M5.5 11h1" /></>,
  chevron: <path d="m8 10 4 4 4-4" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
};

export default function Icon({ name }: { name: string }) {
  return <svg className={`workspace-icon icon-${name}`} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{drawings[name]}</svg>;
}
