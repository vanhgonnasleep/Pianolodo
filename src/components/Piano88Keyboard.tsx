import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Language, VoicedChord } from '../types/harmony';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { t } from '../i18n/translations';
import { Lock, Eye, Sparkles, Hand } from 'lucide-react';

interface Piano88KeyboardProps {
  activeChord: VoicedChord | null;
  previewChord?: VoicedChord | null;
  previewSource?: 'hover' | 'audition' | null;
  liveMidis?: number[];
  lang?: Language;
}

interface KeyData {
  midi: number;
  noteName: string;
  isBlack: boolean;
  whiteIndex: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALL_88_KEYS: KeyData[] = [];

let whiteCount = 0;
for (let midi = 21; midi <= 108; midi++) {
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = `${NOTE_NAMES[pc]}${octave}`;
  const isBlack = [1, 3, 6, 8, 10].includes(pc);
  ALL_88_KEYS.push({
    midi,
    noteName: name,
    isBlack,
    whiteIndex: isBlack ? -1 : whiteCount++,
  });
}

export const Piano88Keyboard: React.FC<Piano88KeyboardProps> = ({
  activeChord,
  previewChord = null,
  previewSource = null,
  liveMidis = [],
  lang = 'vi',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFingering, setShowFingering] = useState<boolean>(true);

  const whiteKeyWidth = 24;
  const whiteKeyHeight = 132;
  const blackKeyWidth = 14;
  const blackKeyHeight = 84;

  // Active Chord Note Sets
  const lhMidis = useMemo(
    () => new Set(activeChord?.leftHand.map((n) => n.midi) || []),
    [activeChord]
  );
  const rhMidis = useMemo(
    () => new Set(activeChord?.rightHand.map((n) => n.midi) || []),
    [activeChord]
  );

  // Preview Chord Note Sets (Ghost Voicing)
  const previewLhMidis = useMemo(
    () => new Set(previewChord?.leftHand.map((n) => n.midi) || []),
    [previewChord]
  );
  const previewRhMidis = useMemo(
    () => new Set(previewChord?.rightHand.map((n) => n.midi) || []),
    [previewChord]
  );

  const liveMidiSet = useMemo(() => new Set(liveMidis), [liveMidis]);

  // Suggested Finger Numbering Map
  const fingerMap = useMemo(() => {
    const map = new Map<number, { finger: number; hand: 'L' | 'R' }>();
    if (!activeChord) return map;

    // Left hand fingering
    const lhSorted = [...activeChord.leftHand].sort((a, b) => a.midi - b.midi);
    if (lhSorted.length === 1) {
      map.set(lhSorted[0].midi, { finger: 1, hand: 'L' });
    } else if (lhSorted.length === 2) {
      map.set(lhSorted[0].midi, { finger: 5, hand: 'L' }); // 5 on bass
      map.set(lhSorted[1].midi, { finger: 1, hand: 'L' }); // 1 on fifth/octave
    } else if (lhSorted.length >= 3) {
      map.set(lhSorted[0].midi, { finger: 5, hand: 'L' });
      map.set(lhSorted[1].midi, { finger: 3, hand: 'L' });
      map.set(lhSorted[2].midi, { finger: 1, hand: 'L' });
    }

    // Right hand fingering
    const rhSorted = [...activeChord.rightHand].sort((a, b) => a.midi - b.midi);
    if (rhSorted.length === 1) {
      map.set(rhSorted[0].midi, { finger: 1, hand: 'R' });
    } else if (rhSorted.length === 2) {
      map.set(rhSorted[0].midi, { finger: 1, hand: 'R' });
      map.set(rhSorted[1].midi, { finger: 5, hand: 'R' });
    } else if (rhSorted.length === 3) {
      map.set(rhSorted[0].midi, { finger: 1, hand: 'R' });
      map.set(rhSorted[1].midi, { finger: 3, hand: 'R' });
      map.set(rhSorted[2].midi, { finger: 5, hand: 'R' });
    } else if (rhSorted.length === 4) {
      map.set(rhSorted[0].midi, { finger: 1, hand: 'R' });
      map.set(rhSorted[1].midi, { finger: 2, hand: 'R' });
      map.set(rhSorted[2].midi, { finger: 4, hand: 'R' });
      map.set(rhSorted[3].midi, { finger: 5, hand: 'R' });
    } else if (rhSorted.length >= 5) {
      rhSorted.forEach((n, idx) => {
        map.set(n.midi, { finger: Math.min(5, idx + 1), hand: 'R' });
      });
    }

    return map;
  }, [activeChord]);

  // Auto-scroll piano container to center active / preview chord
  useEffect(() => {
    if (!containerRef.current) return;
    const targetChord = previewChord || activeChord;
    if (!targetChord) return;

    const allNotes = [...targetChord.leftHand, ...targetChord.rightHand];
    if (allNotes.length === 0) return;

    const avgMidi =
      allNotes.reduce((acc, curr) => acc + curr.midi, 0) / allNotes.length;

    const keyObj = ALL_88_KEYS.find((k) => k.midi === Math.round(avgMidi));
    if (keyObj) {
      const whiteIdx =
        keyObj.whiteIndex !== -1
          ? keyObj.whiteIndex
          : (ALL_88_KEYS.find((k) => k.midi === keyObj.midi - 1)?.whiteIndex ?? 20);

      const targetX = whiteIdx * whiteKeyWidth - containerRef.current.clientWidth / 2 + 50;
      if (typeof containerRef.current.scrollTo === 'function') {
        containerRef.current.scrollTo({
          left: Math.max(0, targetX),
          behavior: 'smooth',
        });
      } else {
        containerRef.current.scrollLeft = Math.max(0, targetX);
      }
    }
  }, [activeChord?.id, previewChord?.id]);

  const keptMidis = new Set<number>();
  const movedMap = new Map<number, number>();

  if (activeChord) {
    const diff = activeChord.voiceLeading;
    diff.keptNotes.forEach((nStr) => {
      const found = activeChord.rightHand.find((n) => n.noteName === nStr);
      if (found) keptMidis.add(found.midi);
    });

    diff.movedNotes.forEach((m) => {
      const found = activeChord.rightHand.find((n) => n.noteName === m.toNote);
      if (found) movedMap.set(found.midi, m.semitones);
    });
  }

  // Calculate Voice-Leading Vector Arcs (Current -> Preview)
  const voiceLeadingArcs = useMemo(() => {
    if (!activeChord || !previewChord || activeChord.id === previewChord.id) return [];

    const arcs: Array<{
      x1: number;
      x2: number;
      color: string;
      isKept: boolean;
      semitones: number;
    }> = [];

    const getKeyCenter = (midi: number) => {
      const keyObj = ALL_88_KEYS.find((k) => k.midi === midi);
      if (!keyObj) return 0;
      if (!keyObj.isBlack) {
        return keyObj.whiteIndex * whiteKeyWidth + whiteKeyWidth / 2;
      }
      const prevWhite = ALL_88_KEYS.filter((k) => !k.isBlack && k.midi < midi).pop();
      const prevWhiteIdx = prevWhite ? prevWhite.whiteIndex : 0;
      return (prevWhiteIdx + 1) * whiteKeyWidth;
    };

    const previewDiff = previewChord.voiceLeading;
    if (previewDiff) {
      previewDiff.keptNotes.forEach((noteStr) => {
        const found = previewChord.rightHand.find((n) => n.noteName === noteStr);
        if (found) {
          const x = getKeyCenter(found.midi);
          arcs.push({
            x1: x,
            x2: x,
            color: '#10B981',
            isKept: true,
            semitones: 0,
          });
        }
      });

      previewDiff.movedNotes.forEach((move) => {
        const fromFound = activeChord.rightHand.find((n) => n.noteName === move.fromNote);
        const toFound = previewChord.rightHand.find((n) => n.noteName === move.toNote);
        if (fromFound && toFound) {
          const x1 = getKeyCenter(fromFound.midi);
          const x2 = getKeyCenter(toFound.midi);
          const color = Math.abs(move.semitones) <= 2 ? '#3B82F6' : '#EF4444';
          arcs.push({
            x1,
            x2,
            color,
            isKept: false,
            semitones: move.semitones,
          });
        }
      });
    }

    return arcs;
  }, [activeChord, previewChord]);

  const handlePlayKey = (midi: number) => {
    const keyObj = ALL_88_KEYS.find((k) => k.midi === midi);
    if (!keyObj) return;
    pianoAudioEngine.playNote(keyObj.noteName, '4n');
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121217] p-4 md:p-6 border border-[#E5DFD7] dark:border-[#272736] rounded-2xl shadow-sm space-y-3 transition-colors">
      {/* Legend & Active Voicing Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#1C1917] dark:text-[#F4F4F6] flex items-center gap-1.5 font-serif">
            <span>{t('pianoTitle', lang)}</span>
            {previewChord && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] font-mono text-[11px] font-bold border border-[#FDE68A] dark:border-[#F59E0B]/40 animate-pulse glow-amber">
                {previewSource === 'audition' ? (
                  <Sparkles className="w-3 h-3 text-[#D97706] dark:text-[#F59E0B]" />
                ) : (
                  <Eye className="w-3 h-3 text-[#D97706] dark:text-[#F59E0B]" />
                )}
                <span>
                  {previewSource === 'audition'
                    ? lang === 'vi' ? 'Đang phát thử:' : 'Auditioning:'
                    : lang === 'vi' ? 'Xem trước:' : 'Previewing:'}{' '}
                  {previewChord.symbol}
                </span>
              </span>
            )}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#2563EB] dark:text-[#3B82F6]">
              <span className="w-3 h-3 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] inline-block shadow-xs dark:shadow-[0_0_8px_#3B82F6]" />
              {t('leftHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#D97706] dark:text-[#F59E0B]">
              <span className="w-3 h-3 rounded-full bg-[#D97706] dark:bg-[#F59E0B] inline-block shadow-xs dark:shadow-[0_0_8px_#F59E0B]" />
              {t('rightHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 text-[#78716C] dark:text-[#9494A6]">
              <Lock className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
              {t('keptNotesLegend', lang)}
            </span>
            {previewChord && (
              <span className="flex items-center gap-1.5 font-semibold text-[#0284C7] dark:text-[#06B6D4]">
                <span className="w-3 h-3 rounded-full border-2 border-dashed border-[#06B6D4] bg-[#06B6D4]/20 inline-block" />
                {lang === 'vi' ? 'Ghost Voicing' : 'Ghost Preview'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFingering((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showFingering
                ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#F59E0B]/40'
                : 'bg-[#FAF8F5] dark:bg-[#181824] text-[#78716C] dark:text-[#9494A6] border-[#E5DFD7] dark:border-[#2E2E42]'
            }`}
            title="Bật/tắt số ngón tay gợi ý (1-5)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Số ngón tay (1-5)' : 'Finger Numbers'}</span>
          </button>

          <div className="text-[#78716C] dark:text-[#9494A6] text-xs font-mono hidden sm:block">
            {t('fingerZone', lang)}
          </div>
        </div>
      </div>

      {/* Piano Scrollable Viewport with Voice-Leading SVG Overlay */}
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-xl border border-[#E5DFD7] dark:border-[#272736] bg-[#FAF8F5] dark:bg-[#09090B] p-3 shadow-inner scrollbar-thin relative"
      >
        <div
          className="relative select-none mx-auto"
          style={{ width: `${whiteCount * whiteKeyWidth}px`, height: `${whiteKeyHeight + 24}px` }}
        >
          {/* SVG Voice-Leading Arcs Overlay */}
          {voiceLeadingArcs.length > 0 && (
            <svg
              className="absolute top-0 left-0 w-full h-[24px] pointer-events-none z-30"
              style={{ width: `${whiteCount * whiteKeyWidth}px` }}
            >
              {voiceLeadingArcs.map((arc, i) => {
                if (arc.isKept) {
                  return (
                    <circle
                      key={`arc-${i}`}
                      cx={arc.x1}
                      cy={12}
                      r={4}
                      fill={arc.color}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  );
                }
                const midX = (arc.x1 + arc.x2) / 2;
                return (
                  <g key={`arc-${i}`}>
                    <path
                      d={`M ${arc.x1} 22 Q ${midX} 2 ${arc.x2} 22`}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={2}
                      strokeDasharray="3,2"
                      opacity={0.85}
                    />
                    <circle cx={arc.x2} cy={20} r={3} fill={arc.color} />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Keys Canvas offset by 24px for Voice Leading Arcs */}
          <div className="relative" style={{ top: '24px' }}>
            {/* 1. White keys */}
            {ALL_88_KEYS.filter((k) => !k.isBlack).map((k) => {
              const isLH = lhMidis.has(k.midi);
              const isRH = rhMidis.has(k.midi);
              const isGhostLH = !isLH && previewLhMidis.has(k.midi);
              const isGhostRH = !isRH && previewRhMidis.has(k.midi);
              const isLive = liveMidiSet.has(k.midi);
              const isKept = keptMidis.has(k.midi);
              const moved = movedMap.get(k.midi);
              const fingering = fingerMap.get(k.midi);

              let keyClasses = 'key-3d-white text-[#44403C] hover:bg-[#F5F1EB]';
              if (isLH) keyClasses = 'key-3d-active-lh text-white font-bold';
              else if (isRH) keyClasses = 'key-3d-active-rh text-white font-bold';
              else if (isLive) keyClasses = 'bg-[#10B981] text-white font-bold shadow-md';
              else if (isGhostLH) keyClasses = 'bg-[#DBEAFE] text-[#1E40AF] font-bold border-2 border-dashed border-[#2563EB] ghost-key-anim';
              else if (isGhostRH) keyClasses = 'bg-[#FEF3C7] text-[#92400E] font-bold border-2 border-dashed border-[#D97706] ghost-key-anim';

              return (
                <div
                  key={k.midi}
                  onClick={() => handlePlayKey(k.midi)}
                  style={{
                    left: `${k.whiteIndex * whiteKeyWidth}px`,
                    width: `${whiteKeyWidth}px`,
                    height: `${whiteKeyHeight}px`,
                  }}
                  className={`absolute top-0 rounded-b-md border-r border-l cursor-pointer flex flex-col justify-end items-center pb-2 transition duration-75 active:scale-y-[0.98] origin-top ${keyClasses}`}
                >
                  {/* Finger Number Badge */}
                  {showFingering && fingering && (
                    <div className="absolute top-1 bg-white/90 dark:bg-black/80 text-[#1C1917] dark:text-[#F5F5F4] text-[10px] font-mono font-bold px-1 rounded-full shadow-xs">
                      {fingering.finger}
                    </div>
                  )}

                  {isKept && !showFingering && (
                    <div className="absolute top-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] rounded-full p-0.5 shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {moved !== undefined && !showFingering && (
                    <div className="absolute top-1 bg-[#1C1917] text-[#FDE68A] font-mono text-[10px] font-bold px-1 rounded shadow-xs">
                      {moved > 0 ? `+${moved}` : moved}
                    </div>
                  )}
                  <span className="text-xs font-bold leading-none">{k.noteName}</span>
                </div>
              );
            })}

            {/* 2. Black keys */}
            {ALL_88_KEYS.map((k, idx) => {
              if (!k.isBlack) return null;

              const prevWhite = ALL_88_KEYS.slice(0, idx)
                .reverse()
                .find((item) => !item.isBlack);
              if (!prevWhite) return null;

              const isLH = lhMidis.has(k.midi);
              const isRH = rhMidis.has(k.midi);
              const isGhostLH = !isLH && previewLhMidis.has(k.midi);
              const isGhostRH = !isRH && previewRhMidis.has(k.midi);
              const isLive = liveMidiSet.has(k.midi);
              const isKept = keptMidis.has(k.midi);
              const moved = movedMap.get(k.midi);
              const fingering = fingerMap.get(k.midi);

              const leftPos = (prevWhite.whiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

              let keyClasses = 'key-3d-black text-[#E7E5E4]';
              if (isLH) keyClasses = 'key-3d-active-lh text-white';
              else if (isRH) keyClasses = 'key-3d-active-rh text-white';
              else if (isLive) keyClasses = 'bg-[#10B981] text-white font-bold shadow-md';
              else if (isGhostLH) keyClasses = 'bg-[#1E3A8A] text-white border-2 border-dashed border-[#60A5FA] ghost-key-anim';
              else if (isGhostRH) keyClasses = 'bg-[#78350F] text-white border-2 border-dashed border-[#FBBF24] ghost-key-anim';

              return (
                <div
                  key={k.midi}
                  onClick={() => handlePlayKey(k.midi)}
                  style={{
                    left: `${leftPos}px`,
                    width: `${blackKeyWidth}px`,
                    height: `${blackKeyHeight}px`,
                  }}
                  className={`absolute top-0 z-10 rounded-b cursor-pointer flex flex-col justify-end items-center pb-1.5 transition duration-75 origin-top ${keyClasses}`}
                >
                  {/* Finger Number Badge */}
                  {showFingering && fingering && (
                    <div className="absolute top-0.5 bg-white/90 dark:bg-black/80 text-[#1C1917] dark:text-[#F5F5F4] text-[9px] font-mono font-bold px-0.5 rounded shadow-xs">
                      {fingering.finger}
                    </div>
                  )}

                  {isKept && !showFingering && (
                    <div className="absolute top-0.5 bg-[#FEF3C7] text-[#B45309] text-[9px] rounded-full p-0.5">
                      <Lock className="w-2 h-2" />
                    </div>
                  )}
                  {moved !== undefined && !showFingering && (
                    <div className="absolute top-0.5 bg-[#1C1917] text-[#FDE68A] font-mono text-[9px] font-bold px-0.5 rounded">
                      {moved > 0 ? `+${moved}` : moved}
                    </div>
                  )}

                  <span className="text-[10px] font-semibold leading-none">{k.noteName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
