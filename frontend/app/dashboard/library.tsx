'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Source = { id: string; name: string; kind: 'video' | 'audio' | 'document' | 'text' | 'link' | 'image'; size?: number; text?: string; url?: string; file?: Blob };
export type Simulation = { id: string; title: string; createdAt: string; sources: Source[]; demo?: boolean; brainJobId?: string };
export const examples: Simulation[] = [
  {id:'qualified-neural-example',title:'Velocity — model output',createdAt:'2026-11-04T23:00:00Z',demo:true,brainJobId:'qualified-video-v1',sources:[{id:'qualified-video',name:'Velocity lesson.mp4',kind:'video'}]},
  { id: 'industrial-revolution', title: 'Industrial Revolution: Important figures that shaped the modern world', createdAt: '2026-11-04T12:00:00Z', demo: true, sources: [{ id: 'demo-video', name: 'Industrial Revolution.mp4', kind: 'video' }, { id: 'demo-text', name: 'Lesson overview', kind: 'text', text: 'The Industrial Revolution transformed how people lived and worked. This lesson introduces the people, inventions, and ideas that shifted society from hand production to mechanized industry.' }] },
  { id: 'cold-war', title: 'Cold War: Events that shaped a generation', createdAt: '2026-11-03T12:00:00Z', demo: true, sources: [{ id: 'demo-document', name: 'Cold War lesson.pdf', kind: 'document' }] },
];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('superclass-workspace', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('simulations', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Browser storage is unavailable. Enable site storage to save your sources.'));
  });
}
async function readAll(): Promise<Simulation[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('simulations', 'readonly');
    const request = transaction.objectStore('simulations').getAll();
    transaction.oncomplete = () => { db.close(); resolve(request.result as Simulation[]); };
    transaction.onerror = () => { db.close(); reject(new Error('Could not read your saved simulations.')); };
  });
}
async function write(record: Simulation): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('simulations', 'readwrite');
    transaction.objectStore('simulations').put(record);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => { db.close(); reject(new Error('Could not save these sources. Browser storage may be full; try a smaller file.')); };
    transaction.onerror = () => { /* onabort handles the rejected transaction. */ };
  });
}
const Library = createContext<{ records: Simulation[]; loaded: boolean; error: string; save: (record: Simulation) => Promise<void> } | null>(null);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Simulation[]>(examples);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    readAll().then(items => { if (!cancelled) setRecords([...items.sort((a,b) => b.createdAt.localeCompare(a.createdAt)), ...examples]); })
      .catch(reason => { if (!cancelled) setError(reason.message); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);
  async function save(record: Simulation) {
    await write(record);
    setRecords(items => [record, ...items.filter(item => item.id !== record.id)]);
  }
  return <Library.Provider value={{ records, loaded, error, save }}>{children}</Library.Provider>;
}
export function useLibrary() {
  const value = useContext(Library);
  if (!value) throw new Error('LibraryProvider is required');
  return value;
}
export function sizeLabel(bytes = 0) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
