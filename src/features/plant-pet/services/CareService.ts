import { apiClient } from '../../../services/apiClient';
import {
  loggedCareSchema,
  plantMoodSchema,
  type CareType,
  type LoggedCare,
  type PlantMood,
} from '../types';

export class CareRequestError extends Error {
  constructor() {
    super('Care request failed');
    this.name = 'CareRequestError';
  }
}

export class CareService {
  async getMood(plantId: string): Promise<PlantMood> {
    const response = await apiClient.get<unknown>(`/plants/${plantId}/mood`);
    if (!response.success) throw new CareRequestError();
    return plantMoodSchema.parse(response.data);
  }

  async logCare(plantId: string, type: CareType): Promise<LoggedCare> {
    const response = await apiClient.post<unknown>(`/plants/${plantId}/care`, { type });
    if (!response.success) throw new CareRequestError();
    return loggedCareSchema.parse(response.data);
  }
}

export const careService = new CareService();
