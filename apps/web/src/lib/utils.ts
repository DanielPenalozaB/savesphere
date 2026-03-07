import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { resolve } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Casts a string to a type compatible with SvelteKit's resolve function.
 */
export function toPath(path: string): Parameters<typeof resolve>[0] {
  return path as Parameters<typeof resolve>[0];
}

/**
 * Localizes a path and casts it to a type compatible with SvelteKit's resolve function.
 */
export function toLocalizedPath(
  path: string,
  options?: Parameters<typeof localizeHref>[1]
): Parameters<typeof resolve>[0] {
  return localizeHref(path, options) as Parameters<typeof resolve>[0];
}
