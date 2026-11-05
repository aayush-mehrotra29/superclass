import type { Metadata } from 'next';
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'superclass — The learning simulation company',
  description: 'Superclass researches how lesson content relates to neural responses and develops transparent tools for educators.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
