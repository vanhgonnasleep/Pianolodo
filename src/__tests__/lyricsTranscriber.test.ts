import { describe, it, expect } from 'vitest';
import { createFallbackDemoResult } from '../core/audioChordAnalyzer';
import { alignCustomLyricsToSegments } from '../core/lyricsTranscriber';

describe('Hybrid Lyrics & Chord-over-Lyrics Lead Sheet Engine', () => {
  it('aligns multi-line Vietnamese lyrics across detected chord and 3-layer note segments', () => {
    const demo = createFallbackDemoResult('C', 85);
    const customLyrics = [
      'Em ơi Hà Nội phố',
      'Ta còn em mùi hoàng lan',
      'Ta còn em mùi hoa sữa',
      'Con đường vắng rì rào cơn mưa nhỏ',
    ].join('\n');

    const aligned = alignCustomLyricsToSegments(customLyrics, demo.segments);

    expect(aligned).toHaveLength(4);
    expect(aligned[0].rawText).toBe('Em ơi Hà Nội phố');
    expect(aligned[0].tokens[0].chordSymbol).toBe('C');
    expect(aligned[0].tokens[0].melodyNote).toBeTruthy();
    expect(aligned[0].tokens[0].arpeggioHint).toContain('C2');

    expect(aligned[1].tokens[0].chordSymbol).toBe('Am');
    expect(aligned[2].tokens[0].chordSymbol).toBe('F');
    expect(aligned[3].tokens[0].chordSymbol).toBe('G');
  });

  it('falls back gracefully when empty lyrics are provided', () => {
    const demo = createFallbackDemoResult('C', 85);
    const aligned = alignCustomLyricsToSegments('   ', demo.segments);

    expect(aligned).toHaveLength(4);
    expect(aligned[0].tokens[0].chordSymbol).toBe('C');
  });
});
