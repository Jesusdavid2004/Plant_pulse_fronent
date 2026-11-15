import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { localizedPath } from './routing';
import { useLocale } from './useLocale';

export function LocalizedLink({ to, ...props }: LinkProps & { to: string }) {
  return <Link to={localizedPath(useLocale(), to)} {...props} />;
}

export function LocalizedNavLink({ to, ...props }: NavLinkProps & { to: string }) {
  return <NavLink to={localizedPath(useLocale(), to)} {...props} />;
}
