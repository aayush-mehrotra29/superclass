import type { Simulation, Source } from '../library';

export type MemoryNode = {
  id: string; label: string; kind: 'workspace' | 'lesson' | 'source' | 'concept';
  body: string; example?: boolean; lessonId?: string; source?: Source; x: number; y: number;
};
export type MemoryEdge = { from: string; to: string; relation: string };

// Hand-authored examples, never inferred memories or model output.
const concepts: Record<string, [string, string][]> = {
  'industrial-revolution': [
    ['Mechanization', 'Machines replaced some tasks previously performed by hand, changing the scale and organization of production.'],
    ['Steam power', 'Steam engines made mechanical power available beyond locations with suitable flowing water.'],
    ['James Watt', 'Watt improved the steam engine with a separate condenser, reducing wasted energy.'],
    ['Textile production', 'Spinning and weaving inventions helped textile manufacturing move toward factory production.'],
    ['Factory system', 'Production brought workers, machines, and supervision together in a shared workplace.'],
    ['Urbanization', 'Industrial employment helped draw people into growing towns and cities.'],
    ['Labor conditions', 'Factory work raised questions about working hours, safety, and child labor.'],
    ['Transport networks', 'Railways and steamships helped move people, raw materials, and finished goods.'],
    ['Cause and effect', 'A learning skill: connect an invention or policy to its consequences, while considering other causes.'],
  ],
  'cold-war': [
    ['Ideological rivalry', 'The United States and Soviet Union competed over political and economic systems as well as geopolitical influence.'],
    ['Containment', 'A US foreign-policy approach aimed at limiting the expansion of Soviet influence.'],
    ['Marshall Plan', 'A US program supporting European economic recovery after World War II.'],
    ['Berlin blockade', 'In 1948–49, the Soviet Union blocked Western land access to West Berlin; the Western allies organized an airlift.'],
    ['Nuclear deterrence', 'The threat of retaliation became a central feature of Cold War strategy.'],
    ['Space race', 'Competition in space exploration became a highly visible demonstration of technological capacity.'],
    ['Cuban Missile Crisis', 'The 1962 confrontation over Soviet missiles in Cuba brought the superpowers close to nuclear conflict.'],
    ['Historical evidence', 'A learning skill: compare sources, distinguish interpretation from evidence, and account for perspective.'],
  ],
};

export function createGraph(records: Simulation[], includeExamples: boolean) {
  const nodes: MemoryNode[] = [{ id: 'workspace', label: 'Your workspace', kind: 'workspace', body: 'Lessons and their saved sources, connected in one place. Concept nodes are hand-authored examples. Uploaded materials are linked to their lesson; semantic memory extraction is not connected yet.', x: 500, y: 330 }];
  const edges: MemoryEdge[] = [];
  const addEdge = (from: string, to: string, relation: string) => edges.push({ from, to, relation });
  records.filter(record => includeExamples || !record.demo).forEach(record => {
    const id = `lesson:${record.id}`;
    nodes.push({ id, label: record.title.split(':')[0], kind: 'lesson', body: record.title, lessonId: record.id, example: record.demo, x: 0, y: 0 });
    addEdge('workspace', id, 'contains');
    record.sources.forEach(source => {
      const sourceId = `${id}:source:${source.id}`;
      nodes.push({ id: sourceId, label: source.name, kind: 'source', body: source.text || (source.url ? `Saved reference: ${source.url}` : record.demo ? 'Example source placeholder. No original file is attached.' : 'A locally saved source. Open the file to inspect its contents.'), source, lessonId: record.id, example: record.demo, x: 0, y: 0 });
      addEdge(id, sourceId, 'has source');
    });
    if (record.demo) {
      (concepts[record.id] || []).forEach(([label, body], i) => {
        const conceptId = `${id}:concept:${i}`;
        nodes.push({ id: conceptId, label, body, kind: 'concept', lessonId: record.id, example: true, x: 0, y: 0 });
        addEdge(id, conceptId, 'covers');
        if (i > 0) addEdge(`${id}:concept:${i - 1}`, conceptId, 'related concept');
      });
    }
  });
  if (includeExamples && records.some(r => r.id === 'industrial-revolution') && records.some(r => r.id === 'cold-war')) {
    addEdge('lesson:industrial-revolution:concept:8', 'lesson:cold-war:concept:7', 'related learning skill');
    addEdge('lesson:industrial-revolution:concept:0', 'lesson:cold-war:concept:5', 'technology across eras');
  }
  // Stable force layout, without client/server randomness or perpetual drift.
  nodes.forEach((node, i) => { const a = i * 2.399963; node.x = 500 + Math.cos(a) * (70 + i * 7); node.y = 330 + Math.sin(a) * (70 + i * 7); });
  const lookup = new Map(nodes.map((n,i) => [n.id, i]));
  for (let step = 0; step < 260; step++) {
    const force = nodes.map(() => ({ x: 0, y: 0 }));
    for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      const d = Math.max(1, Math.hypot(dx, dy)), f = Math.min(12, 11000 / (d * d));
      force[a].x += dx / d * f; force[a].y += dy / d * f;
      force[b].x -= dx / d * f; force[b].y -= dy / d * f;
    }
    edges.forEach(edge => {
      const ai = lookup.get(edge.from)!, bi = lookup.get(edge.to)!;
      const a = nodes[ai], b = nodes[bi];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - (a.kind === 'workspace' ? 190 : 110)) * .018;
      force[ai].x += dx / d * f; force[ai].y += dy / d * f;
      force[bi].x -= dx / d * f; force[bi].y -= dy / d * f;
    });
    nodes.forEach((n, i) => { n.x += force[i].x + (500 - n.x) * .002; n.y += force[i].y + (330 - n.y) * .002; });
  }
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX || 1, height = Math.max(...ys) - minY || 1;
  nodes.forEach(n => { n.x = nodes.length === 1 ? 500 : 115 + (n.x - minX) / width * 770; n.y = nodes.length === 1 ? 330 : 85 + (n.y - minY) / height * 490; });
  return { nodes, edges };
}
