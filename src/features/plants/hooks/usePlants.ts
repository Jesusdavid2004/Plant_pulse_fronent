import { useCallback } from 'react';
import { plantService } from '../services/PlantService';
import { useAsyncResource } from './useAsyncResource';

export function usePlants() {
  const load = useCallback(() => plantService.list(), []);
  return useAsyncResource(load);
}

export function usePlantDetail(plantId: string) {
  const loadPlant = useCallback(() => plantService.get(plantId), [plantId]);
  const loadAnalyses = useCallback(() => plantService.analyses(plantId), [plantId]);
  return { plant: useAsyncResource(loadPlant), analyses: useAsyncResource(loadAnalyses) };
}
