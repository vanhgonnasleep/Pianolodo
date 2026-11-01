import React, { useEffect, useRef, useMemo } from 'react';
import { Language, VoicedChord } from '../types/harmony';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { t } from '../i18n/translations';
import { Lock, Eye, Sparkles } from 'lucide-react';

interface Piano88KeyboardProps {
  activeChord: VoicedChord | null;
  previewChord?: VoicedChord | null;
  previewSource?: 'hover' | 'audition' | null;
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
  lang = 'vi',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const whiteKeyWidth = 24;
  const whiteKeyHeight = 130;
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
      const k = ALL_88_KEYS.find((item) => item.midi === midi);
      if (!k) return 0;
      if (!k.isBlack) {
        return k.whiteIndex * whiteKeyWidth + whiteKeyWidth / 2;
      } else {
        const prevW = ALL_88_KEYS.slice(0, ALL_88_KEYS.indexOf(k))
          .reverse()
          .find((item) => !item.isBlack);
        const prevWIdx = prevW ? prevW.whiteIndex : 0;
        return (prevWIdx + 1) * whiteKeyWidth;
      }
    };

    // Right-Hand Voice Leading connections
    const currentRh = activeChord.rightHand.map((n) => n.midi).sort((a, b) => a - b);
    const previewRh = previewChord.rightHand.map((n) => n.midi).sort((a, b) => a - b);

    previewRh.forEach((pMidi, idx) => {
      const cMidi = currentRh[idx] ?? currentRh[0];
      if (cMidi !== undefined) {
        arcs.push({
          x1: getKeyCenter(cMidi),
          x2: getKeyCenter(pMidi),
          color: '#D97706',
          isKept: cMidi === pMidi,
          semitones: pMidi - cMidi,
        });
      }
    });

    return arcs;
  }, [activeChord, previewChord]);

  const handlePlayKey = (midi: number) => {
    const note = ALL_88_KEYS.find((k) => k.midi === midi);
    if (!note) return;
    const dummyChord: VoicedChord = {
      id: `single-${midi}`,
      symbol: note.noteName,
      romanDegree: '',
      functionRole: 'primary',
      leftHand: [],
      rightHand: [
        {
          noteName: note.noteName,
          pitchClass: note.noteName.slice(0, -1),
          midi,
          hand: 'right',
          role: 'root',
        },
      ],
      voiceLeading: { keptNotes: [], movedNotes: [], smoothnessScore: 100 },
      explanation: {
        ruleId: '',
        title: '',
        titleEn: '',
        whySmooth: '',
        whySmoothEn: '',
        fingerTip: '',
        fingerTipEn: '',
        emotionTag: '',
        emotionTagEn: '',
      },
      beats: 1,
    };
    pianoAudioEngine.playVoicedChord(dummyChord, 'block');
  };

  return (
    <div className="bg-[#FFFFFF] p-4 md:p-6 border border-[#E5DFD7] rounded-2xl shadow-sm space-y-3">
      {/* Legend & Active Voicing Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
            <span>{t('pianoTitle', lang)}</span>
            {previewChord && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono text-[11px] font-bold border border-[#FDE68A] animate-pulse">
                {previewSource === 'audition' ? (
                  <Sparkles className="w-3 h-3 text-[#D97706]" />
                ) : (
                  <Eye className="w-3 h-3 text-[#D97706]" />
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

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#2563EB]">
              <span className="w-3 h-3 rounded-full bg-[#2563EB] inline-block shadow-xs" />
              {t('leftHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#D97706]">
              <span className="w-3 h-3 rounded-full bg-[#D97706] inline-block shadow-xs" />
              {t('rightHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 text-[#78716C]">
              <Lock className="w-3.5 h-3.5 text-[#D97706]" />
              {t('keptNotesLegend', lang)}
            </span>
            {previewChord && (
              <span className="flex items-center gap-1.5 font-semibold text-[#B45309]">
                <span className="w-3 h-3 rounded-full border-2 border-dashed border-[#D97706] bg-[#FEF3C7] inline-block" />
                {lang === 'vi' ? 'Ghost Voicing' : 'Ghost Preview'}
              </span>
            )}
          </div>
        </div>

        <div className="text-[#78716C] text-[11px] font-mono">
          {t('fingerZone', lang)}
        </div>
      </div>

      {/* Piano Scrollable Viewport with Voice-Leading SVG Overlay */}
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-xl border border-[#E5DFD7] bg-[#FAF8F5] p-3 shadow-inner scrollbar-thin relative"
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
              const isKept = keptMidis.has(k.midi);
              const moved = movedMap.get(k.midi);

              let bgClass = 'bg-[#FEFDFB] hover:bg-[#F5F1EB] text-[#44403C] border-[#D6D0C7]';
              if (isLH) bgClass = 'bg-[#2563EB] text-white font-bold shadow-md shadow-[#2563EB]/25 border-[#1D4ED8]';
              if (isRH) bgClass = 'bg-[#D97706] text-white font-bold shadow-md shadow-[#D97706]/25 border-[#B45309]';
              if (isGhostLH) bgClass = 'bg-[#DBEAFE] text-[#1E40AF] font-bold border-2 border-dashed border-[#2563EB] ghost-key-anim';
              if (isGhostRH) bgClass = 'bg-[#FEF3C7] text-[#92400E] font-bold border-2 border-dashed border-[#D97706] ghost-key-anim';

              return (
                <div
                  key={k.midi}
                  onClick={() => handlePlayKey(k.midi)}
                  style={{
                    left: `${k.whiteIndex * whiteKeyWidth}px`,
                    width: `${whiteKeyWidth}px`,
                    height: `${whiteKeyHeight}px`,
                  }}
                  className={`absolute top-0 rounded-b-md border-r border-b border-l cursor-pointer flex flex-col justify-end items-center pb-2 transition duration-75 active:scale-y-[0.98] origin-top ${bgClass}`}
                >
                  {isKept && (
                    <div className="absolute top-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[9px] rounded-full p-0.5 shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {moved !== undefined && (
                    <div className="absolute top-1 bg-[#1C1917] text-[#FDE68A] font-mono text-[9px] font-bold px-1 rounded shadow-xs">
                      {moved > 0 ? `+${moved}` : moved}
                    </div>
                  )}
                  <span className="text-[10px] font-semibold leading-none">{k.noteName}</span>
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
              const isKept = keptMidis.has(k.midi);
              const moved = movedMap.get(k.midi);

              const leftPos = (prevWhite.whiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

              let bgClass = 'bg-[#1C1917] hover:bg-[#292524] text-[#E7E5E4] border-[#0C0A09]';
              if (isLH) bgClass = 'bg-[#1D4ED8] text-white border-[#2563EB] shadow-md';
              if (isRH) bgClass = 'bg-[#B45309] text-white border-[#D97706] shadow-md';
              if (isGhostLH) bgClass = 'bg-[#1E3A8A] text-white border-2 border-dashed border-[#60A5FA] ghost-key-anim';
              if (isGhostRH) bgClass = 'bg-[#78350F] text-white border-2 border-dashed border-[#FBBF24] ghost-key-anim';

              return (
                <div
                  key={k.midi}
                  onClick={() => handlePlayKey(k.midi)}
                  style={{
                    left: `${leftPos}px`,
                    width: `${blackKeyWidth}px`,
                    height: `${blackKeyHeight}px`,
                  }}
                  className={`absolute top-0 z-10 rounded-b border cursor-pointer flex flex-col justify-end items-center pb-1.5 transition duration-75 shadow-md active:scale-y-[0.98] origin-top ${bgClass}`}
                >
                  {isKept && (
                    <div className="absolute top-0.5 bg-[#FEF3C7] text-[#B45309] text-[8px] rounded-full p-0.5">
                      <Lock className="w-2 h-2" />
                    </div>
                  )}
                  {moved !== undefined && (
                    <div className="absolute top-0.5 bg-[#1C1917] text-[#FDE68A] font-mono text-[8px] font-bold px-0.5 rounded">
                      {moved > 0 ? `+${moved}` : moved}
                    </div>
                  )}

                  <span className="text-[8px] font-mono leading-none scale-90">{k.noteName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
