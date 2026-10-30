import { Chord, Note } from '@tonaljs/tonal';
import { NoteInfo, VoiceLeadingDiff, VoicedChord } from '../types/harmony';
import { spellNoteInKey } from './progressionParser';
import { getRuleById } from '../data/curriculum';

export function getRightHandPitchClasses(symbol: string): string[] {
  const parts = symbol.split('/');
  const main = parts[0];
  const c = Chord.get(main);
  const root = c.tonic || main.replace(/[^A-G#b]/g, '');
  if (!root) return ['C', 'E', 'G'];

  // Special Bill Evans / Berklee rootless / color voicings
  if (symbol.includes('13')) {
    // b7, 9, 3, 13
    const b7 = Note.transpose(root, '7m');
    const m9 = Note.transpose(root, '9M');
    const m3 = Note.transpose(root, '3M');
    const m13 = Note.transpose(root, '13M');
    return [b7, m9, m3, m13].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('m9') || symbol.includes('min9')) {
    // b3, 5, b7, 9
    const b3 = Note.transpose(root, '3m');
    const p5 = Note.transpose(root, '5P');
    const b7 = Note.transpose(root, '7m');
    const m9 = Note.transpose(root, '9M');
    return [b3, p5, b7, m9].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('maj9')) {
    // 3, 5, 7, 9
    const m3 = Note.transpose(root, '3M');
    const p5 = Note.transpose(root, '5P');
    const m7 = Note.transpose(root, '7M');
    const m9 = Note.transpose(root, '9M');
    return [m3, p5, m7, m9].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('9sus4') || symbol.includes('sus4')) {
    // 4, 5, b7, 9
    const p4 = Note.transpose(root, '4P');
    const p5 = Note.transpose(root, '5P');
    const b7 = Note.transpose(root, '7m');
    const m9 = Note.transpose(root, '9M');
    return [p4, p5, b7, m9].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('7b9')) {
    // 3, 5, b7, b9
    const m3 = Note.transpose(root, '3M');
    const p5 = Note.transpose(root, '5P');
    const b7 = Note.transpose(root, '7m');
    const b9 = Note.transpose(root, '9m');
    return [m3, p5, b7, b9].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('7#11')) {
    // 3, b7, 9, #11
    const m3 = Note.transpose(root, '3M');
    const b7 = Note.transpose(root, '7m');
    const m9 = Note.transpose(root, '9M');
    const a11 = Note.transpose(root, '11A');
    return [m3, b7, m9, a11].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('dim7')) {
    // 1, b3, b5, bb7
    const m3 = Note.transpose(root, '3m');
    const d5 = Note.transpose(root, '5d');
    const d7 = Note.transpose(root, '7d');
    return [root, m3, d5, d7].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('m6')) {
    // 1, b3, 5, 6
    const m3 = Note.transpose(root, '3m');
    const p5 = Note.transpose(root, '5P');
    const m6 = Note.transpose(root, '6M');
    return [root, m3, p5, m6].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('maj7')) {
    const m3 = Note.transpose(root, '3M');
    const p5 = Note.transpose(root, '5P');
    const m7 = Note.transpose(root, '7M');
    return [m3, p5, m7, root].map((n) => Note.pitchClass(n));
  }
  if (symbol.endsWith('7')) {
    const m3 = Note.transpose(root, '3M');
    const p5 = Note.transpose(root, '5P');
    const b7 = Note.transpose(root, '7m');
    return [b7, root, m3, p5].map((n) => Note.pitchClass(n));
  }
  if (symbol.includes('m7')) {
    const b3 = Note.transpose(root, '3m');
    const p5 = Note.transpose(root, '5P');
    const b7 = Note.transpose(root, '7m');
    return [b3, p5, b7, root].map((n) => Note.pitchClass(n));
  }

  // Fallback: take chord notes from Tonal
  const notes = c.notes.length > 0 ? c.notes : [main];
  return notes.map((n) => Note.pitchClass(n));
}

function generateCandidateVoicings(pcs: string[]): number[][] {
  const candidates: number[][] = [];
  const basePcs = pcs.map((p) => ((Note.midi(`${p}4`)! % 12) + 12) % 12);
  const n = basePcs.length;

  for (let rot = 0; rot < n; rot++) {
    const rotated: number[] = [];
    for (let i = 0; i < n; i++) {
      rotated.push(basePcs[(rot + i) % n]);
    }

    for (let baseOct = 3; baseOct <= 4; baseOct++) {
      const pitches: number[] = [];
      const first = rotated[0] + (baseOct + 1) * 12;
      pitches.push(first);
      let valid = true;

      for (let i = 1; i < n; i++) {
        let p = rotated[i] + (baseOct + 1) * 12;
        while (p <= pitches[pitches.length - 1]) {
          p += 12;
        }
        if (p - pitches[0] > 16) {
          valid = false;
          break;
        }
        pitches.push(p);
      }

      if (valid && pitches[0] >= 53 && pitches[pitches.length - 1] <= 81) {
        candidates.push(pitches);
      }
    }
  }

  if (candidates.length === 0) {
    // Fallback safe voicing in middle register
    const fallback = basePcs.map((pc, idx) => pc + 60 + idx);
    candidates.push(fallback);
  }

  return candidates;
}

function solveOptimalVoicing(
  candidates: number[][],
  prevRightHandMidi?: number[]
): number[] {
  if (!prevRightHandMidi || prevRightHandMidi.length === 0) {
    // Pick candidate closest to sweet spot center MIDI 64 (E4)
    const sorted = [...candidates].sort((a, b) => {
      const avgA = a.reduce((sum, n) => sum + n, 0) / a.length;
      const avgB = b.reduce((sum, n) => sum + n, 0) / b.length;
      return Math.abs(avgA - 64) - Math.abs(avgB - 64);
    });
    return sorted[0];
  }

  let best = candidates[0];
  let minCost = Infinity;

  for (const cand of candidates) {
    let cost = 0;
    let totalSemitones = 0;
    const len = Math.min(prevRightHandMidi.length, cand.length);

    for (let i = 0; i < len; i++) {
      const diff = Math.abs(cand[i] - prevRightHandMidi[i]);
      totalSemitones += diff;
      if (diff > 4) cost += 15;
    }

    // Cost function: minimal semitone distance + gentle center-of-gravity anchor around 64
    const avgMidi = cand.reduce((sum, n) => sum + n, 0) / cand.length;
    cost += totalSemitones + 0.35 * Math.abs(avgMidi - 64);

    if (cost < minCost) {
      minCost = cost;
      best = cand;
    }
  }

  return best;
}

function computeVoiceLeadingDiff(
  prevMidis: number[] | undefined,
  currMidis: number[],
  keyRoot: string
): VoiceLeadingDiff {
  if (!prevMidis || prevMidis.length === 0) {
    return {
      keptNotes: [],
      movedNotes: [],
      smoothnessScore: 100,
    };
  }

  const keptNotes: string[] = [];
  const movedNotes: Array<{ fromNote: string; toNote: string; semitones: number }> = [];

  const prevUsed = new Set<number>();
  const currUsed = new Set<number>();

  // 1. Identify common tones (kept notes)
  for (let cIdx = 0; cIdx < currMidis.length; cIdx++) {
    const cMidi = currMidis[cIdx];
    const pIdx = prevMidis.findIndex((pMidi, idx) => !prevUsed.has(idx) && pMidi === cMidi);
    if (pIdx !== -1) {
      keptNotes.push(spellNoteInKey(cMidi, keyRoot));
      prevUsed.add(pIdx);
      currUsed.add(cIdx);
    }
  }

  // 2. Pair remaining moving notes with minimal distance
  let totalShift = 0;
  for (let cIdx = 0; cIdx < currMidis.length; cIdx++) {
    if (currUsed.has(cIdx)) continue;
    const cMidi = currMidis[cIdx];

    let bestPIdx = -1;
    let bestDist = Infinity;
    for (let pIdx = 0; pIdx < prevMidis.length; pIdx++) {
      if (prevUsed.has(pIdx)) continue;
      const dist = Math.abs(cMidi - prevMidis[pIdx]);
      if (dist < bestDist) {
        bestDist = dist;
        bestPIdx = pIdx;
      }
    }

    if (bestPIdx !== -1) {
      const pMidi = prevMidis[bestPIdx];
      const semitones = cMidi - pMidi;
      totalShift += Math.abs(semitones);
      movedNotes.push({
        fromNote: spellNoteInKey(pMidi, keyRoot),
        toNote: spellNoteInKey(cMidi, keyRoot),
        semitones,
      });
      prevUsed.add(bestPIdx);
    }
  }

  // Calculate smoothness score (0 - 100)
  const smoothnessScore = Math.max(0, Math.min(100, 100 - totalShift * 5));

  return {
    keptNotes,
    movedNotes,
    smoothnessScore,
  };
}

export function voiceSingleChord(
  symbol: string,
  keyRoot: string,
  prevRightHandMidi?: number[]
): {
  leftHand: NoteInfo[];
  rightHand: NoteInfo[];
  voiceLeading: VoiceLeadingDiff;
} {
  const parts = symbol.split('/');
  const main = parts[0];
  const slashBass = parts[1] || undefined;
  const chordInfo = Chord.get(main);
  const rootName = chordInfo.tonic || main.replace(/[^A-G#b]/g, '');

  // 1. Left Hand Voicing
  const bassPitchClass = slashBass ? slashBass : rootName;
  const bassMidiRef = Note.midi(`${bassPitchClass}2`);
  const bassMidi = bassMidiRef !== null ? bassMidiRef : 36;

  const leftHand: NoteInfo[] = [];

  if (slashBass) {
    // Slash chord: clean single bass note or bass + octave to avoid muddy cluster
    leftHand.push({
      noteName: spellNoteInKey(bassMidi, keyRoot),
      pitchClass: bassPitchClass,
      midi: bassMidi,
      hand: 'left',
      role: 'root',
    });
  } else {
    // Normal chord: Root + 5th (safe against Low Interval Limit)
    leftHand.push({
      noteName: spellNoteInKey(bassMidi, keyRoot),
      pitchClass: bassPitchClass,
      midi: bassMidi,
      hand: 'left',
      role: 'root',
    });

    const fifthPitchClass = Note.transpose(bassPitchClass, '5P');
    const fifthMidi = bassMidi + 7;
    leftHand.push({
      noteName: spellNoteInKey(fifthMidi, keyRoot),
      pitchClass: Note.pitchClass(fifthPitchClass),
      midi: fifthMidi,
      hand: 'left',
      role: 'fifth',
    });
  }

  // 2. Right Hand Voicing
  const rightPcs = getRightHandPitchClasses(symbol);
  const candidates = generateCandidateVoicings(rightPcs);
  const bestRightMidis = solveOptimalVoicing(candidates, prevRightHandMidi);

  const rightHand: NoteInfo[] = bestRightMidis.map((midi) => {
    const pc = Note.pitchClass(Note.fromMidi(midi));
    let role: NoteInfo['role'] = 'extension';
    if (pc === rootName) role = 'root';
    else if (pc === Note.pitchClass(Note.transpose(rootName, '3M')) || pc === Note.pitchClass(Note.transpose(rootName, '3m'))) role = 'third';
    else if (pc === Note.pitchClass(Note.transpose(rootName, '5P'))) role = 'fifth';
    else if (pc === Note.pitchClass(Note.transpose(rootName, '7M')) || pc === Note.pitchClass(Note.transpose(rootName, '7m'))) role = 'seventh';

    return {
      noteName: spellNoteInKey(midi, keyRoot),
      pitchClass: pc,
      midi,
      hand: 'right',
      role,
    };
  });

  // 3. Voice Leading Diff
  const voiceLeading = computeVoiceLeadingDiff(prevRightHandMidi, bestRightMidis, keyRoot);

  return {
    leftHand,
    rightHand,
    voiceLeading,
  };
}

export function voiceChordSequence(
  chords: Array<{
    symbol: string;
    originalSymbol?: string;
    romanDegree: string;
    functionRole: 'primary' | 'passing-bridge' | 'modal-borrow';
    ruleId: string;
    beats?: number;
  }>,
  keyRoot: string
): VoicedChord[] {
  const result: VoicedChord[] = [];
  let prevRightMidi: number[] | undefined = undefined;

  chords.forEach((ch, idx) => {
    const voiced = voiceSingleChord(ch.symbol, keyRoot, prevRightMidi);
    prevRightMidi = voiced.rightHand.map((n) => n.midi);

    const rule = getRuleById(ch.ruleId);

    result.push({
      id: `chord-${idx}-${ch.symbol}`,
      symbol: ch.symbol,
      originalSymbol: ch.originalSymbol,
      romanDegree: ch.romanDegree,
      functionRole: ch.functionRole,
      leftHand: voiced.leftHand,
      rightHand: voiced.rightHand,
      voiceLeading: voiced.voiceLeading,
      explanation: {
        ruleId: rule.id,
        title: rule.titleVi,
        whySmooth: rule.whySmoothVi,
        fingerTip: rule.fingerTipVi,
        emotionTag: rule.emotionTagVi,
      },
      beats: ch.beats ?? 4,
    });
  });

  return result;
}
