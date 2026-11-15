import { z } from 'zod';
import { apiClient } from '../../../lib/api-client';
import {
  analysisSchema,
  checkupSchema,
  plantSchema,
  registrationSchema,
  type Analysis,
  type Plant,
  type PlantCheckup,
  type PlantRegistration,
} from '../types';

const IMAGE_FIELD = 'image';
const NAME_FIELD = 'name';

function photoForm(photo: File, name?: string): FormData {
  const form = new FormData();
  form.append(IMAGE_FIELD, photo);
  if (name) form.append(NAME_FIELD, name);
  return form;
}

export class PlantService {
  list(): Promise<Plant[]> {
    return apiClient.get('/plants', z.array(plantSchema));
  }

  get(plantId: string): Promise<Plant> {
    return apiClient.get(`/plants/${plantId}`, plantSchema);
  }

  registerWithPhoto(photo: File, name?: string): Promise<PlantRegistration> {
    return apiClient.upload('/plants', photoForm(photo, name), registrationSchema);
  }

  checkup(plantId: string, photo: File): Promise<PlantCheckup> {
    return apiClient.upload(`/plants/${plantId}/checkups`, photoForm(photo), checkupSchema);
  }

  analyses(plantId: string): Promise<Analysis[]> {
    return apiClient.get(`/plants/${plantId}/analyses`, z.array(analysisSchema));
  }

  rename(plantId: string, name: string): Promise<Plant> {
    return apiClient.patch(`/plants/${plantId}`, { name }, plantSchema);
  }

  remove(plantId: string): Promise<void> {
    return apiClient.remove(`/plants/${plantId}`);
  }
}

export const plantService = new PlantService();
