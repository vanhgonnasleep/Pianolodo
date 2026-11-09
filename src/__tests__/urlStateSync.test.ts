import { describe, it, expect } from 'vitest';
import {
  serializeStudioStateToUrl,
  parseStudioStateFromUrl,
} from '../engine/urlStateSync';

describe('Shareable Studio URL State Sync (Pianolodo 3.0)', () => {
  it('serializes studio state into clean URL query parameters', () => {
    const url = serializeStudioStateToUrl({
      key: 'Eb',
      input: '2 - 5 - 1',
      vibe: 'rnb-neosoul',
      spice: 2,
      bpm: 78,
      groove: 'rnb-pulse',
      voicing: 'rootless-a',
    });

    expect(url).toContain('k=Eb');
    expect(url).toContain('v=rnb-neosoul');
    expect(url).toContain('s=2');
    expect(url).toContain('bpm=78');
    expect(url).toContain('g=rnb-pulse');
    expect(url).toContain('topo=rootless-a');
  });

  it('correctly deserializes URLSearchParams back into studio state', () => {
    const searchParams = new URLSearchParams(
      '?k=F&i=1-6-2-5&v=jazz-bossa&s=3&bpm=120&g=bossa-nova&topo=drop-2'
    );
    const parsed = parseStudioStateFromUrl(searchParams);

    expect(parsed.key).toBe('F');
    expect(parsed.input).toBe('1 - 6 - 2 - 5');
    expect(parsed.vibe).toBe('jazz-bossa');
    expect(parsed.spice).toBe(3);
    expect(parsed.bpm).toBe(120);
    expect(parsed.groove).toBe('bossa-nova');
    expect(parsed.voicing).toBe('drop-2');
  });
});
