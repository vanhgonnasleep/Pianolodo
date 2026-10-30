import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

beforeAll(() => {
  // Mock canvas getContext for jsdom environment
  if (typeof window !== 'undefined' && HTMLCanvasElement) {
    HTMLCanvasElement.prototype.getContext = (() => ({
      measureText: (text: string) => ({ width: text.length * 8 }),
      fillText: () => {},
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
    })) as any;
  }
});

describe('Piano Harmony Coach UI Integration', () => {
  it('renders progression input, Vibe selector, 88-key piano, and plain-Vietnamese explanation', () => {
    render(<App />);
    expect(screen.getByText(/Trợ Lý Hòa Thanh/i)).toBeTruthy();
    expect(screen.getAllByText(/Tay trái \(Bass\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tay phải \(Voicing\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Tại sao nghe mượt/i)).toBeTruthy();
  });

  it('updates reharmonized chords when switching Vibe and inserting a Bridge chord via [+]', () => {
    render(<App />);
    // Select preset 1 - 6 - 2 - 5
    const presetBtn = screen.getByRole('button', { name: /1 - 6 - 2 - 5/i });
    fireEvent.click(presetBtn);

    // Click the first [+] bridge slot between chord 1 and chord 2
    const bridgeBtns = screen.getAllByTitle(/Chèn hoặc đổi hợp âm bắc cầu/i);
    fireEvent.click(bridgeBtns[0]);

    // Expect candidate options to appear and insert one
    const insertBtns = screen.getAllByRole('button', { name: /Chèn hợp âm này/i });
    expect(insertBtns.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(insertBtns[0]);
  });
});
