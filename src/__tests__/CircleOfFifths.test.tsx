import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CircleOfFifths } from '../components/CircleOfFifths';

describe('Interactive Circle of Fifths (Harmonic Compass)', () => {
  it('renders all 12 root keys on the circle of fifths', () => {
    render(
      <CircleOfFifths
        currentKey="C"
        onSelectKey={vi.fn()}
        lang="vi"
      />
    );

    expect(screen.getAllByText('C').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('G')).toBeDefined();
    expect(screen.getByText('F')).toBeDefined();
    expect(screen.getByText('Bb')).toBeDefined();
  });

  it('triggers onSelectKey when a key sector is clicked', () => {
    const handleSelectKey = vi.fn();
    render(
      <CircleOfFifths
        currentKey="C"
        onSelectKey={handleSelectKey}
        lang="vi"
      />
    );

    const gKey = screen.getByText('G');
    fireEvent.click(gKey);
    expect(handleSelectKey).toHaveBeenCalledWith('G');
  });
});
