import { afterEach, describe, expect, it, vi } from 'vitest';
import { dismiss, toast, toasts } from './toast.svelte.ts';

describe('toast', () => {
	afterEach(() => {
		for (const item of [...toasts]) dismiss(item.id);
		vi.useRealTimers();
	});

	it('replaces repeats, keeps at most three and expires', () => {
		vi.useFakeTimers();
		toast('Saved');
		toast('Saved');
		expect(toasts.map((t) => t.message)).toEqual(['Saved']);

		for (const message of ['A', 'B', 'C']) toast(message);
		expect(toasts.map((t) => t.message)).toEqual(['A', 'B', 'C']);

		vi.advanceTimersByTime(3500);
		expect(toasts).toHaveLength(0);
	});
});
