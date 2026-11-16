import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { ApiError } from '../../../lib/api-client';
import { AddPlantDialog } from '../components/AddPlantDialog';
import { plantService } from '../services/PlantService';
import type { PlantRegistration } from '../types';

vi.mock('../services/PlantService', () => ({
  plantService: { registerWithPhoto: vi.fn() },
}));

const registerWithPhoto = vi.mocked(plantService.registerWithPhoto);

const registration: PlantRegistration = {
  plant: {
    id: 'plant-1',
    name: 'Monstera',
    species: 'Monstera deliciosa',
    commonName: 'Monstera',
    careCategory: 'TROPICAL',
    petTraits: {
      leafShape: 'HEART',
      leafCount: 5,
      leafColor: 'GREEN',
      bloomShape: 'NONE',
      bloomColor: 'PINK',
    },
    status: 'active',
    latestHealthScore: null,
    createdAt: '2026-11-15T12:00:00Z',
  },
  analysis: {
    id: 'analysis-1',
    plantId: 'plant-1',
    healthScore: 92,
    status: 'healthy',
    diagnosis: 'Looks great.',
    carePlan: ['Water weekly'],
    createdAt: '2026-11-15T12:00:00Z',
  },
  advice: ['Water weekly'],
  visibleSigns: ['Glossy leaves'],
};

const photo = new File(['bytes'], 'plant.jpg', { type: 'image/jpeg' });

function renderDialog() {
  const onFinished = vi.fn();
  render(<AddPlantDialog open onClose={vi.fn()} onFinished={onFinished} />);
  return { onFinished };
}

describe('AddPlantDialog', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('cannot submit until a photo is chosen', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Identify my plant' })).toBeDisabled();
  });

  it('identifies the plant from the photo and shows the analysis before continuing', async () => {
    registerWithPhoto.mockResolvedValue(registration);
    const user = userEvent.setup();
    const { onFinished } = renderDialog();

    await user.upload(screen.getByLabelText('Choose a photo'), photo);
    await user.click(screen.getByRole('button', { name: 'Identify my plant' }));

    expect(registerWithPhoto).toHaveBeenCalledWith(photo, undefined);
    expect(await screen.findByText('We found Monstera (Monstera deliciosa).')).toBeInTheDocument();
    expect(screen.getByText('Glossy leaves')).toBeInTheDocument();
    expect(
      screen.getByText(/does not replace the advice of a plant specialist/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Meet my plant' }));
    expect(onFinished).toHaveBeenCalledWith(registration);
  });

  it('sends the name chosen by the user', async () => {
    registerWithPhoto.mockResolvedValue(registration);
    const user = userEvent.setup();
    renderDialog();

    await user.upload(screen.getByLabelText('Choose a photo'), photo);
    await user.type(screen.getByLabelText('Name (optional)'), 'My jungle');
    await user.click(screen.getByRole('button', { name: 'Identify my plant' }));

    expect(registerWithPhoto).toHaveBeenCalledWith(photo, 'My jungle');
  });

  it('explains in the active language when the photo does not show a plant', async () => {
    registerWithPhoto.mockRejectedValue(new ApiError(422, 'NOT_A_PLANT', 'errors.notAPlant'));
    const user = userEvent.setup();
    renderDialog();

    await user.upload(screen.getByLabelText('Choose a photo'), photo);
    await user.click(screen.getByRole('button', { name: 'Identify my plant' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't see a plant in that photo. Try a clearer picture.",
    );
    expect(screen.getByRole('button', { name: 'Identify my plant' })).toBeEnabled();
  });
});
