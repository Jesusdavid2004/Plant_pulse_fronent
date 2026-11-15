import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { PlantPet } from '../components/PlantPet';
import { careService } from '../services/CareService';
import type { PlantMood } from '../types';

vi.mock('../services/CareService', () => ({
  careService: { getMood: vi.fn(), logCare: vi.fn() },
}));

const getMood = vi.mocked(careService.getMood);
const logCare = vi.mocked(careService.logCare);

function moodResponse(overrides: Partial<PlantMood> = {}): PlantMood {
  return {
    plantId: 'plant-1',
    mood: 'HAPPY',
    mostUrgentNeed: null,
    needs: [
      { type: 'WATER', level: 'SATISFIED', daysSinceLastCare: 1 },
      { type: 'SUN', level: 'SATISFIED', daysSinceLastCare: 0 },
      { type: 'FERTILIZE', level: 'SATISFIED', daysSinceLastCare: 3 },
    ],
    ...overrides,
  };
}

const thirstyResponse = moodResponse({
  mood: 'SAD',
  mostUrgentNeed: 'WATER',
  needs: [
    { type: 'WATER', level: 'CRITICAL', daysSinceLastCare: 12 },
    { type: 'SUN', level: 'SATISFIED', daysSinceLastCare: 0 },
    { type: 'FERTILIZE', level: 'SATISFIED', daysSinceLastCare: 3 },
  ],
});

describe('PlantPet', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('shows a loading state while the plant mood is being fetched', () => {
    getMood.mockReturnValue(new Promise(() => undefined));

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);

    expect(screen.getByText('Waking your plant up...')).toBeInTheDocument();
  });

  it('shows a happy message when every need is satisfied', async () => {
    getMood.mockResolvedValue(moodResponse());

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);

    expect(await screen.findByText(/I feel great today/)).toBeInTheDocument();
  });

  it('asks for water in an urgent tone when watering is long overdue', async () => {
    getMood.mockResolvedValue(thirstyResponse);

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);

    expect(await screen.findByText(/so thirsty/)).toBeInTheDocument();
    expect(screen.getByText(/12 days ago/)).toBeInTheDocument();
  });

  it('thanks the user and refreshes the mood after watering', async () => {
    getMood.mockResolvedValueOnce(thirstyResponse).mockResolvedValue(moodResponse());
    logCare.mockResolvedValue({
      plantId: 'plant-1',
      type: 'WATER',
      occurredAt: '2026-11-15T12:00:00Z',
    });
    const user = userEvent.setup();

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);
    await user.click(await screen.findByRole('button', { name: 'Water' }));

    expect(logCare).toHaveBeenCalledWith('plant-1', 'WATER');
    expect(await screen.findByText(/Glug glug/)).toBeInTheDocument();
    await waitFor(() => expect(getMood).toHaveBeenCalledTimes(2));
  });

  it('offers a retry when the mood cannot be loaded', async () => {
    getMood.mockRejectedValueOnce(new Error('network')).mockResolvedValue(moodResponse());
    const user = userEvent.setup();

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText(/I feel great today/)).toBeInTheDocument();
  });

  it('speaks Spanish when the language is switched', async () => {
    await i18n.changeLanguage('es');
    getMood.mockResolvedValue(thirstyResponse);

    render(<PlantPet plantId="plant-1" plantName="Brote" />);

    expect(await screen.findByText(/muchísima sed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regar' })).toBeInTheDocument();
  });

  it('always shows the care advice disclaimer', async () => {
    getMood.mockResolvedValue(moodResponse());

    render(<PlantPet plantId="plant-1" plantName="Sprout" />);

    expect(
      await screen.findByText(/do not replace advice from a plant specialist/),
    ).toBeInTheDocument();
  });
});
