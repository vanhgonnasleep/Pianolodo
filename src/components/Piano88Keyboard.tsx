import React, { useEffect, useRef } from 'react';
import { Language, VoicedChord } from '../types/harmony';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { t } from '../i18n/translations';
import { Lock } from 'lucide-react';

interface Piano88KeyboardProps {
  activeChord: VoicedChord | null;
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

export const Piano88Keyboard: React.FC<Piano88KeyboardProps> = ({ activeChord, lang = 'vi' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const scrollPos = 15 * 24 - 100;
      containerRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, []);

  const lhMidis = new Set(activeChord?.leftHand.map((n) => n.midi) || []);
  const rhMidis = new Set(activeChord?.rightHand.map((n) => n.midi) || []);

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

  const whiteKeyWidth = 24;
  const whiteKeyHeight = 130;
  const blackKeyWidth = 14;
  const blackKeyHeight = 84;

  return (
    <div className="bg-[#FFFFFF] p-4 md:p-6 border border-[#E5DFD7] rounded-2xl shadow-sm space-y-3">
      {/* Legend & Active Voicing Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#1C1917]">{t('pianoTitle', lang)}</span>
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
          </div>
        </div>

        <div className="text-[#78716C] text-[11px] font-mono">
          {t('fingerZone', lang)}
        </div>
      </div>

      {/* Piano Scrollable Viewport */}
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-xl border border-[#E5DFD7] bg-[#FAF8F5] p-3 shadow-inner scrollbar-thin"
      >
        <div
          className="relative select-none mx-auto"
          style={{ width: `${whiteCount * whiteKeyWidth}px`, height: `${whiteKeyHeight}px` }}
        >
          {/* 1. White keys */}
          {ALL_88_KEYS.filter((k) => !k.isBlack).map((k) => {
            const isLH = lhMidis.has(k.midi);
            const isRH = rhMidis.has(k.midi);
            const isKept = keptMidis.has(k.midi);
            const moved = movedMap.get(k.midi);

            let bgClass = 'bg-[#FEFDFB] hover:bg-[#F5F1EB] text-[#44403C] border-[#D6D0C7]';
            if (isLH) bgClass = 'bg-[#2563EB] text-white font-bold shadow-md shadow-[#2563EB]/25 border-[#1D4ED8]';
            if (isRH) bgClass = 'bg-[#D97706] text-white font-bold shadow-md shadow-[#D97706]/25 border-[#B45309]';

            return (
              <div
                key={k.midi}
                onClick={() => handlePlayKey(k.midi)}
                style={{
                  left: `${k.whiteIndex * whiteKeyWidth}px`,
                  width: `${whiteKeyWidth}px`,
                  height: `${whiteKeyHeight}px`,
                }}
                className={`absolute top-0 rounded-b-md border-r border-b border-l cursor-pointer flex flex-col justify-end items-center pb-2 transition duration-75 ${bgClass}`}
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
            const isKept = keptMidis.has(k.midi);
            const moved = movedMap.get(k.midi);

            const leftPos = (prevWhite.whiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

            let bgClass = 'bg-[#1C1917] hover:bg-[#292524] text-[#E7E5E4] border-[#0C0A09]';
            if (isLH) bgClass = 'bg-[#1D4ED8] text-white border-[#2563EB] shadow-md';
            if (isRH) bgClass = 'bg-[#B45309] text-white border-[#D97706] shadow-md';

            return (
              <div
                key={k.midi}
                onClick={() => handlePlayKey(k.midi)}
                style={{
                  left: `${leftPos}px`,
                  width: `${blackKeyWidth}px`,
                  height: `${blackKeyHeight}px`,
                }}
                className={`absolute top-0 z-10 rounded-b border cursor-pointer flex flex-col justify-end items-center pb-1.5 transition duration-75 shadow-md ${bgClass}`}
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
  );
};
