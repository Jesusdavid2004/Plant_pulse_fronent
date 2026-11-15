import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '../../../lib/api-client';
import { authService, type LoginInput, type RegisterInput } from '../services/AuthService';
import type { AuthSession, User } from '../types';
import { AuthContext, type AuthStatus } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const startSession = useCallback((session: AuthSession) => {
    apiClient.setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const endSession = useCallback(() => {
    apiClient.setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    apiClient.onSessionExpired(endSession);
    authService.restoreSession().then(startSession).catch(endSession);
    return () => apiClient.onSessionExpired(null);
  }, [startSession, endSession]);

  const login = useCallback(
    async (input: LoginInput) => startSession(await authService.login(input)),
    [startSession],
  );
  const register = useCallback(
    async (input: RegisterInput) => startSession(await authService.register(input)),
    [startSession],
  );
  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    endSession();
  }, [endSession]);
  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    endSession();
  }, [endSession]);

  const value = useMemo(
    () => ({ status, user, login, register, logout, deleteAccount }),
    [status, user, login, register, logout, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
