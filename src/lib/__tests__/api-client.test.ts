import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, apiClient } from '../api-client';

const schema = z.object({ value: z.string() });

function envelope(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('apiClient', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    apiClient.setAccessToken(null);
    apiClient.onSessionExpired(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('validates the response data with the schema', async () => {
    fetchMock.mockResolvedValue(envelope({ success: true, data: { value: 'ok' } }));

    await expect(apiClient.get('/thing', schema)).resolves.toEqual({ value: 'ok' });
  });

  it('rejects data that does not match the schema instead of trusting the network', async () => {
    fetchMock.mockResolvedValue(envelope({ success: true, data: { value: 42 } }));

    await expect(apiClient.get('/thing', schema)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('turns an error envelope into an ApiError carrying the translation key', async () => {
    fetchMock.mockResolvedValue(
      envelope(
        { success: false, code: 'PLANT_NOT_FOUND', message_key: 'errors.plantNotFound' },
        404,
      ),
    );

    const failure = apiClient.get('/plants/x', schema);

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 404,
      messageKey: 'errors.plantNotFound',
    });
  });

  it('sends the language, cookies and the bearer token', async () => {
    apiClient.setAccessToken('token-123');
    fetchMock.mockResolvedValue(envelope({ success: true, data: { value: 'ok' } }));

    await apiClient.get('/thing', schema);

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-123');
    expect(headers['Accept-Language']).toBeTruthy();
    expect(init?.credentials).toBe('include');
  });

  it('refreshes the session once on a 401 and retries the request with the new token', async () => {
    apiClient.setAccessToken('expired');
    fetchMock
      .mockResolvedValueOnce(envelope({ success: false, code: 'UNAUTHORIZED' }, 401))
      .mockResolvedValueOnce(envelope({ success: true, data: { accessToken: 'fresh' } }))
      .mockResolvedValueOnce(envelope({ success: true, data: { value: 'retried' } }));

    const result = await apiClient.get('/thing', schema);

    expect(result.value).toBe('retried');
    const retryHeaders = fetchMock.mock.calls[2]![1]?.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe('Bearer fresh');
  });

  it('notifies the app when the session cannot be refreshed', async () => {
    const onExpired = vi.fn();
    apiClient.onSessionExpired(onExpired);
    apiClient.setAccessToken('expired');
    fetchMock
      .mockResolvedValueOnce(envelope({ success: false, code: 'UNAUTHORIZED' }, 401))
      .mockResolvedValueOnce(envelope({ success: false, code: 'INVALID_REFRESH_TOKEN' }, 401))
      .mockResolvedValueOnce(envelope({ success: false, code: 'UNAUTHORIZED' }, 401));

    await expect(apiClient.get('/thing', schema)).rejects.toBeInstanceOf(ApiError);

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('shares a single refresh request between concurrent calls', async () => {
    fetchMock.mockImplementation(async () =>
      envelope({ success: true, data: { accessToken: 'one' } }),
    );

    await Promise.all([apiClient.refreshAccessToken(), apiClient.refreshAccessToken()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
