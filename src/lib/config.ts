const DEFAULT_API_URL = 'http://localhost:3000/api';

export const config = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_API_URL,
} as const;
