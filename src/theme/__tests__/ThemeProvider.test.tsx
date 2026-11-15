import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../themeContext';

function Probe() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return (
    <div>
      <p data-testid="state">{`${preference}:${resolvedTheme}`}</p>
      <button onClick={() => setPreference('dark')}>dark</button>
      <button onClick={() => setPreference('light')}>light</button>
      <button onClick={() => setPreference('system')}>system</button>
    </div>
  );
}

function mockSystemDark(isDark: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: isDark,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => vi.restoreAllMocks());

  it('follows the operating system setting by default', () => {
    mockSystemDark(true);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('system:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('lets the user override the system theme and remembers the choice', async () => {
    mockSystemDark(true);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'light' }));

    expect(screen.getByTestId('state')).toHaveTextContent('light:light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('can go back to following the system', async () => {
    mockSystemDark(false);
    localStorage.setItem('theme', 'dark');
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('state')).toHaveTextContent('dark:dark');

    await user.click(screen.getByRole('button', { name: 'system' }));

    expect(screen.getByTestId('state')).toHaveTextContent('system:light');
  });
});
