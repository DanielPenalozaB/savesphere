'use client';

import { ArrowLeftIcon } from '@/components/icons/arrow-left';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };

    // Add event listener for the Escape key
    document.addEventListener('keydown', handleEscapeKey);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-500">Error 404</p>
          <h1 className="mt-3 font-playfair text-4xl font-semibold tracking-tight">Page not found</h1>
        </div>
        <hr className="border-neutral-300" />
        <div className="space-y-4">
          <p className="text-neutral-500">
            The transaction or budget page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="border-l-2 border-neutral-300 pl-4">
            <p className="text-sm text-neutral-500">
              Check that the URL is correct or return to the dashboard to continue managing your expenses.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button
            variant="outline"
            className="h-9 w-full justify-start !border-neutral-300 px-3 text-sm font-normal text-neutral-500 hover:!bg-neutral-200/50 hover:text-neutral-500"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Go back
          </Button>

          <Button variant="text" className="h-9 w-full justify-start px-3 text-sm font-normal !text-neutral-600 hover:bg-neutral-200 hover:!text-neutral-700">
            <Link href="/">Return to dashboard</Link>
          </Button>
        </div>

        {/* Notion-like keyboard shortcut hint */}
        <div className="pt-6 text-center">
          <p className="text-xs text-neutral-500">
            Press <kbd className="rounded-md border border-neutral-300 bg-neutral-200 px-1.5 py-0.5 text-xs font-semibold">Esc</kbd> to go back
          </p>
        </div>
      </div>
    </div>
  );
}