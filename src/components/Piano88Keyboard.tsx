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
    <div className="bg-slate-950 p-4 border-b border-slate-800 space-y-3">
      {/* Legend & Active Voicing Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-300">{t('pianoTitle', lang)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500/50" />
              {t('leftHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50" />
              {t('rightHand', lang)}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              {t('keptNotesLegend', lang)}
            </span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          {t('fingerZone', lang)}
        </div>
      </div>

      {/* Piano Scrollable Viewport */}
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3 shadow-inner scrollbar-thin"
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

            let bgClass = 'bg-white hover:bg-slate-100 text-slate-800';
            if (isLH) bgClass = 'bg-blue-500 text-white shadow-lg shadow-blue-500/30';
            if (isRH) bgClass = 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30';

            return (
              <div
                key={k.midi}
                onClick={() => handlePlayKey(k.midi)}
                style={{
                  left: `${k.whiteIndex * whiteKeyWidth}px`,
                  width: `${whiteKeyWidth}px`,
                  height: `${whiteKeyHeight}px`,
                }}
                className={`absolute top-0 rounded-b-md border-r border-b border-l border-slate-400/80 cursor-pointer flex flex-col justify-end items-center pb-2 transition duration-75 ${bgClass}`}
              >
                {isKept && (
                  <div className="absolute top-1 bg-amber-400/90 text-slate-950 text-[9px] rounded-full p-0.5 shadow">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
                {moved !== undefined && (
                  <div className="absolute top-1 bg-slate-900 text-amber-300 font-mono text-[9px] font-bold px-1 rounded shadow">
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

            let bgClass = 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-950';
            if (isLH) bgClass = 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/40';
            if (isRH) bgClass = 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-500/40';

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
                  <div className="absolute top-0.5 bg-amber-400 text-slate-950 text-[8px] rounded-full p-0.5">
                    <Lock className="w-2 h-2" />
                  </div>
                )}
                {moved !== undefined && (
                  <div className="absolute top-0.5 bg-slate-950 text-amber-300 font-mono text-[8px] font-bold px-0.5 rounded">
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
