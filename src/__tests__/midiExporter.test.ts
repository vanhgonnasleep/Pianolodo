import { describe, it, expect } from 'vitest';
import { exportProgressionToMidi } from '../engine/midiExporter';
import { voiceChordSequence } from '../engine/voiceLeadingSolver';

describe('Pure TypeScript Binary MIDI Exporter (Pianolodo 3.0)', () => {
  it('generates a valid Standard MIDI File buffer with MThd and MTrk headers', () => {
    const chords = voiceChordSequence(
      [
        { symbol: 'Dm9', romanDegree: 'ii9', functionRole: 'primary', ruleId: 'ext-min9', beats: 4 },
        { symbol: 'G13', romanDegree: 'V13', functionRole: 'primary', ruleId: 'ext-dom13sus4', beats: 4 },
        { symbol: 'Cmaj9', romanDegree: 'Imaj9', functionRole: 'primary', ruleId: 'ext-maj9', beats: 4 },
      ],
      'C'
    );

    const midiBytes = exportProgressionToMidi(chords, 85);
    expect(midiBytes).toBeInstanceOf(Uint8Array);
    expect(midiBytes.length).toBeGreaterThan(50);

    // Header Chunk Check: "MThd" (0x4D, 0x54, 0x68, 0x64)
    expect(midiBytes[0]).toBe(0x4d); // 'M'
    expect(midiBytes[1]).toBe(0x54); // 'T'
    expect(midiBytes[2]).toBe(0x68); // 'h'
    expect(midiBytes[3]).toBe(0x64); // 'd'

    // Header size must be 6
    expect(midiBytes[4]).toBe(0);
    expect(midiBytes[5]).toBe(0);
    expect(midiBytes[6]).toBe(0);
    expect(midiBytes[7]).toBe(6);

    // Track Chunk Check: "MTrk" (0x4D, 0x54, 0x72, 0x6B)
    const mtrkIndex = 14;
    expect(midiBytes[mtrkIndex]).toBe(0x4d); // 'M'
    expect(midiBytes[mtrkIndex + 1]).toBe(0x54); // 'T'
    expect(midiBytes[mtrkIndex + 2]).toBe(0x72); // 'r'
    expect(midiBytes[mtrkIndex + 3]).toBe(0x6b); // 'k'

    // File ends with End-of-Track meta event 0xFF 0x2F 0x00
    const len = midiBytes.length;
    expect(midiBytes[len - 3]).toBe(0xff);
    expect(midiBytes[len - 2]).toBe(0x2f);
    expect(midiBytes[len - 1]).toBe(0x00);
  });
});
