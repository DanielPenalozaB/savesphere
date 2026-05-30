import { browser } from '$app/environment';

export type ToastState = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'action';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastState;
  position?: ToastPosition;
  duration?: number | null;
  button?: { title: string; onClick: () => void };
  expanded?: boolean;
  autoExpand?: number | boolean;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
  visible: boolean;
  swapping: boolean;
  pausedAt: number | null;
  dismissAt: number | null;
  type: ToastState;
  duration: number | null;
  expandOnHover: boolean;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

class ToastStore {
  toasts = $state<ToastItem[]>([]);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (browser) {
      this.intervalId = setInterval(() => this.tick(), 100);
    }
  }

  private tick() {
    const now = Date.now();
    const toDismiss: string[] = [];

    for (const toast of this.toasts) {
      if (!toast.visible || toast.pausedAt !== null) continue;
      if (toast.dismissAt !== null && now >= toast.dismissAt) {
        toDismiss.push(toast.id);
      }
    }

    for (const id of toDismiss) {
      this.dismiss(id);
    }
  }

  add(options: ToastOptions): string {
    const duration = options.duration === undefined ? 6000 : options.duration;
    const now = Date.now();
    const hasDescription = !!options.description;
    const expanded = options.expanded ?? false;
    const expandOnHover = !expanded && hasDescription;
    const position = options.position || 'top-right';

    const existing = this.toasts.find((t) => t.position === position && t.visible);

    if (existing) {
      existing.swapping = true;

      setTimeout(() => {
        existing.title = options.title;
        existing.description = options.description;
        existing.type = options.type || 'info';
        existing.button = options.button;
        existing.duration = duration;
        existing.expandOnHover = !expanded && hasDescription;
        existing.expanded = expanded;
        existing.dismissAt = duration !== null && duration > 0 ? now + duration : null;
        existing.pausedAt = null;

        setTimeout(() => {
          existing.swapping = false;

          if (hasDescription && options.autoExpand !== false) {
            const delay = typeof options.autoExpand === 'number' ? options.autoExpand : 1500;
            setTimeout(() => {
              if (existing.visible) existing.expanded = true;
            }, delay);
          }
        }, 50);
      }, 250);

      return existing.id;
    }

    const id = generateId();

    this.toasts.push({
      ...options,
      id,
      type: options.type || 'info',
      position,
      duration,
      createdAt: now,
      visible: false,
      swapping: false,
      expanded,
      pausedAt: null,
      dismissAt: duration !== null && duration > 0 ? now + duration : null,
      expandOnHover
    });

    if (browser) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const toast = this.toasts.find((t) => t.id === id);
          if (toast) toast.visible = true;
        });
      });

      if (hasDescription && options.autoExpand !== false) {
        const delay = typeof options.autoExpand === 'number' ? options.autoExpand : 1500;
        setTimeout(() => {
          const toast = this.toasts.find((t) => t.id === id);
          if (toast && toast.visible) toast.expanded = true;
        }, delay);
      }
    } else {
      const toast = this.toasts.find((t) => t.id === id);
      if (toast) toast.visible = true;
    }

    return id;
  }

  dismiss(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast) return;
    toast.visible = false;
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 600);
  }

  clear(position?: ToastPosition) {
    const targets = position
      ? this.toasts.filter((t) => t.position === position)
      : [...this.toasts];
    for (const toast of targets) {
      this.dismiss(toast.id);
    }
  }

  pause(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast && toast.pausedAt === null) {
      toast.pausedAt = Date.now();
    }
  }

  resume(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast && toast.pausedAt !== null) {
      const paused = Date.now() - toast.pausedAt;
      if (toast.dismissAt !== null) toast.dismissAt += paused;
      toast.pausedAt = null;
    }
  }

  update(id: string, updates: Partial<ToastOptions>) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast) return;
    Object.assign(toast, updates);
  }

  success(opts: string | ToastOptions): string {
    const options = typeof opts === 'string' ? { title: opts } : opts;
    return this.add({ ...options, type: 'success' });
  }

  error(opts: string | ToastOptions): string {
    const options = typeof opts === 'string' ? { title: opts } : opts;
    return this.add({ ...options, type: 'error' });
  }

  warning(opts: string | ToastOptions): string {
    const options = typeof opts === 'string' ? { title: opts } : opts;
    return this.add({ ...options, type: 'warning' });
  }

  info(opts: string | ToastOptions): string {
    const options = typeof opts === 'string' ? { title: opts } : opts;
    return this.add({ ...options, type: 'info' });
  }

  async promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: string | ToastOptions;
      success: string | ToastOptions | ((data: T) => ToastOptions);
      error: string | ToastOptions | ((err: unknown) => ToastOptions);
    }
  ): Promise<T> {
    const loadingOpts = typeof msgs.loading === 'string' ? { title: msgs.loading } : msgs.loading;
    const id = this.add({ ...loadingOpts, type: 'loading', duration: null });

    try {
      const data = await promise;
      const rawSuccess = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      const successOpts = typeof rawSuccess === 'string' ? { title: rawSuccess } : rawSuccess;
      this.update(id, { ...successOpts, type: 'success', duration: successOpts.duration ?? 6000 });
      this.resetTimer(id);
      return data;
    } catch (err) {
      const rawError = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      const errorOpts = typeof rawError === 'string' ? { title: rawError } : rawError;
      this.update(id, { ...errorOpts, type: 'error', duration: errorOpts.duration ?? 6000 });
      this.resetTimer(id);
      throw err;
    }
  }

  private resetTimer(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.duration === null) return;
    const now = Date.now();
    toast.dismissAt = now + toast.duration;
  }
}

export const toastStore = new ToastStore();
