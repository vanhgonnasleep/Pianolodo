import React, { useState } from 'react';
import { Language } from '../types/harmony';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';

interface CircleOfFifthsProps {
  currentKey: string;
  onSelectKey: (key: string) => void;
  activeChordSymbol?: string;
  lang?: Language;
}

interface CircleSector {
  major: string;
  minor: string;
  angle: number; // in degrees (-90 = 12 o'clock)
  altMajor?: string;
}

const CIRCLE_KEYS: CircleSector[] = [
  { major: 'C', minor: 'Am', angle: -90 },
  { major: 'G', minor: 'Em', angle: -60 },
  { major: 'D', minor: 'Bm', angle: -30 },
  { major: 'A', minor: 'F#m', angle: 0 },
  { major: 'E', minor: 'C#m', angle: 30 },
  { major: 'B', minor: 'G#m', angle: 60 },
  { major: 'Gb', minor: 'Ebm', angle: 90, altMajor: 'F#' },
  { major: 'Db', minor: 'Bbm', angle: 120 },
  { major: 'Ab', minor: 'Fm', angle: 150 },
  { major: 'Eb', minor: 'Cm', angle: 180 },
  { major: 'Bb', minor: 'Gm', angle: 210 },
  { major: 'F', minor: 'Dm', angle: 240 },
];

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  currentKey,
  onSelectKey,
  lang = 'vi',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const cleanKey = currentKey.replace(/m$/, '');
  const currentIndex = CIRCLE_KEYS.findIndex(
    (k) => k.major === cleanKey || k.altMajor === cleanKey
  );
  const safeCurrentIdx = currentIndex !== -1 ? currentIndex : 0;

  // Diatonic indices on the wheel:
  // Subdominant IV = (index + 11) % 12 (1 step counter-clockwise)
  // Dominant V = (index + 1) % 12 (1 step clockwise)
  // Tritone Sub = (index + 6) % 12 (180 degrees directly opposite)
  const ivIndex = (safeCurrentIdx + 11) % 12;
  const vIndex = (safeCurrentIdx + 1) % 12;
  const tritoneIndex = (safeCurrentIdx + 6) % 12;

  const handleKeyClick = (majorKey: string) => {
    pianoAudioEngine.playNote(`${majorKey}4`, '4n');
    onSelectKey(majorKey);
  };

  const handleMinorClick = (minorKey: string) => {
    const root = minorKey.replace('m', '');
    pianoAudioEngine.playNote(`${root}4`, '4n');
  };

  // SVG dimensions
  const size = 300;
  const center = size / 2;
  const outerR = 108;
  const innerR = 68;

  return (
    <div className="rounded-2xl border border-[#E5DFD7] dark:border-[#292524] bg-[#FFFFFF] dark:bg-[#1C1917] p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-[#F5F1EB] dark:border-[#292524]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4] flex items-center gap-1.5 font-serif">
              <span>{lang === 'vi' ? 'Vòng Hòa Thanh Bậc 5' : 'Circle of Fifths Compass'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF8F5] dark:bg-[#292524] text-[#D97706] dark:text-[#F59E0B] font-bold">
                {currentKey}
              </span>
            </h3>
            <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
              {lang === 'vi'
                ? 'Định vị giọng chủ, bậc phụ cận IV - V và thay thế Tritone'
                : 'Interactive harmonic compass with diatonic neighbors & tritone sub'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] hover:bg-[#FAF8F5] dark:hover:bg-[#292524] transition"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-4 flex flex-col md:flex-row items-center justify-center gap-6">
          {/* SVG Wheel */}
          <div className="relative select-none">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Outer circle track */}
              <circle
                cx={center}
                cy={center}
                r={outerR + 18}
                fill="none"
                stroke="currentColor"
                className="text-[#F5F1EB] dark:text-[#292524]"
                strokeWidth={36}
              />

              {/* Inner relative minor circle track */}
              <circle
                cx={center}
                cy={center}
                r={innerR + 6}
                fill="none"
                stroke="currentColor"
                className="text-[#FAF8F5] dark:text-[#1F1C1A]"
                strokeWidth={28}
              />

              {/* Center Tonic Emblem */}
              <circle
                cx={center}
                cy={center}
                r={innerR - 18}
                className="fill-[#FFFFFF] dark:fill-[#12100E] stroke-[#E5DFD7] dark:stroke-[#292524]"
                strokeWidth={1.5}
              />
              <text
                x={center}
                y={center - 4}
                textAnchor="middle"
                className="fill-[#D97706] dark:fill-[#F59E0B] text-sm font-bold font-serif"
              >
                {currentKey}
              </text>
              <text
                x={center}
                y={center + 12}
                textAnchor="middle"
                className="fill-[#78716C] dark:fill-[#A8A29E] text-[10px] font-mono"
              >
                {lang === 'vi' ? 'Giọng chủ' : 'Tonic'}
              </text>

              {/* 12 Sectors */}
              {CIRCLE_KEYS.map((sector, idx) => {
                const rad = (sector.angle * Math.PI) / 180;
                const isCurrentTonic = idx === safeCurrentIdx;
                const isIV = idx === ivIndex;
                const isV = idx === vIndex;
                const isTritone = idx === tritoneIndex;

                const outerX = center + outerR * Math.cos(rad);
                const outerY = center + outerR * Math.sin(rad);

                const innerX = center + innerR * Math.cos(rad);
                const innerY = center + innerR * Math.sin(rad);

                let outerBg = '#FAF8F5';
                let outerBorder = '#E5DFD7';
                let outerText = '#1C1917';

                if (isCurrentTonic) {
                  outerBg = '#D97706';
                  outerBorder = '#B45309';
                  outerText = '#FFFFFF';
                } else if (isIV || isV) {
                  outerBg = '#FEF3C7';
                  outerBorder = '#FDE68A';
                  outerText = '#92400E';
                } else if (isTritone) {
                  outerBg = '#EFF6FF';
                  outerBorder = '#BFDBFE';
                  outerText = '#1D4ED8';
                }

                return (
                  <g key={sector.major}>
                    {/* Tritone line connector */}
                    {isCurrentTonic && (
                      <line
                        x1={outerX}
                        y1={outerY}
                        x2={center + outerR * Math.cos(((sector.angle + 180) * Math.PI) / 180)}
                        y2={center + outerR * Math.sin(((sector.angle + 180) * Math.PI) / 180)}
                        stroke="#2563EB"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        opacity={0.4}
                      />
                    )}

                    {/* Major Key Outer Button */}
                    <g
                      className="cursor-pointer transition-transform hover:scale-110 origin-center"
                      style={{ transformOrigin: `${outerX}px ${outerY}px` }}
                      onClick={() => handleKeyClick(sector.major)}
                    >
                      <circle
                        cx={outerX}
                        cy={outerY}
                        r={16}
                        fill={outerBg}
                        stroke={outerBorder}
                        strokeWidth={isCurrentTonic ? 2.5 : 1.5}
                        className="shadow-xs"
                      />
                      <text
                        x={outerX}
                        y={outerY + 4}
                        textAnchor="middle"
                        fill={outerText}
                        className="text-xs font-bold font-serif select-none pointer-events-none"
                      >
                        {sector.major}
                      </text>
                    </g>

                    {/* Minor Key Inner Label */}
                    <g
                      className="cursor-pointer transition hover:opacity-80"
                      onClick={() => handleMinorClick(sector.minor)}
                    >
                      <text
                        x={innerX}
                        y={innerY + 3}
                        textAnchor="middle"
                        className="fill-[#78716C] dark:fill-[#A8A29E] text-[10px] font-medium font-sans select-none"
                      >
                        {sector.minor}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Harmonic Relationship Legend & Quick Actions */}
          <div className="space-y-3 text-xs max-w-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD7] dark:border-[#292524]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-[#D97706] dark:text-[#F59E0B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  {lang === 'vi' ? 'Giọng chủ (Tonic I)' : 'Tonic Key (I)'}
                </span>
                <span className="font-mono font-bold text-sm text-[#1C1917] dark:text-[#F5F5F4]">{currentKey} Major</span>
              </div>
              <div className="flex items-center justify-between text-[#78716C] dark:text-[#A8A29E]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  {lang === 'vi' ? 'Bậc IV / V (Cận kề)' : 'Subdominant (IV) & Dominant (V)'}
                </span>
                <span className="font-mono font-semibold">
                  {CIRCLE_KEYS[ivIndex].major} • {CIRCLE_KEYS[vIndex].major}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#2563EB] dark:text-[#60A5FA]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  {lang === 'vi' ? 'Thay thế Tritone (bII7)' : 'Tritone Sub (bII7)'}
                </span>
                <span className="font-mono font-bold">
                  {CIRCLE_KEYS[tritoneIndex].major}7
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
              {lang === 'vi'
                ? '💡 Mẹo: Bấm trực tiếp vào các cung trên vòng để đổi giọng tức thì hoặc nghe thử âm sắc.'
                : '💡 Tip: Click any sector on the wheel to instantly transpose the studio or audition the root.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
