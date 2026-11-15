import { apiClient } from '../../../lib/api-client';
import {
  loggedCareSchema,
  plantMoodSchema,
  type CareType,
  type LoggedCare,
  type PlantMood,
} from '../types';

export class CareService {
  getMood(plantId: string): Promise<PlantMood> {
    return apiClient.get(`/plants/${plantId}/mood`, plantMoodSchema);
  }

  logCare(plantId: string, type: CareType): Promise<LoggedCare> {
    return apiClient.post(`/plants/${plantId}/care`, { type }, loggedCareSchema);
  }
}

export const careService = new CareService();
