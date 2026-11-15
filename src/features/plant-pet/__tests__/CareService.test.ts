import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import { CareRequestError, CareService } from '../services/CareService';

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

describe('CareService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the validated mood snapshot', async () => {
    get.mockResolvedValue({
      success: true,
      data: { plantId: 'p', mood: 'HAPPY', needs: [], mostUrgentNeed: null },
    });

    const result = await new CareService().getMood('p');

    expect(result.mood).toBe('HAPPY');
  });

  it('rejects a response with an unknown mood instead of trusting the network', async () => {
    get.mockResolvedValue({
      success: true,
      data: { plantId: 'p', mood: 'FURIOUS', needs: [], mostUrgentNeed: null },
    });

    await expect(new CareService().getMood('p')).rejects.toThrow();
  });

  it('raises a typed error when the API reports a failure', async () => {
    post.mockResolvedValue({ success: false, error: 'boom' });

    await expect(new CareService().logCare('p', 'WATER')).rejects.toBeInstanceOf(CareRequestError);
  });
});
