import Link from 'next/link';
import { SimulationList } from '../home';
import Icon from '../icons';
export default function Page() {
  return <div className="studio-home"><header className="studio-page-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Simulations</h1><p>Your lesson drafts and example workspaces.</p></div><Link className="studio-button primary" href="/dashboard"><Icon name="plus" />New simulation</Link></header><SimulationList full /></div>;
}
