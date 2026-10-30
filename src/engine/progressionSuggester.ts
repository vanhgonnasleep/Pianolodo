import { ProgressionOption, ProgressionState } from '../types/harmony';
import { buildProgressionState } from './reharmonizer';
import { parseProgressionInput } from './progressionParser';

function computeAvgSmoothness(state: ProgressionState): number {
  const chords = state.reharmonizedChords;
  if (chords.length <= 1) return 100;
  const scores = chords.slice(1).map((c) => c.voiceLeading?.smoothnessScore ?? 85);
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round(sum / scores.length);
}

export function generateProgressionOptions(
  rawInput: string,
  preferredKeyRoot?: string
): ProgressionOption[] {
  const parsed = parseProgressionInput(rawInput, preferredKeyRoot);
  const keyRoot = parsed.keyRoot;
  const items = parsed.items;
  const degreeNumbers = items.map((i) => i.degreeNumber);
  const degreesStr = degreeNumbers.join('-');

  const options: ProgressionOption[] = [];

  // Check if input is an incomplete snippet that can be intelligently completed
  const isIncomplete = items.length <= 2;

  if (isIncomplete) {
    if (degreesStr === '1-6') {
      // 1-6 completions
      // 1. Ballad: 1 - 5/7 - 6 - 4
      const p1 = buildProgressionState('1 - 6 - 4 - 5', 'pop-ballad', 2, keyRoot);
      options.push({
        id: 'opt-pop-1645',
        titleVi: 'Pop Ballad Lãng Mạn (1 - 6 - 4 - 5 Kéo Dài)',
        titleEn: 'Emotional Pop Ballad (1 - 6 - 4 - 5 Extension)',
        badgeVi: 'Pop Ballad',
        badgeEn: 'Pop Ballad',
        vibe: 'pop-ballad',
        spiceLevel: 2,
        formula: '1 - 6 - 4 - 5',
        chordsSummary: p1.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p1),
        rationaleVi: 'Phát triển từ 1-6 thành chuỗi Pop Ballad kinh điển, thêm nốt màu 9th bay bổng và bass lùi bậc dịu êm.',
        rationaleEn: 'Expands 1-6 into timeless ballad cadence with ethereal 9th extensions and smooth step-wise motion.',
        emotionTagVi: 'Trong trẻo, lãng mạn, nhẹ nhàng',
        emotionTagEn: 'Pure, nostalgic, luminous',
        progressionState: p1,
      });

      // 2. Neo-Soul Loop: 1 - 6 - 2 - 5
      const p2 = buildProgressionState('1 - 6 - 2 - 5', 'rnb-neosoul', 2, keyRoot);
      options.push({
        id: 'opt-neosoul-1625',
        titleVi: 'R&B / Neo-Soul Ấm Áp (1 - 6 - 2 - 5 Vòng Lặp Bất Hủ)',
        titleEn: 'Warm Neo-Soul Groove (1 - 6 - 2 - 5 Circular Loop)',
        badgeVi: 'Neo-Soul',
        badgeEn: 'Neo-Soul',
        vibe: 'rnb-neosoul',
        spiceLevel: 2,
        formula: '1 - 6 - 2 - 5',
        chordsSummary: p2.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p2),
        rationaleVi: 'Vòng xoay bất tận của Neo-Soul với hợp âm m9 dầy dặn và hợp âm át phụ dẫn lối ngọt ngào.',
        rationaleEn: 'Infinite velvet circular loop with stacked 9th extensions and secondary dominants.',
        emotionTagVi: 'Ấm áp, dầy dặn, nhung mịn',
        emotionTagEn: 'Velvety, warm, smooth groove',
        progressionState: p2,
      });

      // 3. Jazz Turnaround: 1 - 6 - 2 - bII7
      const p3 = buildProgressionState('1 - 6 - 2 - 5', 'jazz-bossa', 3, keyRoot);
      options.push({
        id: 'opt-jazz-1625',
        titleVi: 'Jazz & Bossa Nova (Thế Ba Cung Tritone Sub)',
        titleEn: 'Sophisticated Jazz (Tritone Sub Cadence)',
        badgeVi: 'Jazz / Bossa',
        badgeEn: 'Jazz / Bossa',
        vibe: 'jazz-bossa',
        spiceLevel: 3,
        formula: '1 - 6 - 2 - bII7',
        chordsSummary: p3.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p3),
        rationaleVi: 'Thay thế hợp âm V7 bằng hợp âm giáng 2 (Tritone Sub) vuốt bass nửa cung về nốt chủ sang trọng.',
        rationaleEn: 'Applies tritone substitution on the dominant chord for chromatic half-step bass resolution.',
        emotionTagVi: 'Sang trọng, quý phái, lả lơi',
        emotionTagEn: 'Sophisticated, elegant, witty',
        progressionState: p3,
      });

      // 4. Cinematic Borrow: 1 - 6 - 4m - 1
      const p4 = buildProgressionState('1 - 6 - 4 - 1', 'cinematic-sad', 2, keyRoot);
      options.push({
        id: 'opt-cinematic-1641',
        titleVi: 'Cinematic U Uất (Mượn Màu Giọng Thứ Modal Borrow)',
        titleEn: 'Cinematic Melancholy (Subdominant Minor Borrow)',
        badgeVi: 'Cinematic',
        badgeEn: 'Cinematic',
        vibe: 'cinematic-sad',
        spiceLevel: 2,
        formula: '1 - 6 - 4m - 1',
        chordsSummary: p4.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p4),
        rationaleVi: 'Mượn hợp âm bậc IV thứ tạo nốt rơi nghẹn ngào, chuẩn âm hưởng soundtrack điện ảnh cảm xúc.',
        rationaleEn: 'Subdominant minor borrowing creates a poignant, tear-jerking film score cadence.',
        emotionTagVi: 'U uất, nghẹn ngào, điện ảnh',
        emotionTagEn: 'Cinematic, dramatic, bittersweet',
        progressionState: p4,
      });

      return options;
    }

    if (degreesStr === '2-5') {
      // 2-5 completions
      const p1 = buildProgressionState('2 - 5 - 1', 'pop-ballad', 1, keyRoot);
      options.push({
        id: 'opt-pop-251',
        titleVi: 'Pop Ballad Dịu Dàng (2 - 5 - 1 Chuẩn Mực)',
        titleEn: 'Gentle Pop Ballad (2 - 5 - 1 Standard)',
        badgeVi: 'Pop Ballad',
        badgeEn: 'Pop Ballad',
        vibe: 'pop-ballad',
        spiceLevel: 1,
        formula: '2 - 5 - 1',
        chordsSummary: p1.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p1),
        rationaleVi: 'Giải quyết 2-5 về nốt chủ 1 nhẹ nhàng với hợp âm 7th và 9th mộc mạc, trong trẻo.',
        rationaleEn: 'Resolves 2-5 smoothly to tonic with natural 7th and 9th color chords.',
        emotionTagVi: 'Bình yên, nhẹ nhàng, giải tỏa',
        emotionTagEn: 'Serene, gentle, resolved',
        progressionState: p1,
      });

      const p2 = buildProgressionState('2 - 5 - 1 - 6', 'rnb-neosoul', 2, keyRoot);
      options.push({
        id: 'opt-neosoul-2516',
        titleVi: 'R&B / Neo-Soul Groove (2 - 5 - 1 - 6 Luân Chuyển)',
        titleEn: 'Warm Neo-Soul (2 - 5 - 1 - 6 Turnaround)',
        badgeVi: 'Neo-Soul',
        badgeEn: 'Neo-Soul',
        vibe: 'rnb-neosoul',
        spiceLevel: 2,
        formula: '2 - 5 - 1 - 6',
        chordsSummary: p2.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p2),
        rationaleVi: 'Nối tiếp từ 1 sang 6 qua hợp âm át phụ, biến 2-5 thành vòng lặp vô tận cuốn hút.',
        rationaleEn: 'Extends 2-5-1 to minor 6th with secondary dominant, creating an addictive groove.',
        emotionTagVi: 'Ấm áp, cuốn hút, dập dìu',
        emotionTagEn: 'Warm, magnetic, groovy',
        progressionState: p2,
      });

      const p3 = buildProgressionState('2 - 5 - 1', 'jazz-bossa', 3, keyRoot);
      options.push({
        id: 'opt-jazz-251',
        titleVi: 'Jazz Bossa (Thế Ba Cung Dm9 ➔ Db7 ➔ Cmaj9)',
        titleEn: 'Jazz Bossa (Tritone Sub Dm9 ➔ Db7 ➔ Cmaj9)',
        badgeVi: 'Jazz / Bossa',
        badgeEn: 'Jazz / Bossa',
        vibe: 'jazz-bossa',
        spiceLevel: 3,
        formula: '2 - bII7 - 1',
        chordsSummary: p3.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p3),
        rationaleVi: 'Kỹ thuật Tritone Sub kinh điển của Jazz thay thế G7 bằng Db7, lướt bass nửa cung cực êm.',
        rationaleEn: 'The hallmark Jazz tritone substitution replaces G7 with Db7 for half-step bass glide.',
        emotionTagVi: 'Quý phái, bất ngờ, sang trọng',
        emotionTagEn: 'Luxurious, witty, suave',
        progressionState: p3,
      });

      const p4 = buildProgressionState('2 - 6 - 5 - 1', 'pop-ballad', 2, keyRoot);
      options.push({
        id: 'opt-ballad-2651',
        titleVi: 'V-Pop / Asian Ballad (2 - 6 - 5 - 1 Sâu Lắng)',
        titleEn: 'V-Pop & Asian Ballad (2 - 6 - 5 - 1 Emotional Climax)',
        badgeVi: 'Asian Ballad',
        badgeEn: 'Asian Ballad',
        vibe: 'pop-ballad',
        spiceLevel: 2,
        formula: '2 - 6 - 5 - 1',
        chordsSummary: p4.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
        smoothnessScore: computeAvgSmoothness(p4),
        rationaleVi: 'Vòng hợp âm thống trị các bản hit V-Pop sâu lắng (Nàng Thơ, Cơn Mưa Băng Giá).',
        rationaleEn: 'Dominates heartfelt Asian pop ballads with a poetic, soaring emotional arch.',
        emotionTagVi: 'Man mác, thơ mộng, da diết',
        emotionTagEn: 'Poignant, poetic, tender',
        progressionState: p4,
      });

      return options;
    }
  }

  // General Case: User inputs any full or custom chord sequence (e.g. 2-5-1, 1-6-2-5, 4-5-3-6, C-Am-Dm-G, etc.)
  // We generate 5 tailored variations covering all 4 Vibes + Altered Neo-Soul

  // Option 1: Pop Ballad Lãng Mạn (Level 2 with Slash walkdown & Color Extensions)
  const opt1State = buildProgressionState(rawInput, 'pop-ballad', 2, keyRoot);
  options.push({
    id: 'opt-pop-ballad',
    titleVi: 'Phương Án 1: Pop Ballad Cảm Xúc (Lãng Mạn & Dạt Dào)',
    titleEn: 'Option 1: Emotional Pop Ballad (Luminous & Nostalgic)',
    badgeVi: 'Pop Ballad',
    badgeEn: 'Pop Ballad',
    vibe: 'pop-ballad',
    spiceLevel: 2,
    formula: opt1State.reharmonizedChords.map((c) => c.romanDegree).join(' - '),
    chordsSummary: opt1State.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
    smoothnessScore: computeAvgSmoothness(opt1State),
    rationaleVi:
      'Tự động bổ sung nốt 9th bay bổng (maj9, m9) và chèn hợp âm lùi bass V/7 (Slash Bass), giúp bài nhạc êm đềm như các bản tình ca Việt và J-Pop.',
    rationaleEn:
      'Infuses floating 9th extensions and step-wise slash bass walkdowns (e.g. V/7), creating a lush and emotional acoustic ballad texture.',
    emotionTagVi: 'Lãng mạn, bay bổng, êm dịu',
    emotionTagEn: 'Romantic, floating, serene',
    progressionState: opt1State,
  });

  // Option 2: R&B / Neo-Soul Ấm Áp (Level 2 with Rootless Voicings & Secondary Dominants)
  const opt2State = buildProgressionState(rawInput, 'rnb-neosoul', 2, keyRoot);
  options.push({
    id: 'opt-rnb-neosoul',
    titleVi: 'Phương Án 2: R&B / Neo-Soul Ấm Áp (Mượt Mà & Dầy Dặn)',
    titleEn: 'Option 2: Warm R&B / Neo-Soul (Velvety Rootless Voicings)',
    badgeVi: 'R&B / Neo-Soul',
    badgeEn: 'R&B / Neo-Soul',
    vibe: 'rnb-neosoul',
    spiceLevel: 2,
    formula: opt2State.reharmonizedChords.map((c) => c.romanDegree).join(' - '),
    chordsSummary: opt2State.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
    smoothnessScore: computeAvgSmoothness(opt2State),
    rationaleVi:
      'Thế bấm bỏ nốt gốc (Rootless), dồn nốt 9th và 11th đậm đặc ở tay phải kết hợp hợp âm át phụ V7/x thắt nút kịch tính.',
    rationaleEn:
      'Employs stacked rootless voicings with 9ths & 11ths, coupled with secondary dominants for a warm, velvety pulse.',
    emotionTagVi: 'Ấm áp, sang trọng, nhung mịn',
    emotionTagEn: 'Velvety, warm, soulful',
    progressionState: opt2State,
  });

  // Option 3: Jazz & Bossa Nova Sang Trọng (Level 3 with Tritone Substitutions & Guide Tones)
  const opt3State = buildProgressionState(rawInput, 'jazz-bossa', 3, keyRoot);
  options.push({
    id: 'opt-jazz-bossa',
    titleVi: 'Phương Án 3: Jazz & Bossa Nova (Thế Ba Cung Tritone Sub)',
    titleEn: 'Option 3: Sophisticated Jazz & Bossa (Tritone Substitutions)',
    badgeVi: 'Jazz / Bossa',
    badgeEn: 'Jazz / Bossa',
    vibe: 'jazz-bossa',
    spiceLevel: 3,
    formula: opt3State.reharmonizedChords.map((c) => c.romanDegree).join(' - '),
    chordsSummary: opt3State.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
    smoothnessScore: computeAvgSmoothness(opt3State),
    rationaleVi:
      'Thay thế hợp âm át bằng hợp âm giáng 2 (Tritone Sub bII7), vuốt bass nửa cung quý phái kiểu quán bar Jazz thính phòng New York.',
    rationaleEn:
      'Deploys chromatic tritone substitutions (bII7) and tight 3rd-7th guide tones for a sophisticated, urbane Jazz cadence.',
    emotionTagVi: 'Quý phái, bất ngờ, biến ảo',
    emotionTagEn: 'Suave, elegant, unpredictable',
    progressionState: opt3State,
  });

  // Option 4: Cinematic U Uất Sâu Lắng (Level 2 with Modal Interchange)
  const opt4State = buildProgressionState(rawInput, 'cinematic-sad', 2, keyRoot);
  options.push({
    id: 'opt-cinematic-sad',
    titleVi: 'Phương Án 4: Cinematic Sâu Lắng (Mượn Màu Giọng Thứ)',
    titleEn: 'Option 4: Cinematic Melancholy (Modal Minor Borrowing)',
    badgeVi: 'Cinematic',
    badgeEn: 'Cinematic',
    vibe: 'cinematic-sad',
    spiceLevel: 2,
    formula: opt4State.reharmonizedChords.map((c) => c.romanDegree).join(' - '),
    chordsSummary: opt4State.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
    smoothnessScore: computeAvgSmoothness(opt4State),
    rationaleVi:
      'Mượn hợp âm bậc IV thứ từ giọng song song (Modal Interchange), tạo không gian điện ảnh lắng đọng, nghẹn ngào chuẩn nhạc phim.',
    rationaleEn:
      'Borrows dramatic subdominant minor textures, sculpting a tear-jerking, poignant cinematic atmosphere.',
    emotionTagVi: 'Nghẹn ngào, điện ảnh, sâu lắng',
    emotionTagEn: 'Poignant, dramatic, haunting',
    progressionState: opt4State,
  });

  // Option 5: Altered Neo-Soul Spice Level 3
  const opt5State = buildProgressionState(rawInput, 'rnb-neosoul', 3, keyRoot);
  options.push({
    id: 'opt-neosoul-spicy',
    titleVi: 'Phương Án 5: Neo-Soul Đậm Màu (Altered Dominants 7#9)',
    titleEn: 'Option 5: Rich Neo-Soul (Altered Dominants & Diminished)',
    badgeVi: 'Neo-Soul Pro',
    badgeEn: 'Neo-Soul Pro',
    vibe: 'rnb-neosoul',
    spiceLevel: 3,
    formula: opt5State.reharmonizedChords.map((c) => c.romanDegree).join(' - '),
    chordsSummary: opt5State.reharmonizedChords.map((c) => c.symbol).join(' ➔ '),
    smoothnessScore: computeAvgSmoothness(opt5State),
    rationaleVi:
      'Mức độ gia vị tối đa: thêm hợp âm biến đổi Altered và nốt căng thẳng nghệ thuật rồi đáp nhẹ nhàng về hợp âm chủ.',
    rationaleEn:
      'Maximal harmonic spice: stacks altered dominant tensions before landing gracefully into tonic.',
    emotionTagVi: 'Hiện đại, cá tính, hoa mỹ',
    emotionTagEn: 'Modern, expressive, rich',
    progressionState: opt5State,
  });

  return options;
}
