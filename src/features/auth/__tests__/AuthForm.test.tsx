import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { ApiError } from '../../../lib/api-client';
import { renderWithRouter } from '../../../test/renderWithRouter';
import { AuthForm } from '../components/AuthForm';
import { ProtectedRoute } from '../components/ProtectedRoute';

describe('AuthForm', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('logs in with the typed credentials and goes to the dashboard', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithRouter(<AuthForm mode="login" />, { auth: { login } });

    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(login).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'correct-horse-battery',
    });
    expect(await screen.findByText('dashboard page')).toBeInTheDocument();
  });

  it('shows a translated message when the credentials are wrong', async () => {
    const login = vi
      .fn()
      .mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'errors.invalidCredentials'));
    const user = userEvent.setup();
    renderWithRouter(<AuthForm mode="login" />, { auth: { login } });

    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password is incorrect.',
    );
  });

  it('asks for a name and a longer password when registering', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithRouter(<AuthForm mode="register" />, {
      path: '/en/register',
      route: '/:locale/register',
      auth: { register },
    });

    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name (optional)'), 'Ana');
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        email: 'ana@example.com',
        password: 'correct-horse-battery',
        name: 'Ana',
      }),
    );
  });

  it('labels every input for assistive technology', () => {
    renderWithRouter(<AuthForm mode="login" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });
});

describe('ProtectedRoute', () => {
  function renderProtected(status: 'loading' | 'authenticated' | 'anonymous') {
    return renderWithRouter(<ProtectedRoute />, {
      path: '/es/dashboard',
      route: '/:locale/dashboard',
      auth: { status },
    });
  }

  it('sends anonymous visitors to the login page of the same language', () => {
    renderProtected('anonymous');

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('shows a loading state while the session is being restored', () => {
    renderProtected('loading');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('login page')).not.toBeInTheDocument();
  });
});
