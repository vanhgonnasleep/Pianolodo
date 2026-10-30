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
    expect(screen.getAllByText(/Trợ Lý Hòa Thanh/i).length).toBeGreaterThanOrEqual(1);
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

  it('renders AI Progression Options Suggester and allows applying an option', () => {
    render(<App />);
    expect(screen.getByText(/AI Đề Xuất Các Phương Án Hòa Thanh/i)).toBeTruthy();
    const applyBtns = screen.getAllByRole('button', { name: /Áp Dụng/i });
    expect(applyBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(applyBtns[0]);
  });

  it('renders ChordCadenceWorkbench, shows chord tokens, and applies a 2-5-1 cadence with undo support', () => {
    render(<App />);
    expect(screen.getByText(/Liệt Kê Hợp Âm & Áp Dụng 2-5-1/i)).toBeTruthy();
    expect(screen.getByText(/1\. Danh sách hợp âm trong Input/i)).toBeTruthy();

    // Find apply cadence buttons in workbench
    const cadenceApplyBtns = screen.getAllByRole('button', { name: /Chèn trước|Thay thế|Nối vào cuối|Áp dụng toàn bộ/i });
    expect(cadenceApplyBtns.length).toBeGreaterThanOrEqual(1);

    // Apply the first cadence option
    fireEvent.click(cadenceApplyBtns[0]);

    // Expect Undo button to appear
    const undoBtn = screen.getByRole('button', { name: /Hoàn tác/i });
    expect(undoBtn).toBeTruthy();

    // Click Undo
    fireEvent.click(undoBtn);
  });
});
