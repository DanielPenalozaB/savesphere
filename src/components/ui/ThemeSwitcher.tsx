'use client';

import { MoonIcon } from '@/icons';
import SunIcon from '@/icons/Sun';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const t = useTranslations('nav.theme');

  const [ mounted, setMounted ] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (resolvedTheme === 'dark') {
    return (
      <button
        onClick={() => setTheme('light')}
        type="button"
        title={t('light')}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-light focus:ring-offset-2"
      >
        <SunIcon className={`fill-inherit ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'}`} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme('dark')}
      type="button"
      title={t('dark')}
      className="rounded-full focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2"
    >
      <MoonIcon className={`fill-inherit stroke-[0.15] ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'}`} />
    </button>
  );
}