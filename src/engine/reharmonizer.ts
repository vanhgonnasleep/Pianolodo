import { Note } from '@tonaljs/tonal';
import { ProgressionState, SpiceLevel, VibeId, VoicingTopology } from '../types/harmony';
import { VIBE_PROFILES } from '../data/curriculum';
import { parseProgressionInput } from './progressionParser';
import { voiceChordSequence } from './voiceLeadingSolver';

function getVibeExtensionForDegree(degree: number, vibe: VibeId): { extension: string; ruleId: string } {
  const profile = VIBE_PROFILES[vibe] || VIBE_PROFILES['pop-ballad'];

  switch (degree) {
    case 1:
      return { extension: profile.preferredMajorI, ruleId: 'ext-maj9' };
    case 2:
      return { extension: profile.preferredMinorII, ruleId: 'ext-min9' };
    case 3:
      return { extension: profile.preferredMinorIII, ruleId: 'ext-min9' };
    case 4:
      return { extension: profile.preferredMajorIV, ruleId: 'ext-maj9' };
    case 5:
      return { extension: profile.preferredDomV, ruleId: 'ext-dom13sus4' };
    case 6:
      return { extension: profile.preferredMinorVI, ruleId: 'ext-min9' };
    case 7:
      return { extension: 'm7b5', ruleId: 'ext-min9' };
    default:
      return { extension: '', ruleId: 'ext-maj9' };
  }
}

