import { Chord, Note } from '@tonaljs/tonal';

export interface DetectedChordResult {
  chordSymbol: string;
  root: string;
  quality: string;
  bass?: string;
  notes: string[];
  confidence: number;
}

export function detectChordFromMidis(
  midis: number[] | Set<number>
): DetectedChordResult | null {
  const midiArr = Array.from(midis).filter((m) => typeof m === 'number' && !isNaN(m));
  if (midiArr.length < 2) return null;

  // Sort ascending by pitch
  midiArr.sort((a, b) => a - b);
  const lowestMidi = midiArr[0];
  const lowestNote = Note.pitchClass(Note.fromMidi(lowestMidi));

  // Extract unique pitch classes in order
  const pitchClasses: string[] = [];
  const seenPcs = new Set<string>();

  for (const m of midiArr) {
    const pc = Note.pitchClass(Note.fromMidi(m));
    if (!seenPcs.has(pc)) {
      seenPcs.add(pc);
      pitchClasses.push(pc);
    }
  }

  if (pitchClasses.length < 2) return null;

  // Detect chord names via Tonal
  const detected = Chord.detect(pitchClasses);
  if (!detected || detected.length === 0) {
    // Fallback: If 2 notes, name interval or dyad
    if (pitchClasses.length === 2) {
      const interval = Math.abs(midiArr[1] - midiArr[0]) % 12;
      if (interval === 7) {
        return {
          chordSymbol: `${pitchClasses[0]}5`,
          root: pitchClasses[0],
          quality: 'Power Chord',
          notes: pitchClasses,
          confidence: 0.85,
        };
      }
    }
    return null;
  }

  // Pick the best match (favor simplest, or match where tonic === lowestNote)
  let bestSymbol = detected[0];
  for (const sym of detected) {
    const info = Chord.get(sym);
    if (info.tonic === lowestNote) {
      bestSymbol = sym;
      break;
    }
  }

  const chordInfo = Chord.get(bestSymbol);
  const root = chordInfo.tonic || bestSymbol.replace(/[^A-G#b]/g, '');

  // Normalize Tonal's "M" (major triad) to standard notation (e.g. "CM" -> "C", "DM/G" -> "D/G")
  let displaySymbol = bestSymbol.replace(/^([A-G][#b]?)M$/, '$1');
  displaySymbol = displaySymbol.replace(/^([A-G][#b]?)M\//, '$1/');

  let bass: string | undefined = undefined;

  // If lowest note is distinct from chord tonic, format as slash chord
  if (lowestNote && lowestNote !== root && !displaySymbol.includes('/')) {
    displaySymbol = `${displaySymbol}/${lowestNote}`;
    bass = lowestNote;
  }

  return {
    chordSymbol: displaySymbol,
    root,
    quality: chordInfo.quality || 'Major',
    bass,
    notes: pitchClasses,
    confidence: 0.95,
  };
}
