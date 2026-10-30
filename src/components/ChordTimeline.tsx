import React, { useState } from 'react';
import { BridgeCandidate, GroovePatternId, Language, VibeId, VoicedChord } from '../types/harmony';
import { getBridgeCandidates } from '../engine/bridgeSuggester';
import { t } from '../i18n/translations';
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
}) => {
  const [selectedBridgeSlot, setSelectedBridgeSlot] = useState<number | null>(null);

  const openBridgeModal = (idx: number) => {
    setSelectedBridgeSlot(idx);
  };

  const closeBridgeModal = () => {
    setSelectedBridgeSlot(null);
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
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-4">
      {/* Top playback row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback A/B Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs md:text-sm shadow-lg shadow-rose-500/20 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              {t('stopPlayback', lang)}
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs md:text-sm font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                {t('playOriginal', lang)}
              </button>
              <button
                onClick={onPlayReharmonized}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                {t('playReharmonized', lang)}
              </button>
            </>
          )}

          {isPlaying && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
              {playingMode === 'original'
                ? t('playingOriginalBadge', lang)
                : t('playingReharmonizedBadge', lang)}
            </span>
          )}
        </div>

        {/* Groove & BPM Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{t('grooveLabel', lang)}</span>
            <select
              value={groove}
              onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="block">{t('grooveBlock', lang)}</option>
              <option value="ballad-arpeggio">{t('grooveBallad', lang)}</option>
              <option value="rnb-pulse">{t('grooveRnb', lang)}</option>
              <option value="bossa-nova">{t('grooveBossa', lang)}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{t('tempoLabel', lang)}</span>
            <span className="text-xs font-mono font-bold text-amber-400 w-8">{bpm}</span>
            <input
              type="range"
              min="50"
              max="140"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-20 md:w-28 accent-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Chord Timeline Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin pt-1">
        {reharmonizedChords.map((chord, idx) => {
          const isActive = activeChordIndex === idx;
          const isChordPlaying = isPlaying && playingIndex === idx;
          const isBridge = chord.functionRole === 'passing-bridge';
          const original = originalChords[idx]?.symbol || chord.originalSymbol || '';

          return (
            <React.Fragment key={chord.id || idx}>
              {/* Chord Card */}
              <div
                onClick={() => onSelectChord(idx)}
                className={`relative flex-shrink-0 cursor-pointer rounded-2xl p-3 md:p-4 border transition-all duration-200 select-none min-w-[120px] md:min-w-[140px] ${
                  isChordPlaying
                    ? 'ring-2 ring-amber-400 bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20'
                    : isActive
                    ? 'bg-slate-800/90 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Header: Roman degree + Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {chord.romanDegree}
                  </span>
                  {isBridge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {t('bridgeBadge', lang)}
                    </span>
                  )}
                </div>

                {/* Main Chord Symbol */}
                <div className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  {chord.symbol}
                </div>

                {/* Original comparison */}
                {original && original !== chord.symbol && (
                  <div className="text-[11px] text-slate-500 line-through">
                    {t('originalComparison', lang)}: {original}
                  </div>
                )}

                {/* Smoothness badge */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {t('smoothScore', lang)}
                  </span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {chord.voiceLeading.smoothnessScore}%
                  </span>
                </div>
              </div>

              {/* [+] Bridge Slot between chords */}
              {idx < reharmonizedChords.length - 1 && (
                <button
                  onClick={() => openBridgeModal(idx)}
                  title={t('bridgeTooltip', lang)}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 border border-slate-700 flex items-center justify-center transition shadow-sm hover:scale-110"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Modal / Popover: Bridge Candidates Picker */}
      {selectedBridgeSlot !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t('bridgeModalTitle', lang)}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('bridgeModalDesc', lang)}:{' '}
                  <span className="text-amber-400 font-bold">
                    {reharmonizedChords[selectedBridgeSlot]?.symbol}
                  </span>{' '}
                  &rarr;{' '}
                  <span className="text-amber-400 font-bold">
                    {reharmonizedChords[selectedBridgeSlot + 1]?.symbol}
                  </span>
                </p>
              </div>
              <button
                onClick={closeBridgeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {bridgeCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-amber-400">
                        {cand.symbol}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        ({cand.romanDegree})
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {lang === 'vi' ? cand.techniqueName : cand.techniqueNameEn}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'vi' ? cand.whySmooth : cand.whySmoothEn}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        onInsertBridge(selectedBridgeSlot, cand);
                        closeBridgeModal();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                    >
                      {t('insertBridgeBtn', lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
