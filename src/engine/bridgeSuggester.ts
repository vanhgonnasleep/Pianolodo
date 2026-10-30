import { Note } from '@tonaljs/tonal';
import { BridgeCandidate, ProgressionState, VibeId, VoicedChord } from '../types/harmony';
import { voiceChordSequence, voiceSingleChord } from './voiceLeadingSolver';
import { getRuleById } from '../data/curriculum';

export function getBridgeCandidates(
  fromChord: VoicedChord,
  toChord: VoicedChord,
  keyRoot: string,
  _vibe: VibeId
): BridgeCandidate[] {
  const candidates: BridgeCandidate[] = [];

  const fromMain = fromChord.symbol.split('/')[0];
  const toMain = toChord.symbol.split('/')[0];
  const toRoot = toMain.replace(/[^A-G#b]/g, '');

  const fromRightMidis = fromChord.rightHand.map((n) => n.midi);

  // 1. Slash Bass Walkdown Candidate
  if (fromChord.romanDegree.includes('I') && toChord.romanDegree.includes('vi')) {
    const domRoot = Note.transpose(keyRoot, '5P');
    const bassNote = Note.transpose(keyRoot, '7M');
    const symbol = `${domRoot}/${bassNote}`;
    const rule = getRuleById('slash-walkdown-i-vi');
    const voiced = voiceSingleChord(symbol, keyRoot, fromRightMidis);

    candidates.push({
      id: `bridge-slash-${symbol}`,
      symbol,
      romanDegree: 'V/7',
      techniqueName: 'Đi Bass liền bậc (Slash Bass Walkdown)',
      whySmooth: rule.whySmoothVi,
      ruleId: 'slash-walkdown-i-vi',
      previewChord: {
        id: `preview-${symbol}`,
        symbol,
        romanDegree: 'V/7',
        functionRole: 'passing-bridge',
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
        beats: 2,
      },
    });
  } else if (fromChord.romanDegree.includes('vi') && toChord.romanDegree.includes('IV')) {
    const medRoot = Note.transpose(keyRoot, '3M');
    const bassNote = Note.transpose(keyRoot, '5P');
    const symbol = `${medRoot}m/${bassNote}`;
    const rule = getRuleById('slash-walkdown-vi-iv');
    const voiced = voiceSingleChord(symbol, keyRoot, fromRightMidis);

    candidates.push({
      id: `bridge-slash-${symbol}`,
      symbol,
      romanDegree: 'iii/5',
      techniqueName: 'Đi Bass liền bậc (Slash Bass Walkdown)',
      whySmooth: rule.whySmoothVi,
      ruleId: 'slash-walkdown-vi-iv',
      previewChord: {
        id: `preview-${symbol}`,
        symbol,
        romanDegree: 'iii/5',
        functionRole: 'passing-bridge',
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
        beats: 2,
      },
    });
  } else {
    // General slash walkdown
    const domRoot = Note.transpose(keyRoot, '5P');
    const symbol = `${domRoot}/B`;
    const rule = getRuleById('slash-walkdown-i-vi');
    const voiced = voiceSingleChord(symbol, keyRoot, fromRightMidis);
    candidates.push({
      id: `bridge-slash-${symbol}`,
      symbol,
      romanDegree: 'V/7',
      techniqueName: 'Đi Bass liền bậc (Slash Bass Walkdown)',
      whySmooth: 'Tạo bước trượt Bass liền bậc êm dịu dẫn lối sang hợp âm tiếp theo.',
      ruleId: 'slash-walkdown-i-vi',
      previewChord: {
        id: `preview-${symbol}`,
        symbol,
        romanDegree: 'V/7',
        functionRole: 'passing-bridge',
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
        beats: 2,
      },
    });
  }

  // 2. Secondary Dominant (V7 of target chord)
  const secDomRoot = Note.transpose(toRoot, '5P');
  const secDomSymbol = `${secDomRoot}7b9`;
  const secDomRule =
    toChord.romanDegree.includes('vi')
      ? getRuleById('sec-dom-v-of-vi')
      : toChord.romanDegree.includes('ii')
      ? getRuleById('sec-dom-v-of-ii')
      : getRuleById('sec-dom-ii-v-of-iv');
  const secDomVoiced = voiceSingleChord(secDomSymbol, keyRoot, fromRightMidis);

  candidates.push({
    id: `bridge-secdom-${secDomSymbol}`,
    symbol: secDomSymbol,
    romanDegree: `V7/${toChord.romanDegree.replace(/[^IivV]/g, '') || 'x'}`,
    techniqueName: 'Bậc V phụ hút mạnh (Secondary Dominant)',
    whySmooth: secDomRule.whySmoothVi,
    ruleId: secDomRule.id,
    previewChord: {
      id: `preview-${secDomSymbol}`,
      symbol: secDomSymbol,
      romanDegree: `V7/${toChord.romanDegree.replace(/[^IivV]/g, '') || 'x'}`,
      functionRole: 'passing-bridge',
      leftHand: secDomVoiced.leftHand,
      rightHand: secDomVoiced.rightHand,
      voiceLeading: secDomVoiced.voiceLeading,
      explanation: {
        ruleId: secDomRule.id,
        title: secDomRule.titleVi,
        whySmooth: secDomRule.whySmoothVi,
        fingerTip: secDomRule.fingerTipVi,
        emotionTag: secDomRule.emotionTagVi,
      },
      beats: 2,
    },
  });

  // 3. Chromatic Diminished Passing (half-step below target root)
  const halfStepBelow = Note.transpose(toRoot, '-2m');
  const dimSymbol = `${halfStepBelow}dim7`;
  const dimRule = getRuleById('dim-passing-sharp-i');
  const dimVoiced = voiceSingleChord(dimSymbol, keyRoot, fromRightMidis);

  candidates.push({
    id: `bridge-dim-${dimSymbol}`,
    symbol: dimSymbol,
    romanDegree: '#Idim7',
    techniqueName: 'Diminished bắc cầu nửa cung (Passing Diminished)',
    whySmooth: dimRule.whySmoothVi,
    ruleId: 'dim-passing-sharp-i',
    previewChord: {
      id: `preview-${dimSymbol}`,
      symbol: dimSymbol,
      romanDegree: '#Idim7',
      functionRole: 'passing-bridge',
      leftHand: dimVoiced.leftHand,
      rightHand: dimVoiced.rightHand,
      voiceLeading: dimVoiced.voiceLeading,
      explanation: {
        ruleId: dimRule.id,
        title: dimRule.titleVi,
        whySmooth: dimRule.whySmoothVi,
        fingerTip: dimRule.fingerTipVi,
        emotionTag: dimRule.emotionTagVi,
      },
      beats: 2,
    },
  });

  // 4. Tritone Substitution (half-step above target root)
  const tritoneRoot = Note.transpose(toRoot, '2m');
  const tritoneSymbol = `${tritoneRoot}7#11`;
  const tritoneRule = getRuleById('tritone-sub-bii7');
  const tritoneVoiced = voiceSingleChord(tritoneSymbol, keyRoot, fromRightMidis);

  candidates.push({
    id: `bridge-tritone-${tritoneSymbol}`,
    symbol: tritoneSymbol,
    romanDegree: 'bII7#11',
    techniqueName: 'Thế âm ba cung (Tritone Sub)',
    whySmooth: tritoneRule.whySmoothVi,
    ruleId: 'tritone-sub-bii7',
    previewChord: {
      id: `preview-${tritoneSymbol}`,
      symbol: tritoneSymbol,
      romanDegree: 'bII7#11',
      functionRole: 'passing-bridge',
      leftHand: tritoneVoiced.leftHand,
      rightHand: tritoneVoiced.rightHand,
      voiceLeading: tritoneVoiced.voiceLeading,
      explanation: {
        ruleId: tritoneRule.id,
        title: tritoneRule.titleVi,
        whySmooth: tritoneRule.whySmoothVi,
        fingerTip: tritoneRule.fingerTipVi,
        emotionTag: tritoneRule.emotionTagVi,
      },
      beats: 2,
    },
  });

  return candidates;
}

export function insertBridgeChordAt(
  state: ProgressionState,
  indexAfter: number,
  candidate: BridgeCandidate
): ProgressionState {
  const currentChords = [...state.reharmonizedChords];
  if (indexAfter < 0 || indexAfter >= currentChords.length) {
    return state;
  }

  // Adjust beats of chord before bridge to 2
  currentChords[indexAfter] = {
    ...currentChords[indexAfter],
    beats: 2,
  };

  const newBridgeVoiced: VoicedChord = {
    ...candidate.previewChord,
    id: `chord-${indexAfter + 1}-${candidate.symbol}`,
    beats: 2,
  };

  currentChords.splice(indexAfter + 1, 0, newBridgeVoiced);

  // Re-voice the entire sequence to guarantee seamless voice-leading
  const revoicedInput = currentChords.map((ch) => ({
    symbol: ch.symbol,
    originalSymbol: ch.originalSymbol,
    romanDegree: ch.romanDegree,
    functionRole: ch.functionRole,
    ruleId: ch.explanation.ruleId || 'ext-maj9',
    beats: ch.beats,
  }));

  const reharmonizedChords = voiceChordSequence(revoicedInput, state.keyRoot);

  return {
    ...state,
    reharmonizedChords,
  };
}
