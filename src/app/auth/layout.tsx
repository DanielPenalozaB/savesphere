'use client';

import { setLanguageAction } from '@/actions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations('auth');

  return (
    <>
      {children}
      <footer className='fixed bottom-0 left-1/2 -translate-x-1/2 pb-2 text-sm text-neutral-500'>
        <div className='mb-2 flex items-center justify-center gap-2 divide-x divide-neutral-400'>
          <button
            type='button'
            className='hover:text-neutral-700'
            onClick={(e) => setLanguageAction('en')}
          >
            {t('footer.lang.en')}
          </button>
          <button
            type='button'
            className='pl-2 hover:text-neutral-700'
            onClick={(e) => setLanguageAction('es')}
          >
            {t('footer.lang.es')}
          </button>
        </div>
        <p className='max-w-[320px] text-center'>
          {t.rich('footer.title', {
            b: (chunks) => <b>{chunks}</b>
          })}
          <br />
          {t.rich('footer.message', {
            terms: (chunks) => <Link href='/legal/terms-of-service' className='text-blue-400 underline hover:text-blue-600'>{chunks}</Link>,
            privacy: (chunks) => <Link href='/legal/privacy-policy' className='text-blue-400 underline hover:text-blue-600'>{chunks}</Link>
          })}
        </p>
      </footer>
    </>
  );
}