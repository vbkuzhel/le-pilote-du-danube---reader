import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Le Pilote du Danube - Interactive Reader',
  description: 'Read Jules Verne in modern French with interactive tools.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-paper dark:bg-slate-950 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}