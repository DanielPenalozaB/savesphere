import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export type User = {
  id: string;
  email: string;
  fullName: string;
  picture?: string;
  authProvider: 'local' | 'google';
};

class AuthState {
  user = $state<User | null>(null);
  isLoading = $state(true);
  isAuthenticated = $derived(!!this.user);

  constructor() {
    if (browser) {
      this.init();
    } else {
      this.isLoading = false;
    }
  }

  async init() {
    this.isLoading = true;
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        this.user = json.data as User;
      }
    } catch {
      // Not authenticated
    } finally {
      this.isLoading = false;
    }
  }

  login(_token: string, user: User) {
    this.user = user;
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors
    }
    this.user = null;
    goto('/auth/sign-in');
  }
}

export const authState = new AuthState();
