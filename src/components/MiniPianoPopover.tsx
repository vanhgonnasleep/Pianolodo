import React from 'react';
import { VoicedChord } from '../types/harmony';

interface MiniPianoPopoverProps {
  chord: VoicedChord;
  multiChords?: VoicedChord[];
  align?: 'top' | 'bottom';
  className?: string;
}

const MINI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface MiniKeyData {
  midi: number;
  noteName: string;
  isBlack: boolean;
  whiteIndex: number;
}

// Generate 3 Octaves (C2 to B4: midi 36 to 71, 21 white keys)
const MINI_KEYS: MiniKeyData[] = [];
let miniWhiteCount = 0;
for (let midi = 36; midi <= 71; midi++) {
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const isBlack = [1, 3, 6, 8, 10].includes(pc);
  MINI_KEYS.push({
    midi,
    noteName: `${MINI_NOTE_NAMES[pc]}${octave}`,
    isBlack,
    whiteIndex: isBlack ? -1 : miniWhiteCount++,
  });
}

export const MiniPianoPopover: React.FC<MiniPianoPopoverProps> = ({
  chord,
  multiChords,
  align = 'top',
  className = '',
}) => {
  const whiteKeyWidth = 11;
  const whiteKeyHeight = 44;
  const blackKeyWidth = 6.5;
  const blackKeyHeight = 27;
  const totalWidth = miniWhiteCount * whiteKeyWidth;

  // Render an individual mini piano for a chord
  const renderMiniPiano = (targetChord: VoicedChord, label?: string) => {
    const lhMidis = new Set(targetChord.leftHand.map((n) => n.midi));
    const rhMidis = new Set(targetChord.rightHand.map((n) => n.midi));

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="text-[#1C1917] dark:text-[#F4F4F6]">{label}</span>
            <span className="text-[#D97706] dark:text-[#F59E0B]">{targetChord.symbol}</span>
          </div>
        )}
        <div
          className="relative bg-[#FAF8F5] dark:bg-[#09090B] border border-[#E5DFD7] dark:border-[#272736] rounded-md overflow-hidden select-none shadow-inner"
          style={{ width: `${totalWidth}px`, height: `${whiteKeyHeight}px` }}
        >
          {/* White keys */}
          {MINI_KEYS.filter((k) => !k.isBlack).map((k) => {
            const isLH = lhMidis.has(k.midi);
            const isRH = rhMidis.has(k.midi);

            let bg = '#FFFFFF';
            if (isLH) bg = '#2563EB';
            if (isRH) bg = '#D97706';

            return (
              <div
                key={k.midi}
                style={{
                  left: `${k.whiteIndex * whiteKeyWidth}px`,
                  width: `${whiteKeyWidth}px`,
                  height: `${whiteKeyHeight}px`,
                  backgroundColor: bg,
                }}
                className={`absolute top-0 border-r border-[#E5DFD7] dark:border-[#272736] transition-colors duration-100 ${
                  isLH || isRH ? 'z-10 shadow-xs' : 'dark:bg-[#E4E4E7]'
                }`}
              />
            );
          })}

          {/* Black keys */}
          {MINI_KEYS.filter((k) => k.isBlack).map((k) => {
            const isLH = lhMidis.has(k.midi);
            const isRH = rhMidis.has(k.midi);

            const prevKey = MINI_KEYS.find((item) => item.midi === k.midi - 1);
            const prevWhiteIndex = prevKey ? prevKey.whiteIndex : 0;
            const leftOffset = prevWhiteIndex * whiteKeyWidth + (whiteKeyWidth - blackKeyWidth / 2);

            let bg = '#292524';
            if (isLH) bg = '#1D4ED8';
            if (isRH) bg = '#B45309';

            return (
              <div
                key={k.midi}
                style={{
                  left: `${leftOffset}px`,
                  width: `${blackKeyWidth}px`,
                  height: `${blackKeyHeight}px`,
                  backgroundColor: bg,
                }}
                className={`absolute top-0 z-20 rounded-b-[1px] border border-black/20 ${
                  isLH || isRH ? 'ring-1 ring-white/50 shadow-sm' : 'dark:bg-[#181822]'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const isMulti = multiChords && multiChords.length > 1;

  return (
    <div
      className={`popover-spring absolute z-50 pointer-events-none p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#121217] border border-[#E5DFD7] dark:border-[#272736] shadow-xl dark:shadow-[0_0_25px_rgba(0,0,0,0.8)] text-[#1C1917] dark:text-[#F4F4F6] space-y-2.5 ${
        align === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } ${className}`}
      style={{ minWidth: isMulti ? '320px' : '250px' }}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-[#F5F1EB] dark:border-[#22222E] pb-2">
        <div className="flex items-center gap-2">
          <span className="font-serif font-extrabold text-lg text-[#1C1917] dark:text-[#F4F4F6] tracking-tight">
            {chord.symbol}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#1A1A26] text-[#78716C] dark:text-[#9494A6] border border-[#E5DFD7] dark:border-[#2E2E42]">
            {chord.romanDegree || 'Chord'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold">
          <span className="flex items-center gap-1 text-[#2563EB] dark:text-[#38BDF8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-[#38BDF8]" />
            LH
          </span>
          <span className="flex items-center gap-1 text-[#D97706] dark:text-[#F59E0B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B]" />
            RH
          </span>
        </div>
      </div>

      {/* Mini Visualizer Canvas */}
      {isMulti ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#78716C] dark:text-[#9494A6] uppercase tracking-wider">
            Chuỗi hợp âm dự kiến:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {multiChords.map((ch, idx) => (
              <React.Fragment key={ch.id || idx}>
                {renderMiniPiano(ch, `#${idx + 1}`)}
                {idx < multiChords.length - 1 && (
                  <span className="text-[#A8A29E] dark:text-[#71717A] font-bold text-sm self-center">➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        renderMiniPiano(chord)
      )}

      {/* Literal Note Names Breakdown */}
      <div className="pt-2 border-t border-[#F5F1EB] dark:border-[#22222E] text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="text-[#2563EB] dark:text-[#38BDF8] font-bold">
          <span className="text-[#78716C] dark:text-[#9494A6] font-normal text-xs mr-1">LH:</span>
          {chord.leftHand.map((n) => n.noteName).join(' · ') || '—'}
        </div>
        <div className="text-[#D97706] dark:text-[#F59E0B] font-bold">
          <span className="text-[#78716C] dark:text-[#9494A6] font-normal text-xs mr-1">RH:</span>
          {chord.rightHand.map((n) => n.noteName).join(' · ') || '—'}
        </div>
      </div>
    </div>
  );
};
