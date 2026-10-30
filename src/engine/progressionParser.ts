import { Chord, Key, Note } from '@tonaljs/tonal';
import { ParsedChordItem } from '../types/harmony';

const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

const PITCH_CLASS_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCH_CLASS_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const PREFERRED_MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function isFlatKey(keyRoot: string): boolean {
  return FLAT_KEYS.has(keyRoot) || keyRoot.includes('b');
}

export function transposeKeyRoot(keyRoot: string, semitones: number): string {
  const rootMidi = Note.midi(`${keyRoot}4`);
  if (rootMidi === null) return keyRoot;
  const targetMidi = ((rootMidi + semitones) % 12 + 12) % 12;
  
  if (semitones < 0 || isFlatKey(keyRoot)) {
    return PITCH_CLASS_NAMES_FLAT[targetMidi];
  }
  return PREFERRED_MAJOR_KEYS[targetMidi];
}

export function spellNoteInKey(midiOrNote: number | string, keyRoot: string): string {
  let midiVal: number;
  let octave: number;

  if (typeof midiOrNote === 'number') {
    midiVal = midiOrNote;
    octave = Math.floor(midiVal / 12) - 1;
  } else {
    const parsedMidi = Note.midi(midiOrNote);
    if (parsedMidi === null) {
      if (isFlatKey(keyRoot)) {
        return midiOrNote
          .replace('A#', 'Bb')
          .replace('D#', 'Eb')
          .replace('G#', 'Ab')
          .replace('C#', 'Db')
          .replace('F#', 'Gb');
      }
      return midiOrNote;
    }
    midiVal = parsedMidi;
    const noteProps = Note.get(midiOrNote);
    octave = noteProps.oct ?? (Math.floor(midiVal / 12) - 1);
  }

  const pc = ((midiVal % 12) + 12) % 12;
  const name = isFlatKey(keyRoot) ? PITCH_CLASS_NAMES_FLAT[pc] : PITCH_CLASS_NAMES_SHARP[pc];
  return `${name}${octave}`;
}

export function spellPitchClassInKey(pcName: string, keyRoot: string): string {
  const midiVal = Note.midi(`${pcName}4`);
  if (midiVal === null) return pcName;
  const pc = ((midiVal % 12) + 12) % 12;
  return isFlatKey(keyRoot) ? PITCH_CLASS_NAMES_FLAT[pc] : PITCH_CLASS_NAMES_SHARP[pc];
}

interface KeyScore {
  keyRoot: string;
  score: number;
}

