import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { MEMORY_SYMBOLS } from '../games/memoryEngine';

describe('MemoryMatchGame', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('starts with the instructions and deals face down cards after pressing start', async () => {
    const user = userEvent.setup();
    render(<MemoryMatchGame onFinish={vi.fn()} />);

    expect(screen.getByText(/Find every matching pair/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getAllByRole('button')).toHaveLength(MEMORY_SYMBOLS.length * 2);
    expect(screen.getByRole('button', { name: 'Card 1, face down' })).toBeInTheDocument();
  });

  it('reveals a card with an accessible name when it is flipped', async () => {
    const user = userEvent.setup();
    render(<MemoryMatchGame onFinish={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Start' }));

    await user.click(screen.getByRole('button', { name: 'Card 1, face down' }));

    expect(screen.getByRole('button', { name: /face up/ })).toBeInTheDocument();
    expect(screen.getByText('0 moves')).toBeInTheDocument();
  });
});
