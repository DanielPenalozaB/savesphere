import { toastStore, type ToastOptions, type ToastPosition } from './store.svelte.js';

type PromiseMsgs<T> = {
  loading: string | ToastOptions;
  success: string | ToastOptions | ((data: T) => ToastOptions);
  error: string | ToastOptions | ((err: unknown) => ToastOptions);
};

function normalize(opts: string | ToastOptions, description?: string): ToastOptions {
  if (typeof opts === 'string') {
    return { title: opts, description };
  }
  return opts;
}

export const notify = {
  success(opts: string | ToastOptions, description?: string) {
    return toastStore.success(normalize(opts, description));
  },
  error(opts: string | ToastOptions, description?: string) {
    return toastStore.error(normalize(opts, description));
  },
  warning(opts: string | ToastOptions, description?: string) {
    return toastStore.warning(normalize(opts, description));
  },
  info(opts: string | ToastOptions, description?: string) {
    return toastStore.info(normalize(opts, description));
  },
  promise<T>(promise: Promise<T>, msgs: PromiseMsgs<T>): Promise<T> {
    return toastStore.promise(promise, msgs);
  },
  dismiss(id: string) {
    toastStore.dismiss(id);
  },
  clear(position?: ToastPosition) {
    toastStore.clear(position);
  }
};

export { toastStore as toast };
export type { ToastOptions, ToastPosition, ToastState } from './store.svelte.js';
