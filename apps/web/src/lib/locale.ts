/**
 * The locale for numbers and dates: the user's regional locale (e.g. "es-CO", saved at sign-up)
 * when it matches the UI language, so Colombians see "$ 47.320.000"; otherwise the UI language.
 */
export function formatLocale(uiLocale: string, regional: string | undefined): string {
	return regional && regional.split('-')[0] === uiLocale ? regional : uiLocale;
}
