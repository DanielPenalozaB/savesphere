/** Year and month (1–12) of an instant, as seen in `timeZone`. */
export function zonedYearMonth(date: Date, timeZone: string): { year: number; month: number } {
	const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric' })
		.formatToParts(date)
		.reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
	return { year: Number(parts.year), month: Number(parts.month) };
}

/** Calendar date ("2026-10-23") of an instant, as seen in `timeZone`. */
export function zonedDate(date: Date, timeZone: string): string {
	// en-CA formats as YYYY-MM-DD.
	return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

/** The UTC offset of `timeZone` at `date`, in minutes (e.g. -300 for Bogotá). */
function offsetMinutes(date: Date, timeZone: string): number {
	const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
		.formatToParts(date)
		.find((part) => part.type === 'timeZoneName')?.value;
	const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name ?? '');
	if (!match) return 0;
	const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
	return match[1] === '-' ? -minutes : minutes;
}

/** The instant of a wall-clock time in `timeZone`, e.g. ("2026-10-01", "00:00", "America/Bogota"). */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
	const asUtc = new Date(`${date}T${time}:00Z`);
	// Two passes settle the offset across a DST change.
	let instant = new Date(asUtc.getTime() - offsetMinutes(asUtc, timeZone) * 60_000);
	instant = new Date(asUtc.getTime() - offsetMinutes(instant, timeZone) * 60_000);
	return instant;
}

/** `[from, to)` of a calendar month in `timeZone`, as ISO strings for the API. */
export function monthRange(year: number, month: number, timeZone: string) {
	const pad = (n: number) => String(n).padStart(2, '0');
	const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
	return {
		from: zonedTimeToUtc(`${year}-${pad(month)}-01`, '00:00', timeZone).toISOString(),
		to: zonedTimeToUtc(`${next.year}-${pad(next.month)}-01`, '00:00', timeZone).toISOString()
	};
}

/** Parses "2026-10" into a year/month, or null. */
export function parseMonth(value: string | null): { year: number; month: number } | null {
	const match = /^(\d{4})-(\d{2})$/.exec(value ?? '');
	if (!match) return null;
	const month = Number(match[2]);
	return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
}

export function formatMonthParam({ year, month }: { year: number; month: number }): string {
	return `${year}-${String(month).padStart(2, '0')}`;
}

export function shiftMonth({ year, month }: { year: number; month: number }, delta: number) {
	const index = year * 12 + (month - 1) + delta;
	return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
