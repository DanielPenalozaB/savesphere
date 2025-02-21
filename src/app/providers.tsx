'use client';

import { ThemeProvider } from 'next-themes';
import './globals.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}