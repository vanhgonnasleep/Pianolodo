import { Key, Note } from '@tonaljs/tonal';
import { CadenceOption, VoicedChord } from '../types/harmony';
import { parseProgressionInput } from './progressionParser';
import { buildProgressionState } from './reharmonizer';

/**
 * Tokenize raw progression input into clean chord/degree strings.
 */
export function splitInputTokens(rawInput: string): string[] {
  const cleaned = rawInput.trim();
  if (!cleaned) return [];
  const rawTokens = cleaned
    .split(/[-–—,|→>]|\s{2,}/)
    .map((t) => t.trim())
    .filter(Boolean);
  return rawTokens.length > 0 ? rawTokens : cleaned.split(/\s+/).filter(Boolean);
}

/**
 * Join chord/degree tokens back into standardized " - " format.
 */
export function joinInputTokens(tokens: string[]): string {
  return tokens.filter(Boolean).join(' - ');
}

/**
 * Apply cadence insertion/replacement action to token list.
 */
export function applyCadenceAction(
  tokens: string[],
  targetIndex: number,
  insertedFormula: string,
  actionType: 'insert-before' | 'replace-target' | 'append' | 'replace-all'
): string {
  const insertedTokens = splitInputTokens(insertedFormula);
  if (insertedTokens.length === 0) return joinInputTokens(tokens);

  if (actionType === 'replace-all' || tokens.length === 0) {
    return joinInputTokens(insertedTokens);
  }

  const validIndex = Math.max(0, Math.min(targetIndex, tokens.length - 1));
  const newTokens = [...tokens];

  switch (actionType) {
    case 'insert-before':
      newTokens.splice(validIndex, 0, ...insertedTokens);
      break;
    case 'replace-target':
      newTokens.splice(validIndex, 1, ...insertedTokens);
      break;
    case 'append':
      newTokens.push(...insertedTokens);
      break;
  }

  return joinInputTokens(newTokens);
}

/**
 * Generate rich, context-aware 2-5-1 and cadence options for the user's progression.
 */
