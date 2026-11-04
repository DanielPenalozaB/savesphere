/** Time zone and locale the browser reported at sign-up, keeping only valid values. */
export function regionalSettings(data: FormData): { timezone?: string; locale?: string } {
	const result: { timezone?: string; locale?: string } = {};
	const timezone = data.get('timezone');
	if (typeof timezone === 'string' && timezone) {
		try {
			new Intl.DateTimeFormat('en-US', { timeZone: timezone });
			result.timezone = timezone;
		} catch {
			// Unknown zone: keep the default.
		}
	}
	const locale = data.get('locale');
	if (typeof locale === 'string' && locale) {
		try {
			result.locale = Intl.getCanonicalLocales(locale)[0];
		} catch {
			// Malformed tag: keep the default.
		}
	}
	return result;
}
