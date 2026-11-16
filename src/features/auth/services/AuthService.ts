import { apiClient } from '../../../lib/api-client';
import { authSessionSchema, userSchema, type AuthSession, type User } from '../types';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PreferencesChange {
  emailNotifications?: boolean;
  locale?: 'en' | 'es';
}

export class AuthService {
  register(input: RegisterInput): Promise<AuthSession> {
    return apiClient.post('/auth/register', input, authSessionSchema);
  }

  login(input: LoginInput): Promise<AuthSession> {
    return apiClient.post('/auth/login', input, authSessionSchema);
  }

  async restoreSession(): Promise<AuthSession> {
    const accessToken = await apiClient.refreshAccessToken();
    if (!accessToken) throw new Error('No active session');
    apiClient.setAccessToken(accessToken);
    const user = await apiClient.get<User>('/auth/me', userSchema);
    return { user, accessToken };
  }

  logout(): Promise<void> {
    return apiClient.request('/auth/logout', { method: 'POST' });
  }

  updatePreferences(changes: PreferencesChange): Promise<User> {
    return apiClient.patch('/auth/me/preferences', changes, userSchema);
  }

  sendTestEmail(): Promise<void> {
    return apiClient.request('/auth/me/test-email', { method: 'POST' });
  }

  unsubscribe(token: string): Promise<void> {
    return apiClient.request('/auth/unsubscribe', { method: 'POST', body: { token } });
  }

  deleteAccount(): Promise<void> {
    return apiClient.remove('/auth/me');
  }
}

export const authService = new AuthService();
