import { toast } from 'svelte-sonner';

export const notify = {
	success(message: string, description?: string) {
		return toast.success(message, { description });
	},
	error(message: string, description?: string) {
		return toast.error(message, { description });
	},
	warning(message: string, description?: string) {
		return toast.warning(message, { description });
	},
	info(message: string, description?: string) {
		return toast.info(message, { description });
	},
	promise<T>(
		promise: Promise<T>,
		msgs: { loading: string; success: string; error: string }
	) {
		return toast.promise(promise, msgs);
	}
};

export { toast };
