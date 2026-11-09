import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeGymView } from '../components/PracticeGymView';
import { voiceChordSequence } from '../engine/voiceLeadingSolver';

describe('Practice Gym & Ear Training (Pianolodo 3.0)', () => {
  const chords = voiceChordSequence(
    [
      { symbol: 'Dm9', romanDegree: 'ii9', functionRole: 'primary', ruleId: 'ext-min9', beats: 4 },
      { symbol: 'G13', romanDegree: 'V13', functionRole: 'primary', ruleId: 'ext-dom13sus4', beats: 4 },
      { symbol: 'Cmaj9', romanDegree: 'Imaj9', functionRole: 'primary', ruleId: 'ext-maj9', beats: 4 },
    ],
    'C'
  );

  it('renders Wait-For-Note practice mode with chord progress', () => {
    render(
      <PracticeGymView
        chords={chords}
        keyRoot="C"
        lang="vi"
      />
    );

    expect(screen.getByText(/Luyện Phím Theo Hợp Âm/i)).toBeTruthy();
    expect(screen.getByText('Dm9')).toBeTruthy();
  });

  it('switches to Ear Training Quiz mode and displays mystery chord options', () => {
    render(
      <PracticeGymView
        chords={chords}
        keyRoot="C"
        lang="vi"
      />
    );

    const quizTabBtn = screen.getByRole('button', { name: /Cảm Âm Màu Sắc/i });
    fireEvent.click(quizTabBtn);

    expect(screen.getByText(/Nghe & Nhận Diện Màu Sắc Hợp Âm/i)).toBeTruthy();
    expect(screen.getByText(/Nghe Lại Âm Thanh/i)).toBeTruthy();
  });
});
