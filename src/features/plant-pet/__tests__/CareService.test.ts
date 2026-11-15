import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/api-client';
import { CareService } from '../services/CareService';
import { plantMoodSchema } from '../types';

vi.mock('../../../lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

describe('CareService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('asks the API for the mood of the plant and validates it with the mood schema', async () => {
    get.mockResolvedValue({ plantId: 'p', mood: 'HAPPY', needs: [], mostUrgentNeed: null });

    const result = await new CareService().getMood('p');

    expect(get).toHaveBeenCalledWith('/plants/p/mood', plantMoodSchema);
    expect(result.mood).toBe('HAPPY');
  });

  it('logs a care action with its type', async () => {
    post.mockResolvedValue({ plantId: 'p', type: 'WATER', occurredAt: '2026-11-15T12:00:00Z' });

    await new CareService().logCare('p', 'WATER');

    expect(post).toHaveBeenCalledWith('/plants/p/care', { type: 'WATER' }, expect.anything());
  });
});

describe('plantMoodSchema', () => {
  it('rejects an unknown mood instead of trusting the network', () => {
    const result = plantMoodSchema.safeParse({
      plantId: 'p',
      mood: 'FURIOUS',
      needs: [],
      mostUrgentNeed: null,
    });

    expect(result.success).toBe(false);
  });
});
