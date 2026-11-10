import React, { useState } from 'react';
import { BridgeCandidate, GroovePatternId, Language, VibeId, VoicedChord } from '../types/harmony';
import { getBridgeCandidates } from '../engine/bridgeSuggester';
import { t } from '../i18n/translations';
import { MiniPianoPopover } from './MiniPianoPopover';
import { Play, Square, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';

interface ChordTimelineProps {
  originalChords: VoicedChord[];
  reharmonizedChords: VoicedChord[];
  activeChordIndex: number;
  onSelectChord: (index: number) => void;
  isPlaying: boolean;
  playingIndex: number | null;
  playingMode: 'original' | 'reharmonized' | null;
  onPlayOriginal: () => void;
  onPlayReharmonized: () => void;
  onStop: () => void;
  groove: GroovePatternId;
  onGrooveChange: (g: GroovePatternId) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onInsertBridge: (indexAfter: number, candidate: BridgeCandidate) => void;
  keyRoot: string;
  vibe: VibeId;
  lang: Language;
  onHoverChord?: (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => void;
  onLeaveHover?: () => void;
}

export const ChordTimeline: React.FC<ChordTimelineProps> = ({
  originalChords,
  reharmonizedChords,
  activeChordIndex,
  onSelectChord,
  isPlaying,
  playingIndex,
  playingMode,
  onPlayOriginal,
  onPlayReharmonized,
  onStop,
  groove,
  onGrooveChange,
  bpm,
  onBpmChange,
  onInsertBridge,
  keyRoot,
  vibe,
  lang,
  onHoverChord,
  onLeaveHover,
}) => {
  const [selectedBridgeSlot, setSelectedBridgeSlot] = useState<number | null>(null);
  const [hoveredTimelineIdx, setHoveredTimelineIdx] = useState<number | null>(null);

  const openBridgeModal = (idx: number) => {
    setSelectedBridgeSlot(idx);
  };

  const closeBridgeModal = () => {
    setSelectedBridgeSlot(null);
    onLeaveHover?.();
  };

  const bridgeCandidates: BridgeCandidate[] =
    selectedBridgeSlot !== null && selectedBridgeSlot < reharmonizedChords.length - 1
      ? getBridgeCandidates(
          reharmonizedChords[selectedBridgeSlot],
          reharmonizedChords[selectedBridgeSlot + 1],
          keyRoot,
          vibe
        )
      : [];

  return (
    <div className="aurora-card bg-[#FFFFFF]/90 dark:bg-[#1C203B]/80 backdrop-blur-xl border border-[#E5DFD7] dark:border-white/12 rounded-3xl p-4 md:p-6 shadow-sm space-y-4 overflow-visible transition-colors">
      {/* Top playback row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1EB] dark:border-[#22222E] pb-3">
        {/* Playback A/B Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm shadow-md shadow-rose-600/20 glow-rose transition"
            >
              <Square className="w-4 h-4 fill-current" />
              {t('stopPlayback', lang)}
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="pressable flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#181824] hover:bg-[#EDE8E1] dark:hover:bg-[#202030] text-[#1C1917] dark:text-[#E4E4E7] border border-[#E5DFD7] dark:border-[#2E2E42] text-xs md:text-sm font-semibold transition"
              >
                <Play className="w-3.5 h-3.5 text-[#78716C] dark:text-[#9494A6]" />
                {t('playOriginal', lang)}
              </button>
              <button
                onClick={onPlayReharmonized}
                className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] dark:from-[#F59E0B] dark:to-[#D97706] hover:from-[#F59E0B] hover:to-[#D97706] text-white dark:text-black font-extrabold text-xs md:text-sm shadow-md shadow-[#D97706]/20 dark:shadow-[0_0_18px_rgba(245,158,11,0.35)] transition"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {t('playReharmonized', lang)}
              </button>
            </>
          )}

          {isPlaying && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40 animate-pulse glow-amber">
              {playingMode === 'original'
                ? t('playingOriginalBadge', lang)
                : t('playingReharmonizedBadge', lang)}
            </span>
          )}
        </div>

        {/* Groove & BPM Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] dark:text-[#9494A6] font-medium">{t('grooveLabel', lang)}</span>
            <select
              value={groove}
              onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
              className="bg-[#FAF8F5] dark:bg-[#0C0C10] border border-[#E5DFD7] dark:border-[#272736] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F4F6] focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B] cursor-pointer"
            >
              <option value="block" className="dark:bg-[#121217]">{t('grooveBlock', lang)}</option>
              <option value="ballad-arpeggio" className="dark:bg-[#121217]">{t('grooveBallad', lang)}</option>
              <option value="rnb-pulse" className="dark:bg-[#121217]">{t('grooveRnb', lang)}</option>
              <option value="bossa-nova" className="dark:bg-[#121217]">{t('grooveBossa', lang)}</option>
              <option value="dilla-swing" className="dark:bg-[#121217]">Neo-Soul Dilla Swing</option>
              <option value="gospel-walk" className="dark:bg-[#121217]">Gospel Passing Walk</option>
              <option value="cinematic-wave" className="dark:bg-[#121217]">Cinematic Wave</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] dark:text-[#9494A6] font-medium">{t('tempoLabel', lang)}</span>
            <span className="text-xs font-mono font-bold text-[#D97706] dark:text-[#F59E0B] w-8">{bpm}</span>
            <input
              type="range"
              min="50"
              max="140"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-20 md:w-28 accent-[#D97706] dark:accent-[#F59E0B]"
            />
          </div>
        </div>
      </div>

      {/* Chord Timeline Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin pt-1">
        {reharmonizedChords.map((chord, idx) => {
          const isActive = activeChordIndex === idx;
          const isChordPlaying = isPlaying && playingIndex === idx;
          const isBridge = chord.functionRole === 'passing-bridge';
          const original = originalChords[idx]?.symbol || chord.originalSymbol || '';
          const isHovered = hoveredTimelineIdx === idx;

          return (
            <React.Fragment key={chord.id || idx}>
              {/* Chord Card */}
              <div
                onClick={() => onSelectChord(idx)}
                onMouseEnter={() => {
                  setHoveredTimelineIdx(idx);
                  onHoverChord?.(chord, undefined, chord.symbol);
                }}
                onMouseLeave={() => {
                  setHoveredTimelineIdx(null);
                  onLeaveHover?.();
                }}
                className={`pressable relative flex-shrink-0 cursor-pointer rounded-2xl p-3 md:p-4 border transition-all duration-200 select-none min-w-[120px] md:min-w-[140px] ${
                  isChordPlaying
                    ? 'ring-2 ring-[#D97706] dark:ring-[#F59E0B] bg-[#FEF3C7] dark:bg-[#282115] border-[#D97706] dark:border-[#F59E0B] shadow-md glow-amber'
                    : isActive
                    ? 'bg-[#FEF3C7] dark:bg-[#1E1B2A] border-[#D97706] dark:border-[#F59E0B] text-[#1C1917] dark:text-[#F4F4F6] shadow-sm ring-1 ring-[#D97706] dark:ring-[#F59E0B] glow-amber'
                    : 'bg-[#FAF8F5] dark:bg-[#161622] border-[#E5DFD7] dark:border-[#272736] hover:border-[#D1C8BD] dark:hover:border-[#3E3E58] text-[#1C1917] dark:text-[#F4F4F6]'
                }`}
              >
                {/* Hover Mini-Piano Popover */}
                {isHovered && !isActive && (
                  <MiniPianoPopover chord={chord} align="top" className="left-0" />
                )}

                {/* Header: Roman degree + Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-sm font-mono font-bold text-[#D97706] dark:text-[#F59E0B]">
                    {chord.romanDegree}
                  </span>
                  {isBridge && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {t('bridgeBadge', lang)}
                    </span>
                  )}
                </div>

                {/* Main Chord Symbol */}
                <div className="text-xl md:text-2xl font-extrabold text-[#1C1917] dark:text-[#F4F4F6] tracking-tight font-serif">
                  {chord.symbol}
                </div>

                {/* Original comparison */}
                {original && original !== chord.symbol && (
                  <div className="text-xs text-[#A8A29E] dark:text-[#71717A] line-through font-mono">
                    {t('originalComparison', lang)}: {original}
                  </div>
                )}

                {/* Smoothness badge */}
                <div className="mt-2 pt-1.5 border-t border-[#E5DFD7]/60 dark:border-[#272736] flex items-center justify-between text-xs text-[#78716C] dark:text-[#9494A6]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    {t('smoothScore', lang)}
                  </span>
                  <span className="font-mono font-bold text-[#10B981]">
                    {chord.voiceLeading.smoothnessScore}%
                  </span>
                </div>
              </div>

              {/* [+] Bridge Slot between chords */}
              {idx < reharmonizedChords.length - 1 && (
                <button
                  onClick={() => openBridgeModal(idx)}
                  title={t('bridgeTooltip', lang)}
                  className="pressable flex-shrink-0 w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#181824] hover:bg-[#FEF3C7] dark:hover:bg-[#242436] hover:text-[#B45309] dark:hover:text-[#F59E0B] text-[#78716C] dark:text-[#9494A6] border border-[#E5DFD7] dark:border-[#2E2E42] flex items-center justify-center transition shadow-xs text-sm font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Origin-Aware Popover: Bridge Candidates Picker */}
      {selectedBridgeSlot !== null && (
        <div className="p-4 md:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14141C] border border-[#D97706]/40 dark:border-[#F59E0B]/50 shadow-xl space-y-4 popover-spring">
          <div className="flex items-center justify-between border-b border-[#E5DFD7] dark:border-[#272736] pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-[#1C1917] dark:text-[#F4F4F6] flex items-center gap-2 font-serif">
                <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
                {t('bridgeModalTitle', lang)}
              </h3>
              <p className="text-xs text-[#78716C] dark:text-[#9494A6]">
                {t('bridgeModalDesc', lang)}:{' '}
                <span className="text-[#D97706] dark:text-[#F59E0B] font-bold font-mono">
                  {reharmonizedChords[selectedBridgeSlot]?.symbol}
                </span>{' '}
                &rarr;{' '}
                <span className="text-[#D97706] dark:text-[#F59E0B] font-bold font-mono">
                  {reharmonizedChords[selectedBridgeSlot + 1]?.symbol}
                </span>{' '}
                <span className="text-[11px] text-[#A8A29E] dark:text-[#71717A] hidden sm:inline">
                  (Rê chuột vào ứng viên để soi phím đàn bên dưới)
                </span>
              </p>
            </div>
            <button
              onClick={closeBridgeModal}
              className="pressable p-1 rounded-lg text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6] hover:bg-[#EDE8E1] dark:hover:bg-[#202030]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {bridgeCandidates.map((cand) => (
              <div
                key={cand.id}
                onMouseEnter={() => {
                  onHoverChord?.(cand.previewChord, undefined, cand.symbol);
                }}
                onMouseLeave={() => {
                  onLeaveHover?.();
                }}
                className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1A1A26] border border-[#E5DFD7] dark:border-[#2A2A3C] hover:border-[#D97706] dark:hover:border-[#F59E0B] shadow-xs transition flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#D97706] dark:text-[#F59E0B] font-serif">
                        {cand.symbol}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#78716C] dark:text-[#9494A6]">
                        ({cand.romanDegree})
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40">
                      {lang === 'vi' ? cand.techniqueName : cand.techniqueNameEn}
                    </span>
                  </div>

                  <p className="text-xs text-[#57534E] dark:text-[#9494A6] leading-relaxed line-clamp-2">
                    {lang === 'vi' ? cand.whySmooth : cand.whySmoothEn}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onInsertBridge(selectedBridgeSlot, cand);
                      closeBridgeModal();
                    }}
                    className="pressable px-3 py-1.5 rounded-lg bg-[#D97706] dark:bg-[#F59E0B] hover:bg-[#B45309] text-white dark:text-black text-xs font-extrabold transition shadow-xs"
                  >
                    {t('insertBridgeBtn', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
