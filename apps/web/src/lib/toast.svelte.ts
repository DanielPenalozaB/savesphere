export interface Toast {
	id: number;
	message: string;
}

/** Short confirmations ("Movement saved"). Only pushed from browser event handlers. */
export const toasts = $state<Toast[]>([]);
let nextId = 0;

export function toast(message: string, durationMs = 3500): void {
	const id = ++nextId;
	// Repeating the same confirmation replaces it instead of stacking copies.
	const same = toasts.findIndex((t) => t.message === message);
	if (same !== -1) toasts.splice(same, 1);
	toasts.push({ id, message });
	if (toasts.length > 3) toasts.splice(0, toasts.length - 3);
	setTimeout(() => dismiss(id), durationMs);
}

export function dismiss(id: number): void {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) toasts.splice(index, 1);
}
