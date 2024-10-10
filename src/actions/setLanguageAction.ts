'use server';

import { cookies } from 'next/headers';

export default async function setLanguageAction(locale: string) {
  cookies().set('NEXT_LOCALE', locale);
}