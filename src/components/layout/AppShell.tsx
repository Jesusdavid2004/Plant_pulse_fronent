import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/authContext';
import { LocalizedLink, LocalizedNavLink } from '../../i18n/LocalizedLink';
import { useLocalizedNavigate } from '../../i18n/useLocale';
import { Button } from '../ui/Button';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINK_CLASS =
  'rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] aria-[current=page]:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]';

export function AppShell() {
  const { t } = useTranslation();
  const { status, user, logout } = useAuth();
  const navigate = useLocalizedNavigate();

  const signOut = async () => {
    navigate('/');
    await logout();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <a
        href="#main"
        className="sr-only rounded-lg bg-[var(--color-surface)] px-4 py-2 focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50"
      >
        {t('nav.skipToContent')}
      </a>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <nav
          aria-label={t('nav.main')}
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
        >
          <LocalizedLink
            to="/"
            className="flex items-center gap-2 rounded-lg text-xl font-bold text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <span aria-hidden="true">🌱</span>
            {t('app.name')}
          </LocalizedLink>

          <div className="flex flex-wrap items-center gap-2">
            {status === 'authenticated' && (
              <LocalizedNavLink to="/dashboard" className={NAV_LINK_CLASS}>
                {t('nav.dashboard')}
              </LocalizedNavLink>
            )}
            <LanguageSwitch />
            <ThemeToggle />
            {status === 'authenticated' ? (
              <>
                <LocalizedNavLink to="/settings" className={NAV_LINK_CLASS}>
                  {user?.name ?? t('nav.account')}
                </LocalizedNavLink>
                <Button variant="secondary" onClick={() => void signOut()}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              status === 'anonymous' && (
                <>
                  <LocalizedNavLink to="/login" className={NAV_LINK_CLASS}>
                    {t('nav.login')}
                  </LocalizedNavLink>
                  <LocalizedLink
                    to="/register"
                    className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                  >
                    {t('nav.register')}
                  </LocalizedLink>
                </>
              )
            )}
          </div>
        </nav>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-4 text-center text-sm text-[var(--color-text-muted)]">
        {t('app.footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
