'use client';

import { useTranslations } from 'next-intl';

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations('auth');

  return (
    { children }
  );
}