export function buildProgressionState(
  rawInput: string,
  vibe: VibeId,
  spiceLevel: SpiceLevel,
  preferredKeyRoot?: string,
  voicingTopology: VoicingTopology = 'ergonomic-split'
): ProgressionState {
  const parsed = parseProgressionInput(rawInput, preferredKeyRoot);
  const keyRoot = parsed.keyRoot;
  const keyMode = parsed.keyMode;
  const scaleNotes = parsed.scaleNotes;

  // 1. Original Basic Chords
  const originalSequence = parsed.items.map((item) => ({
    symbol: item.symbol,
    originalSymbol: item.symbol,
    romanDegree: item.romanDegree,
    functionRole: 'primary' as const,
    ruleId: 'ext-maj9',
    beats: 4,
  }));
  const originalChords = voiceChordSequence(originalSequence, keyRoot, voicingTopology);

  // 2. Build Reharmonized Sequence
  interface IntermediateChord {
    symbol: string;
    originalSymbol: string;
    romanDegree: string;
    degreeNumber: number;
    functionRole: 'primary' | 'passing-bridge' | 'modal-borrow';
    ruleId: string;
    beats: number;
  }

  const upgradedPrimaries: IntermediateChord[] = parsed.items.map((item) => {
    const { extension, ruleId } = getVibeExtensionForDegree(item.degreeNumber, vibe);
    let upgradedSymbol = item.symbol;

    if (item.degreeNumber > 0) {
      if (item.degreeNumber === 1 || item.degreeNumber === 4) {
        upgradedSymbol = `${item.root}${extension}`;
      } else if (item.degreeNumber === 2 || item.degreeNumber === 3 || item.degreeNumber === 6) {
        upgradedSymbol = `${item.root}${extension}`;
      } else if (item.degreeNumber === 5) {
        upgradedSymbol = `${item.root}${extension}`;
      } else if (item.degreeNumber === 7) {
        upgradedSymbol = `${item.root}${extension}`;
      }
    }

    return {
      symbol: upgradedSymbol,
      originalSymbol: item.symbol,
      romanDegree: item.romanDegree,
      degreeNumber: item.degreeNumber,
      functionRole: 'primary' as const,
      ruleId,
      beats: 4,
    };
  });

  // Handle Spice Level 3 dominant substitution in Jazz/R&B
  if (spiceLevel === 3 && (vibe === 'jazz-bossa' || vibe === 'rnb-neosoul')) {
    upgradedPrimaries.forEach((ch) => {
      if (ch.degreeNumber === 5) {
        // Option to add Tritone Sub Db7#11 or rich 13b9
        if (vibe === 'jazz-bossa') {
          const bII = Note.transpose(keyRoot, '2m');
          ch.symbol = `${bII}7#11`;
          ch.romanDegree = 'bII7#11';
          ch.ruleId = 'tritone-sub-bii7';
        }
      }
    });
  }

  // Automatic Passing Chord Injection for Spice Level 2 & 3
  const finalSequence: IntermediateChord[] = [];

  for (let i = 0; i < upgradedPrimaries.length; i++) {
    const curr = upgradedPrimaries[i];
    const next = upgradedPrimaries[i + 1];

    finalSequence.push(curr);

    if (spiceLevel >= 2 && next) {
      // Rule: I -> vi (e.g. C -> Am)
      if (curr.degreeNumber === 1 && next.degreeNumber === 6) {
        curr.beats = 2;
        if (vibe === 'pop-ballad') {
          // Slash Walkdown: V/7 (e.g. G/B)
          const domRoot = Note.transpose(keyRoot, '5P');
          const bassNote = Note.transpose(keyRoot, '7M');
          finalSequence.push({
            symbol: `${domRoot}/${bassNote}`,
            originalSymbol: `${domRoot}/${bassNote}`,
            romanDegree: 'V/7',
            degreeNumber: 0,
            functionRole: 'passing-bridge',
            ruleId: 'slash-walkdown-i-vi',
            beats: 2,
          });
        } else {
          // Secondary dominant V7/vi (e.g. E7b9)
          const targetRoot = next.symbol.replace(/[^A-G#b]/g, '');
          const secDomRoot = Note.transpose(targetRoot, '5P');
          finalSequence.push({
            symbol: `${secDomRoot}7b9`,
            originalSymbol: `${secDomRoot}7`,
            romanDegree: 'V7/vi',
            degreeNumber: 0,
            functionRole: 'passing-bridge',
            ruleId: 'sec-dom-v-of-vi',
            beats: 2,
          });
        }
      }
      // Rule: vi -> ii (e.g. Am -> Dm)
      else if (curr.degreeNumber === 6 && next.degreeNumber === 2) {
        curr.beats = 2;
        const targetRoot = next.symbol.replace(/[^A-G#b]/g, '');
        const secDomRoot = Note.transpose(targetRoot, '5P');
        finalSequence.push({
          symbol: `${secDomRoot}7b13`,
          originalSymbol: `${secDomRoot}7`,
          romanDegree: 'V7/ii',
          degreeNumber: 0,
          functionRole: 'passing-bridge',
          ruleId: 'sec-dom-v-of-ii',
          beats: 2,
        });
      }
      // Rule: IV -> V (e.g. F -> G)
      else if (curr.degreeNumber === 4 && next.degreeNumber === 5) {
        curr.beats = 2;
        const ivRoot = curr.symbol.replace(/[^A-G#b]/g, '');
        const sharpIvRoot = Note.transpose(ivRoot, '1A');
        finalSequence.push({
          symbol: `${sharpIvRoot}dim7`,
          originalSymbol: `${sharpIvRoot}dim7`,
          romanDegree: '#IVdim7',
          degreeNumber: 0,
          functionRole: 'passing-bridge',
          ruleId: 'dim-passing-sharp-iv',
          beats: 2,
        });
      }
      // Rule: Spice Level 3 Jazz Tritone sub before I
      else if (spiceLevel === 3 && next.degreeNumber === 1 && curr.degreeNumber === 5) {
        curr.beats = 2;
        const bII = Note.transpose(keyRoot, '2m');
        finalSequence.push({
          symbol: `${bII}7#11`,
          originalSymbol: `${bII}7`,
          romanDegree: 'bII7#11',
          degreeNumber: 0,
          functionRole: 'passing-bridge',
          ruleId: 'tritone-sub-bii7',
          beats: 2,
        });
      }
    }
  }

  const reharmonizedChords = voiceChordSequence(finalSequence, keyRoot, voicingTopology);

  return {
    keyRoot,
    keyMode,
    rawInput,
    vibe,
    spiceLevel,
    voicingTopology,
    originalChords,
    reharmonizedChords,
    scaleNotes,
  };
}
