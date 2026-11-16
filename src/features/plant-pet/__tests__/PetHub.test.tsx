import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { PetHub } from '../components/PetHub';
import { WardrobePanel } from '../components/WardrobePanel';
import { DEFAULT_PET_TRAITS } from '../leafGeometry';
import { careService } from '../services/CareService';
import { petService } from '../services/PetService';
import type { PetProfile } from '../types';

vi.mock('../services/CareService', () => ({
  careService: { getMood: vi.fn(), logCare: vi.fn() },
}));
vi.mock('../services/PetService', () => ({
  petService: { getProfile: vi.fn(), submitGame: vi.fn(), buyPot: vi.fn(), equip: vi.fn() },
}));

const getProfile = vi.mocked(petService.getProfile);
const equip = vi.mocked(petService.equip);
const getMood = vi.mocked(careService.getMood);
const logCare = vi.mocked(careService.logCare);

function profile(overrides: Partial<PetProfile> = {}): PetProfile {
  return {
    plantId: 'plant-1',
    level: 2,
    xp: 50,
    xpIntoLevel: 10,
    xpForNextLevel: 120,
    coins: 40,
    scene: 'LIVING_ROOM',
    pot: 'TERRACOTTA',
    dailyCoinsRemaining: 60,
    scenes: [
      { key: 'LIVING_ROOM', unlockLevel: 1, unlocked: true },
      { key: 'GARDEN', unlockLevel: 2, unlocked: true },
      { key: 'BEACH', unlockLevel: 5, unlocked: false },
    ],
    pots: [
      { key: 'TERRACOTTA', price: 0, owned: true },
      { key: 'BLUE', price: 30, owned: false },
      { key: 'GOLD', price: 150, owned: false },
    ],
    ...overrides,
  };
}

const happyMood = {
  plantId: 'plant-1',
  mood: 'HAPPY' as const,
  mostUrgentNeed: null,
  needs: [
    { type: 'WATER' as const, level: 'SATISFIED' as const, daysSinceLastCare: 0 },
    { type: 'SUN' as const, level: 'SATISFIED' as const, daysSinceLastCare: 0 },
    { type: 'FERTILIZE' as const, level: 'SATISFIED' as const, daysSinceLastCare: 0 },
  ],
};

describe('PetHub', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
    getMood.mockResolvedValue(happyMood);
  });

  it('shows the level, experience and coins of the plant', async () => {
    getProfile.mockResolvedValue(profile());

    render(<PetHub plantId="plant-1" plantName="Sprout" traits={DEFAULT_PET_TRAITS} />);

    expect(await screen.findByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('40 coins')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Experience' })).toHaveAttribute(
      'aria-valuenow',
      '10',
    );
  });

  it('shows an error with a retry when the profile cannot be loaded', async () => {
    getProfile.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(profile());
    const user = userEvent.setup();

    render(<PetHub plantId="plant-1" plantName="Sprout" traits={DEFAULT_PET_TRAITS} />);
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Level 2')).toBeInTheDocument();
  });

  it('announces the reward after caring for the plant', async () => {
    getProfile.mockResolvedValue(profile());
    logCare.mockResolvedValue({
      plantId: 'plant-1',
      type: 'WATER',
      occurredAt: '2026-11-16T12:00:00Z',
      reward: { xp: 10, coins: 5 },
      leveledUp: false,
      level: 2,
    });
    const user = userEvent.setup();

    render(<PetHub plantId="plant-1" plantName="Sprout" traits={DEFAULT_PET_TRAITS} />);
    await user.click(await screen.findByRole('button', { name: 'Water' }));

    expect(await screen.findByText('You earned 10 XP and 5 coins.')).toBeInTheDocument();
  });

  it('lets the user switch to the games and style tabs', async () => {
    getProfile.mockResolvedValue(profile());
    const user = userEvent.setup();

    render(<PetHub plantId="plant-1" plantName="Sprout" traits={DEFAULT_PET_TRAITS} />);
    await user.click(await screen.findByRole('tab', { name: 'Play' }));
    expect(screen.getByRole('heading', { name: 'Catch the drops' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Memory match' })).toBeInTheDocument();

    equip.mockResolvedValue(profile({ scene: 'GARDEN' }));
    await user.click(screen.getByRole('tab', { name: 'Style' }));
    const gardenCard = screen.getByText('Garden').closest('li')!;
    await user.click(gardenCard.querySelector('button')!);

    await waitFor(() => expect(equip).toHaveBeenCalledWith('plant-1', { scene: 'GARDEN' }));
  });
});

describe('WardrobePanel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  const noop = () => undefined;

  it('explains when a scene unlocks and disables pots that cost too much', () => {
    render(
      <WardrobePanel
        profile={profile()}
        busy={false}
        failed={false}
        onEquipScene={noop}
        onEquipPot={noop}
        onBuyPot={noop}
      />,
    );

    expect(screen.getByText('Unlocks at level 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy for 30 coins' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buy for 150 coins' })).toBeDisabled();
  });

  it('asks to buy a pot the user can afford', async () => {
    const onBuyPot = vi.fn();
    const user = userEvent.setup();
    render(
      <WardrobePanel
        profile={profile()}
        busy={false}
        failed={false}
        onEquipScene={noop}
        onEquipPot={noop}
        onBuyPot={onBuyPot}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Buy for 30 coins' }));

    expect(onBuyPot).toHaveBeenCalledWith('BLUE');
  });

  it('shows an alert when the last change failed', () => {
    render(
      <WardrobePanel
        profile={profile()}
        busy={false}
        failed
        onEquipScene={noop}
        onEquipPot={noop}
        onBuyPot={noop}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('We could not change that');
  });
});
