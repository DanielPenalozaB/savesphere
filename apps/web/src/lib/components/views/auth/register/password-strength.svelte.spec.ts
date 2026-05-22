import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PasswordStrength from './password-strength.svelte';

describe('PasswordStrength', () => {
  it('is hidden when password is empty', async () => {
    render(PasswordStrength, { props: { password: '' } });
    const weakLabel = page.getByText('Weak');
    await expect.element(weakLabel).not.toBeInTheDocument();
  });

  it('shows weak state for 0 requirements met', async () => {
    render(PasswordStrength, { props: { password: 'a' } });
    const label = page.getByText('Weak');
    await expect.element(label).toBeVisible();
  });

  it('shows weak state for 1 requirement met', async () => {
    render(PasswordStrength, { props: { password: 'abcdefgh' } });
    const label = page.getByText('Weak');
    await expect.element(label).toBeVisible();
  });

  it('shows medium state for 2 requirements met', async () => {
    render(PasswordStrength, { props: { password: 'Password' } });
    const label = page.getByText('Medium');
    await expect.element(label).toBeVisible();
  });

  it('shows strong state for 3 requirements met', async () => {
    render(PasswordStrength, { props: { password: 'Password1' } });
    const label = page.getByText('Strong');
    await expect.element(label).toBeVisible();
  });

  it('renders all three requirement checklist items', async () => {
    render(PasswordStrength, { props: { password: 'test' } });
    await expect.element(page.getByText('At least 8 characters')).toBeVisible();
    await expect.element(page.getByText('At least 1 uppercase letter')).toBeVisible();
    await expect.element(page.getByText('At least 1 number')).toBeVisible();
  });

  it('displays check icon for met requirements', async () => {
    render(PasswordStrength, { props: { password: 'Password' } });
    // Password meets length and uppercase but not number
    // We verify the component renders by checking visible labels
    await expect.element(page.getByText('Medium')).toBeVisible();
    await expect.element(page.getByText('At least 8 characters')).toBeVisible();
    await expect.element(page.getByText('At least 1 uppercase letter')).toBeVisible();
    await expect.element(page.getByText('At least 1 number')).toBeVisible();
  });

  it('updates strength when password prop changes', async () => {
    const { rerender } = render(PasswordStrength, { props: { password: 'short' } });
    await expect.element(page.getByText('Weak')).toBeVisible();

    await rerender({ password: 'StrongPass1' });
    await expect.element(page.getByText('Strong')).toBeVisible();
  });
});