const ROMAN_NUMERALS_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export function parseProgressionInput(
  rawInput: string,
  preferredKeyRoot = 'C'
): {
  keyRoot: string;
  keyMode: 'major' | 'minor';
  items: ParsedChordItem[];
  scaleNotes: string[];
} {
  const cleaned = rawInput.trim();
  if (!cleaned) {
    return {
      keyRoot: preferredKeyRoot,
      keyMode: 'major',
      items: [],
      scaleNotes: [...Key.majorKey(preferredKeyRoot).scale],
    };
  }

  // Tokenize by delimiter: " - ", "-", "–", ",", "|", "->", spaces
  const rawTokens = cleaned
    .split(/[-–—,|→>]|\s{2,}/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tokens = rawTokens.length > 0 ? rawTokens : cleaned.split(/\s+/).filter(Boolean);

  // Check if Degree Mode (e.g. "2", "5", "1", "2m", "V", "ii", "IV")
  const degreeRegex = /^([b#]?)([1-7]|i{1,3}|iv|v|vi{1,2}|vii)([a-zA-Z0-9#b\/]*)$/i;
  const isDegreeMode = tokens.every((t) => degreeRegex.test(t));

  if (isDegreeMode) {
    const keyRoot = preferredKeyRoot;
    const majorInfo = Key.majorKey(keyRoot);
    const scale = majorInfo.scale; // 7 diatonic notes
    const triads = majorInfo.triads; // 7 diatonic triads

    const romanMap: Record<number, string> = {
      1: 'I',
      2: 'ii',
      3: 'iii',
      4: 'IV',
      5: 'V',
      6: 'vi',
      7: 'vii°',
    };

    const items: ParsedChordItem[] = tokens.map((token) => {
      const match = token.match(degreeRegex);
      if (!match) {
        return {
          symbol: token,
          root: keyRoot,
          quality: 'Major',
          degreeNumber: 1,
          romanDegree: 'I',
        };
      }

      const numStr = match[2].toLowerCase();
      let degNum = 1;
      if (/^[1-7]$/.test(numStr)) {
        degNum = parseInt(numStr, 10);
      } else {
        const romanLookup: Record<string, number> = {
          i: 1,
          ii: 2,
          iii: 3,
          iv: 4,
          v: 5,
          vi: 6,
          vii: 7,
        };
        degNum = romanLookup[numStr] || 1;
      }

      const defaultTriad = triads[degNum - 1];
      const root = scale[degNum - 1];
      const roman = romanMap[degNum] || 'I';

      return {
        symbol: defaultTriad,
        root,
        quality: degNum === 1 || degNum === 4 || degNum === 5 ? 'Major' : 'Minor',
        degreeNumber: degNum,
        romanDegree: roman,
      };
    });

    return {
      keyRoot,
      keyMode: 'major',
      items,
      scaleNotes: [...scale],
    };
  }

  // Chord Symbol Mode (e.g. "C - Am - Dm - G" or "Fmaj7 - G7 - Em7 - Am7")
  const candidateKeys = PREFERRED_MAJOR_KEYS;
  const chordObjects = tokens.map((t) => {
    const parts = t.split('/');
    const mainSymbol = parts[0];
    const bass = parts[1] || undefined;
    const chordInfo = Chord.get(mainSymbol);
    return {
      symbol: t,
      mainSymbol,
      bass,
      root: chordInfo.tonic || mainSymbol.replace(/[^A-G#b]/g, ''),
      quality: chordInfo.quality || 'Major',
      notes: chordInfo.notes.length > 0 ? chordInfo.notes : [mainSymbol[0]],
    };
  });

  const scores: KeyScore[] = candidateKeys.map((key) => {
    const keyInfo = Key.majorKey(key);
    const scaleSet = new Set(keyInfo.scale);
    const diatonicChords = new Set([...keyInfo.triads, ...keyInfo.chords]);
    const secDomSet = new Set(keyInfo.secondaryDominants.filter(Boolean));

    let score = 0;
    let allDiatonic = true;

    chordObjects.forEach((ch, idx) => {
      const isDiatonic = diatonicChords.has(ch.mainSymbol);
      if (isDiatonic) {
        score += 5;
      } else {
        allDiatonic = false;
        if (secDomSet.has(ch.mainSymbol)) {
          score += 4;
        } else if (
          ch.mainSymbol === `${keyInfo.scale[3]}m` ||
          ch.mainSymbol === `${keyInfo.scale[3]}m6`
        ) {
          score += 4;
        }
      }

      if (idx === 0 && ch.root === key && ch.quality === 'Major') {
        score += 2;
      }

      ch.notes.forEach((n) => {
        const pc = Note.pitchClass(n);
        if (scaleSet.has(pc)) {
          score += 1;
        } else if (!secDomSet.has(ch.mainSymbol) && ch.mainSymbol !== `${keyInfo.scale[3]}m`) {
          score -= 3;
        }
      });
    });

    if (allDiatonic) {
      score += 10;
    }

    return { keyRoot: key, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const detectedKey = scores[0].keyRoot;
  const keyInfo = Key.majorKey(detectedKey);
  const scale = keyInfo.scale;

  const items: ParsedChordItem[] = chordObjects.map((ch) => {
    const rootIndex = scale.indexOf(ch.root);
    let degNum = 0;
    let roman = '';

    if (rootIndex !== -1) {
      degNum = rootIndex + 1;
      roman = ROMAN_NUMERALS_MAJOR[rootIndex];
    } else {
      const tonic = detectedKey;
      const secDomIdx = keyInfo.secondaryDominants.indexOf(ch.mainSymbol);
      if (secDomIdx !== -1) {
        degNum = 5;
        const targetDeg = ROMAN_NUMERALS_MAJOR[secDomIdx];
        roman = `V/${targetDeg}`;
      } else {
        const semi = (Note.midi(`${ch.root}4`)! - Note.midi(`${tonic}4`)! + 12) % 12;
        if (semi === 1) roman = 'bII';
        else if (semi === 3) roman = 'bIII';
        else if (semi === 6) roman = '#IV';
        else if (semi === 8) roman = 'bVI';
        else if (semi === 10) roman = 'bVII';
        else roman = ch.mainSymbol;
      }
    }

    return {
      symbol: ch.symbol,
      root: ch.root,
      quality: ch.quality,
      bass: ch.bass,
      degreeNumber: degNum,
      romanDegree: roman || 'I',
    };
  });

  return {
    keyRoot: detectedKey,
    keyMode: 'major',
    items,
    scaleNotes: [...scale],
  };
}
