import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../features/auth/hooks/authContext';

export const DEFAULT_AUTH: AuthContextValue = {
  status: 'anonymous',
  user: null,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  deleteAccount: async () => undefined,
};

interface Options {
  path?: string;
  route?: string;
  auth?: Partial<AuthContextValue>;
}

export function renderWithRouter(ui: ReactElement, options: Options = {}) {
  const { path = '/en/login', route = '/:locale/login', auth = {} } = options;

  return render(
    <AuthContext.Provider value={{ ...DEFAULT_AUTH, ...auth }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={ui} />
          <Route path="/:locale/dashboard" element={<p>dashboard page</p>} />
          <Route path="/:locale/register" element={<p>register page</p>} />
          <Route path="/:locale/login" element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}
