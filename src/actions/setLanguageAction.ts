'use server';

import { cookies } from 'next/headers';

export default async function setLanguageAction(locale: string) {
  (await cookies()).set('NEXT_LOCALE', locale);
}