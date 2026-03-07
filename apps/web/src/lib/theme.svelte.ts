import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

export function getTheme(): Theme {
  if (!browser) return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

class ThemeState {
  current = $state<Theme>(getTheme());

  constructor() {
    if (browser) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.current === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  setTheme(theme: Theme) {
    this.current = theme;
    if (browser) {
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: Theme) {
    if (!browser) return;

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
}

export const themeState = new ThemeState();
