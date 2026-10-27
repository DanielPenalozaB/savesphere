import { getLocale } from '#lib/paraglide/runtime.js';

type Message = (inputs: { count: number }) => string;

/** Picks the singular or plural message for `count` with the UI language's plural rules. */
export function plural(count: number, one: Message, other: Message): string {
	const category = new Intl.PluralRules(getLocale()).select(count);
	return (category === 'one' ? one : other)({ count });
}
