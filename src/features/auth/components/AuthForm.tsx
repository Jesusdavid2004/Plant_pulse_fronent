import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { TextField } from '../../../components/ui/TextField';
import { ApiError } from '../../../lib/api-client';
import { LocalizedLink } from '../../../i18n/LocalizedLink';
import { useLocalizedNavigate } from '../../../i18n/useLocale';
import { useAuth } from '../hooks/authContext';
import { MIN_PASSWORD_LENGTH } from '../types';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const destination = (location.state as { from?: string } | null)?.from;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorKey(null);
    setSubmitting(true);
    try {
      if (isRegister)
        await register({ email, password, ...(name.trim() && { name: name.trim() }) });
      else await login({ email, password });
      navigate(destination?.replace(/^\/(en|es)/, '') || '/dashboard', { replace: true });
    } catch (error) {
      setErrorKey(error instanceof ApiError ? error.messageKey : 'errors.generic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-5 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">
        {t(isRegister ? 'auth.registerTitle' : 'auth.loginTitle')}
      </h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {isRegister && (
          <TextField
            label={t('auth.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={100}
          />
        )}
        <TextField
          label={t('auth.email')}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <TextField
          label={t('auth.password')}
          type="password"
          required
          minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        {isRegister && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('auth.passwordHint', { count: MIN_PASSWORD_LENGTH })}
          </p>
        )}
        {errorKey && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {t(errorKey, { defaultValue: t('errors.generic') })}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          {t(isRegister ? 'auth.registerSubmit' : 'auth.loginSubmit')}
        </Button>
      </form>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {t(isRegister ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
        <LocalizedLink
          to={isRegister ? '/login' : '/register'}
          className="font-semibold text-[var(--color-primary)] underline"
        >
          {t(isRegister ? 'auth.loginLink' : 'auth.registerLink')}
        </LocalizedLink>
      </p>
    </Card>
  );
}