export function generateCadenceOptions(
  rawInput: string,
  targetIndex: number = 0,
  preferredKeyRoot: string = 'C'
): CadenceOption[] {
  const tokens = splitInputTokens(rawInput);
  const parsed = parseProgressionInput(rawInput, preferredKeyRoot);
  const keyRoot = parsed.keyRoot;
  const keyInfo = Key.majorKey(keyRoot);
  const scale = keyInfo.scale; // [C, D, E, F, G, A, B]

  // Detect if tokens are in Degree mode (e.g. 1, 2, 5, vi, IV)
  const degreeRegex = /^([b#]?)([1-7]|i{1,3}|iv|v|vi{1,2}|vii)([a-zA-Z0-9#b\/]*)$/i;
  const isDegreeMode = tokens.length > 0 && tokens.every((t) => degreeRegex.test(t));

  const safeIndex = tokens.length > 0 ? Math.max(0, Math.min(targetIndex, tokens.length - 1)) : 0;
  const targetToken = tokens[safeIndex] || (isDegreeMode ? '1' : keyRoot);
  const targetItem = parsed.items[safeIndex] || {
    symbol: targetToken,
    root: keyRoot,
    quality: 'Major',
    degreeNumber: 1,
    romanDegree: 'I',
  };

  const targetRoot = targetItem.root || keyRoot;
  const targetSymbol = targetItem.symbol || targetToken;
  const isMinorTarget =
    targetItem.quality === 'Minor' ||
    targetSymbol.toLowerCase().includes('m') && !targetSymbol.toLowerCase().includes('maj');

  const options: CadenceOption[] = [];

  // Helper to create preview voiced chords
  const createPreview = (formula: string): VoicedChord[] => {
    return buildProgressionState(formula, 'pop-ballad', 2, keyRoot).reharmonizedChords;
  };

  if (isDegreeMode) {
    // -------------------------------------------------------------
    // DEGREE MODE (e.g. "1 - 6 - 4 - 5", "2 - 5 - 1", "1 - 6")
    // -------------------------------------------------------------

    // 1. Standard 2 - 5 Approach
    const f1 = '2 - 5';
    options.push({
      id: 'deg-25-approach',
      titleVi: `Chèn 2 - 5 dẫn lối trước [${targetToken}]`,
      titleEn: `Insert 2 - 5 approach before [${targetToken}]`,
      badgeVi: 'Chuẩn 2 - 5',
      badgeEn: 'Standard 2 - 5',
      category: 'target-251',
      insertedFormula: f1,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f1, 'insert-before'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Chèn bước chuyển ii - V (2 - 5) kinh điển tạo lực hút hòa thanh tự nhiên về phía trước.',
      rationaleEn: 'Inserts hallmark ii - V step creating forward harmonic momentum.',
      actionType: 'insert-before',
      previewChords: createPreview(`2 - 5 - ${targetToken}`),
    });

    // 2. Full 2 - 5 - 1 Cadence
    const f2 = '2 - 5 - 1';
    options.push({
      id: 'deg-251-full',
      titleVi: 'Thay thế bằng vòng 2 - 5 - 1 (Major)',
      titleEn: 'Apply full 2 - 5 - 1 Progression',
      badgeVi: 'Vòng 2 - 5 - 1',
      badgeEn: '2 - 5 - 1 Loop',
      category: 'target-251',
      insertedFormula: f2,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f2, 'replace-target'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Vòng hòa thanh số 1 của Jazz và Pop: Tiền át (2) ➔ Át (5) ➔ Chủ (1).',
      rationaleEn: 'Cornerstone progression of Western music: Subdominant ➔ Dominant ➔ Tonic.',
      actionType: 'replace-target',
      previewChords: createPreview('2 - 5 - 1'),
    });

    // 3. Tritone Substitution (2 - bII7 - 1)
    const f3 = '2 - bII7 - 1';
    options.push({
      id: 'deg-tritone-sub',
      titleVi: 'Thế ba cung Tritone Sub (2 - bII7 - 1)',
      titleEn: 'Tritone Substitution (2 - bII7 - 1)',
      badgeVi: 'Tritone Sub',
      badgeEn: 'Tritone Sub',
      category: 'tritone-sub',
      insertedFormula: f3,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f3, 'replace-target'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Thay thế V7 bằng bII7, vuốt bass nửa cung chromatic sang trọng kiểu New York Jazz.',
      rationaleEn: 'Substitutes dominant with bII7 for half-step chromatic bass descent.',
      actionType: 'replace-target',
      previewChords: createPreview('2 - bII7 - 1'),
    });

    // 4. Turnaround 1 - 6 - 2 - 5
    const f4 = '1 - 6 - 2 - 5';
    options.push({
      id: 'deg-turnaround-1625',
      titleVi: 'Turnaround Kinh Điển (1 - 6 - 2 - 5 Vòng Xoay Bất Tận)',
      titleEn: 'Classic Turnaround (1 - 6 - 2 - 5 Circular Loop)',
      badgeVi: 'Turnaround',
      badgeEn: 'Turnaround',
      category: 'turnaround',
      insertedFormula: f4,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f4, 'append'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Nối vòng 1-6-2-5 vào cuối để bài hát có thể lặp vô tận dập dìu không dứt.',
      rationaleEn: 'Appends 1-6-2-5 turnaround for an endless smooth circular loop.',
      actionType: 'append',
      previewChords: createPreview('1 - 6 - 2 - 5'),
    });

    // 5. Asian Ballad Climax 2 - 6 - 5 - 1
    const f5 = '2 - 6 - 5 - 1';
    options.push({
      id: 'deg-asian-ballad-2651',
      titleVi: 'V-Pop / Asian Ballad (2 - 6 - 5 - 1 Cao Trào)',
      titleEn: 'Asian Pop Ballad (2 - 6 - 5 - 1 Climax)',
      badgeVi: 'Asian Ballad',
      badgeEn: 'Asian Ballad',
      category: 'ballad',
      insertedFormula: f5,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f5, 'replace-all'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Vòng hòa thanh thống trị hàng loạt bản hit ballad sâu lắng châu Á.',
      rationaleEn: 'Dominates heartfelt Asian pop ballads with soaring emotional power.',
      actionType: 'replace-all',
      previewChords: createPreview('2 - 6 - 5 - 1'),
    });

    // 6. Canon Pop Ballad 4 - 5 - 3 - 6
    const f6 = '4 - 5 - 3 - 6';
    options.push({
      id: 'deg-canon-4536',
      titleVi: 'Pop Ballad Hoàng Kim (4 - 5 - 3 - 6 Vương Giả)',
      titleEn: 'Golden Pop Ballad (4 - 5 - 3 - 6)',
      badgeVi: 'Ballad 4536',
      badgeEn: 'Ballad 4536',
      category: 'ballad',
      insertedFormula: f6,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f6, 'replace-all'),
      targetChordSymbol: targetToken,
      rationaleVi: 'Chuỗi hòa thanh kinh điển bắt đầu từ bậc IV bay bổng, dẫn về vi êm ái.',
      rationaleEn: 'Starts on evocative subdominant IV, resolving seamlessly to minor vi.',
      actionType: 'replace-all',
      previewChords: createPreview('4 - 5 - 3 - 6'),
    });
  } else {
    // -------------------------------------------------------------
    // CHORD SYMBOL MODE (e.g. "C - Am - F - G", "Dm7 - G7 - Cmaj7")
    // -------------------------------------------------------------

    // Transpose intervals relative to target root with proper harmonic pitch classes
    const getPitchClass = (interval: string): string => {
      const transposed = Note.transpose(`${targetRoot}4`, interval);
      return Note.pitchClass(transposed) || transposed;
    };

    const iiRoot = getPitchClass('2M');
    const vRoot = getPitchClass('5P');
    const tritoneRoot = getPitchClass('2m');
    const backdoorIv = getPitchClass('4P');
    const backdoorVii = getPitchClass('7m');
    const dimRoot = getPitchClass('7M');

    // 1. Target Cadence 2 - 5 to Target Chord
    const iiChord = isMinorTarget ? `${iiRoot}m7b5` : `${iiRoot}m7`;
    const vChord = `${vRoot}7`;
    const f1 = `${iiChord} - ${vChord}`;
    options.push({
      id: 'ch-target-25',
      titleVi: `Chèn 2 - 5 dẫn lối về [${targetSymbol}] (${iiChord} ➔ ${vChord})`,
      titleEn: `Insert 2 - 5 approach to [${targetSymbol}] (${iiChord} ➔ ${vChord})`,
      badgeVi: isMinorTarget ? 'Minor 2 - 5' : 'Major 2 - 5',
      badgeEn: isMinorTarget ? 'Minor 2 - 5' : 'Major 2 - 5',
      category: 'target-251',
      insertedFormula: f1,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f1, 'insert-before'),
      targetChordSymbol: targetSymbol,
      rationaleVi: isMinorTarget
        ? `Sử dụng hợp âm bán giảm iiø (${iiChord}) và át phụ V7 (${vChord}) hút dứt khoát về ${targetSymbol}.`
        : `Sử dụng chuỗi ii-V (${iiChord} ➔ ${vChord}) mở đường dẫn mượt mà vào ${targetSymbol}.`,
      rationaleEn: isMinorTarget
        ? `Employs half-diminished iiø (${iiChord}) and secondary dominant V7 (${vChord}) to resolve into ${targetSymbol}.`
        : `Uses standard ii-V (${iiChord} ➔ ${vChord}) to pave a smooth harmonic arrival into ${targetSymbol}.`,
      actionType: 'insert-before',
      previewChords: createPreview(`${f1} - ${targetSymbol}`),
    });

    // 2. Tritone Substitution 2 - 5 to Target Chord
    const tritoneChord = `${tritoneRoot}7`;
    const f2 = `${iiChord} - ${tritoneChord}`;
    options.push({
      id: 'ch-tritone-sub',
      titleVi: `Thế ba cung Tritone Sub (${iiChord} ➔ ${tritoneChord} ➔ ${targetSymbol})`,
      titleEn: `Tritone Sub Cadence (${iiChord} ➔ ${tritoneChord} ➔ ${targetSymbol})`,
      badgeVi: 'Tritone Sub',
      badgeEn: 'Tritone Sub',
      category: 'tritone-sub',
      insertedFormula: f2,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f2, 'insert-before'),
      targetChordSymbol: targetSymbol,
      rationaleVi: `Thay thế ${vChord} bằng ${tritoneChord}, lướt bass nửa cung chromatic sang trọng về ${targetSymbol}.`,
      rationaleEn: `Substitutes dominant ${vChord} with ${tritoneChord} for half-step chromatic bass descent into ${targetSymbol}.`,
      actionType: 'insert-before',
      previewChords: createPreview(`${f2} - ${targetSymbol}`),
    });

    // 3. Backdoor Cadence (Only for major targets or tonic)
    if (!isMinorTarget) {
      const backdoorChord1 = `${backdoorIv}m7`;
      const backdoorChord2 = `${backdoorVii}7`;
      const f3 = `${backdoorChord1} - ${backdoorChord2}`;
      options.push({
        id: 'ch-backdoor',
        titleVi: `Backdoor Cadence (${backdoorChord1} ➔ ${backdoorChord2} ➔ ${targetSymbol})`,
        titleEn: `Backdoor Cadence (${backdoorChord1} ➔ ${backdoorChord2} ➔ ${targetSymbol})`,
        badgeVi: 'Backdoor 2 - 5',
        badgeEn: 'Backdoor 2 - 5',
        category: 'backdoor',
        insertedFormula: f3,
        resultingFormula: applyCadenceAction(tokens, safeIndex, f3, 'insert-before'),
        targetChordSymbol: targetSymbol,
        rationaleVi: `Mượn hợp âm bậc iv thứ (${backdoorChord1}) và bVII7 (${backdoorChord2}) đáp nhẹ về ${targetSymbol} đầy bất ngờ.`,
        rationaleEn: `Borrows iv minor (${backdoorChord1}) and bVII7 (${backdoorChord2}) for a soulful backdoor landing on ${targetSymbol}.`,
        actionType: 'insert-before',
        previewChords: createPreview(`${f3} - ${targetSymbol}`),
      });
    }

    // 4. Passing Diminished 7th Approach
    const dimChord = `${dimRoot}dim7`;
    const f4 = dimChord;
    options.push({
      id: 'ch-passing-dim',
      titleVi: `Hợp âm giảm dẫn lối (${dimChord} ➔ ${targetSymbol})`,
      titleEn: `Passing Diminished Approach (${dimChord} ➔ ${targetSymbol})`,
      badgeVi: 'Diminished',
      badgeEn: 'Diminished',
      category: 'diminished',
      insertedFormula: f4,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f4, 'insert-before'),
      targetChordSymbol: targetSymbol,
      rationaleVi: `Hợp âm ${dimChord} nằm thấp hơn nửa cung, tạo lực hút dẫn nốt bậc thang trực diện vào ${targetSymbol}.`,
      rationaleEn: `${dimChord} sits a half-step below, pulling strongly into ${targetSymbol} with classic tension.`,
      actionType: 'insert-before',
      previewChords: createPreview(`${f4} - ${targetSymbol}`),
    });

    // 5. Classic Turnaround in Key (e.g. C - Am7 - Dm7 - G7)
    const tonicChord = `${keyRoot}maj7`;
    const viChord = `${scale[5]}m7`;
    const iiKeyChord = `${scale[1]}m7`;
    const vKeyChord = `${scale[4]}7`;
    const f5 = `${tonicChord} - ${viChord} - ${iiKeyChord} - ${vKeyChord}`;
    options.push({
      id: 'ch-turnaround-key',
      titleVi: `Nối Turnaround 1 - 6 - 2 - 5 vào cuối (${f5})`,
      titleEn: `Append 1 - 6 - 2 - 5 Turnaround (${f5})`,
      badgeVi: 'Turnaround',
      badgeEn: 'Turnaround',
      category: 'turnaround',
      insertedFormula: f5,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f5, 'append'),
      targetChordSymbol: targetSymbol,
      rationaleVi: 'Vòng hợp âm xoay tua tiêu chuẩn giúp người chơi lặp lại phần điệp khúc trơn tru.',
      rationaleEn: 'Standard cycling turnaround allowing seamless infinite repetition of verses or choruses.',
      actionType: 'append',
      previewChords: createPreview(f5),
    });

    // 6. Asian Ballad Climax (e.g. Dm7 - Am7 - G7 - Cmaj7)
    const f6 = `${scale[1]}m7 - ${scale[5]}m7 - ${scale[4]}7 - ${keyRoot}maj7`;
    options.push({
      id: 'ch-ballad-2651',
      titleVi: `V-Pop / Asian Ballad 2 - 6 - 5 - 1 (${f6})`,
      titleEn: `Asian Ballad 2 - 6 - 5 - 1 (${f6})`,
      badgeVi: 'Asian Ballad',
      badgeEn: 'Asian Ballad',
      category: 'ballad',
      insertedFormula: f6,
      resultingFormula: applyCadenceAction(tokens, safeIndex, f6, 'replace-all'),
      targetChordSymbol: targetSymbol,
      rationaleVi: 'Được mệnh danh là vòng hòa thanh quốc dân cho các bản hit ballad da diết.',
      rationaleEn: 'Celebrated as the quintessential chord progression for soaring Asian pop ballads.',
      actionType: 'replace-all',
      previewChords: createPreview(f6),
    });
  }

  return options;
}
