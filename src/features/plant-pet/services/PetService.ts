import { apiClient } from '../../../lib/api-client';
import {
  gameResultSchema,
  petProfileSchema,
  type GameResult,
  type GameType,
  type PetProfile,
  type PotKey,
  type SceneKey,
} from '../types';

export interface Equipment {
  scene?: SceneKey;
  pot?: PotKey;
}

export class PetService {
  getProfile(plantId: string): Promise<PetProfile> {
    return apiClient.get(`/plants/${plantId}/pet`, petProfileSchema);
  }

  submitGame(plantId: string, game: GameType, score: number): Promise<GameResult> {
    return apiClient.post(`/plants/${plantId}/games`, { game, score }, gameResultSchema);
  }

  buyPot(plantId: string, pot: PotKey): Promise<PetProfile> {
    return apiClient.post(`/plants/${plantId}/pet/pots`, { pot }, petProfileSchema);
  }

  equip(plantId: string, equipment: Equipment): Promise<PetProfile> {
    return apiClient.put(`/plants/${plantId}/pet/equipment`, equipment, petProfileSchema);
  }
}

export const petService = new PetService();
