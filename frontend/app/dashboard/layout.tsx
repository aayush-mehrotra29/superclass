import Workspace from './workspace';
import './dashboard.css';
import './studio.css';
import { LibraryProvider } from './library';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <LibraryProvider><Workspace>{children}</Workspace></LibraryProvider>;
}
