import type { ZodType } from 'zod';
import i18n from '../i18n';
import { config } from './config';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NO_CONTENT = 204;
const CSRF_HEADER = 'x-requested-with';
const CSRF_VALUE = 'plantpulse';
const REFRESH_PATH = '/auth/refresh';
const AUTH_PATH_PREFIX = '/auth/';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messageKey: string;

  constructor(status: number, code: string, messageKey: string) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.messageKey = messageKey;
  }
}

interface ErrorEnvelope {
  code?: string;
  message_key?: string;
}

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  form?: FormData;
  schema?: ZodType<T>;
}

type SessionListener = () => void;

class ApiClient {
  private accessToken: string | null = null;
  private refreshInFlight: Promise<string | null> | null = null;
  private sessionExpiredListener: SessionListener | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  onSessionExpired(listener: SessionListener | null): void {
    this.sessionExpiredListener = listener;
  }

  async request<T = void>(path: string, options: RequestOptions<T> = {}): Promise<T> {
    const response = await this.send(path, options);
    if (response.status === HTTP_UNAUTHORIZED && this.canRefresh(path)) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) return this.parse(await this.send(path, options), options.schema);
      this.sessionExpiredListener?.();
    }
    return this.parse(response, options.schema);
  }

  get<T>(path: string, schema: ZodType<T>): Promise<T> {
    return this.request(path, { schema });
  }

  post<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
    return this.request(path, { method: 'POST', body, schema });
  }

  patch<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
    return this.request(path, { method: 'PATCH', body, schema });
  }

  upload<T>(path: string, form: FormData, schema: ZodType<T>): Promise<T> {
    return this.request(path, { method: 'POST', form, schema });
  }

  remove(path: string): Promise<void> {
    return this.request(path, { method: 'DELETE' });
  }

  async refreshAccessToken(): Promise<string | null> {
    this.refreshInFlight ??= this.performRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private canRefresh(path: string): boolean {
    return this.accessToken !== null && !path.startsWith(AUTH_PATH_PREFIX);
  }

  private async performRefresh(): Promise<string | null> {
    try {
      const response = await this.send(REFRESH_PATH, { method: 'POST' });
      if (!response.ok) return null;
      const envelope = (await response.json()) as { data?: { accessToken?: string } };
      this.accessToken = envelope.data?.accessToken ?? null;
      return this.accessToken;
    } catch {
      return null;
    }
  }

  private send<T>(path: string, options: RequestOptions<T>): Promise<Response> {
    const headers: Record<string, string> = {
      'Accept-Language': i18n.language,
      [CSRF_HEADER]: CSRF_VALUE,
    };
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    const body = options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : null);
    return fetch(`${config.apiUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      body,
    });
  }

  private async parse<T>(response: Response, schema: ZodType<T> | undefined): Promise<T> {
    if (response.status === HTTP_NO_CONTENT) return undefined as T;

    const envelope = (await response.json().catch(() => ({}))) as ErrorEnvelope & {
      data?: unknown;
    };
    if (!response.ok) {
      throw new ApiError(
        response.status,
        envelope.code ?? 'UNKNOWN_ERROR',
        envelope.message_key ?? 'errors.generic',
      );
    }
    if (!schema) return undefined as T;

    const result = schema.safeParse(envelope.data);
    if (!result.success) throw new ApiError(response.status, 'INVALID_RESPONSE', 'errors.generic');
    return result.data;
  }
}

export const apiClient = new ApiClient();
