import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { renderWithRouter } from '../../../test/renderWithRouter';
import { NotificationSettings } from '../components/NotificationSettings';
import { authService } from '../services/AuthService';
import type { User } from '../types';

vi.mock('../services/AuthService', () => ({
  authService: { sendTestEmail: vi.fn() },
}));

const sendTestEmail = vi.mocked(authService.sendTestEmail);

const user: User = {
  id: 'u1',
  email: 'ana@example.com',
  name: null,
  locale: 'en',
  emailNotifications: true,
};

describe('NotificationSettings', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('turns reminders off using the language the user is browsing in', async () => {
    const updatePreferences = vi.fn().mockResolvedValue(undefined);
    const person = userEvent.setup();
    renderWithRouter(<NotificationSettings />, {
      path: '/es/settings',
      route: '/:locale/settings',
      auth: { user, updatePreferences },
    });

    await person.click(screen.getByRole('switch', { name: /Send me reminders/ }));

    expect(updatePreferences).toHaveBeenCalledWith({ emailNotifications: false, locale: 'es' });
    expect(await screen.findByText('Preference saved.')).toBeInTheDocument();
  });

  it('sends a test email and confirms it', async () => {
    sendTestEmail.mockResolvedValue(undefined);
    const updatePreferences = vi.fn().mockResolvedValue(undefined);
    const person = userEvent.setup();
    renderWithRouter(<NotificationSettings />, {
      path: '/en/settings',
      route: '/:locale/settings',
      auth: { user, updatePreferences },
    });

    await person.click(screen.getByRole('button', { name: 'Send a test email' }));

    expect(await screen.findByText(/Test email sent/)).toBeInTheDocument();
  });

  it('shows an error when the preference cannot be saved', async () => {
    const updatePreferences = vi.fn().mockRejectedValue(new Error('offline'));
    const person = userEvent.setup();
    renderWithRouter(<NotificationSettings />, {
      path: '/en/settings',
      route: '/:locale/settings',
      auth: { user, updatePreferences },
    });

    await person.click(screen.getByRole('switch', { name: /Send me reminders/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not complete that');
  });

  it('disables the test email while reminders are off', () => {
    renderWithRouter(<NotificationSettings />, {
      path: '/en/settings',
      route: '/:locale/settings',
      auth: { user: { ...user, emailNotifications: false } },
    });

    expect(screen.getByRole('button', { name: 'Send a test email' })).toBeDisabled();
  });
});
