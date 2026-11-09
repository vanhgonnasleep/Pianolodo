import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { GroovePatternId, Language } from '../types/harmony';
import { t } from '../i18n/translations';
import { Play, Square, Sparkles, Volume2, Sliders, Menu, Repeat } from 'lucide-react';

interface ClarionTopNavProps {
  keyRoot: string;
  onTranspose: (semi: number) => void;
  instrumentTone: InstrumentToneType;
  onInstrumentChange: (tone: InstrumentToneType) => void;
  isPlaying: boolean;
  playingMode: 'original' | 'reharmonized' | null;
  onPlayOriginal: () => void;
  onPlayReharmonized: () => void;
  onStop: () => void;
  groove: GroovePatternId;
  onGrooveChange: (g: GroovePatternId) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  lang: Language;
  onToggleMobileMenu?: () => void;
}

export const ClarionTopNav: React.FC<ClarionTopNavProps> = ({
  keyRoot,
  onTranspose,
  instrumentTone,
  onInstrumentChange,
  isPlaying,
  playingMode,
  onPlayOriginal,
  onPlayReharmonized,
  onStop,
  groove,
  onGrooveChange,
  bpm,
  onBpmChange,
  isLooping,
  onToggleLoop,
  lang,
  onToggleMobileMenu,
}) => {
  return (
    <nav className="h-16 bg-[#FFFFFF]/95 border-b border-[#E5DFD7] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md shadow-xs">
      {/* Left: Mobile hamburger + Context pill */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F5F1EB] text-[#78716C] hover:text-[#1C1917]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#FAF8F5] text-[#1C1917] border border-[#E5DFD7] font-mono font-bold text-sm flex items-center gap-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            Tone {keyRoot} Major
          </span>

          {/* Transpose -1 / +1 */}
          <div className="flex items-center bg-[#FAF8F5] rounded-lg border border-[#E5DFD7] p-0.5">
            <button
              onClick={() => onTranspose(-1)}
              title="Dịch giọng xuống 1/2 cung (-1 semitone)"
              className="px-2.5 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E1] transition"
            >
              -1
            </button>
            <span className="w-px h-3.5 bg-[#E5DFD7]" />
            <button
              onClick={() => onTranspose(1)}
              title="Dịch giọng lên 1/2 cung (+1 semitone)"
              className="px-2.5 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E1] transition"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* Center / Right: Instrument Switcher & Playback Engine */}
      <div className="flex items-center gap-3">
        {/* Instrument Switcher */}
        <div className="hidden lg:flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD7] text-sm">
          <button
            onClick={() => onInstrumentChange('grand-piano')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              instrumentTone === 'grand-piano'
                ? 'bg-[#D97706] text-white font-bold shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {t('grandPiano', lang)}
          </button>
          <button
            onClick={() => onInstrumentChange('warm-rhodes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              instrumentTone === 'warm-rhodes'
                ? 'bg-[#D97706] text-white font-bold shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t('warmRhodes', lang)}
          </button>
        </div>

        {/* Groove pattern dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#E5DFD7]">
          <Sliders className="w-3.5 h-3.5 text-[#78716C]" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#1C1917] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="block">{t('grooveBlock', lang)}</option>
            <option value="ballad-arpeggio">{t('grooveBallad', lang)}</option>
            <option value="rnb-pulse">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova">{t('grooveBossa', lang)}</option>
          </select>
          <span className="text-[11px] font-mono text-[#D97706] font-bold ml-1">{bpm} BPM</span>
          <input
            type="range"
            min="50"
            max="140"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-16 accent-[#D97706]"
          />
        </div>

        {/* Loop Mode Toggle Button */}
        <button
          onClick={onToggleLoop}
          title={lang === 'vi' ? 'Bật/tắt lặp lại liên tục để luyện tập' : 'Toggle infinite loop for practice'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
            isLooping
              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] shadow-xs'
              : 'bg-[#FAF8F5] text-[#78716C] border-[#E5DFD7] hover:text-[#1C1917]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{lang === 'vi' ? 'Loop' : 'Loop'}</span>
        </button>

        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('stopPlayback', lang)}</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F1EB] hover:bg-[#EDE8E1] text-[#44403C] border border-[#E5DFD7] text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t('playOriginal', lang)}</span>
              </button>
              <button
                onClick={onPlayReharmonized}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-extrabold text-xs shadow-md shadow-[#D97706]/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{t('playReharmonized', lang)}</span>
              </button>
            </>
          )}

          {isPlaying && (
            <span className="hidden xl:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse">
              {playingMode === 'original'
                ? t('playingOriginalBadge', lang)
                : t('playingReharmonizedBadge', lang)}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};
