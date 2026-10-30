import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { GroovePatternId, Language } from '../types/harmony';
import { t } from '../i18n/translations';
import { Play, Square, Sparkles, Volume2, Sliders, Menu } from 'lucide-react';

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
  lang,
  onToggleMobileMenu,
}) => {
  return (
    <nav className="h-16 bg-[#0f1722] border-b border-[#223547] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
      {/* Left: Mobile hamburger + Context pill */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#162330] text-[#8b9eb0] hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#162432] text-[#f0f6fc] border border-[#273d52] font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            Tone {keyRoot} Major
          </span>

          {/* Transpose -1 / +1 */}
          <div className="flex items-center bg-[#111c27] rounded-lg border border-[#223547] p-0.5">
            <button
              onClick={() => onTranspose(-1)}
              title="Dịch giọng xuống 1/2 cung (-1 semitone)"
              className="px-2 py-0.5 rounded text-xs font-mono font-bold text-[#8b9eb0] hover:text-white hover:bg-[#1a2d3b] transition"
            >
              -1
            </button>
            <span className="w-px h-3 bg-[#223547]" />
            <button
              onClick={() => onTranspose(1)}
              title="Dịch giọng lên 1/2 cung (+1 semitone)"
              className="px-2 py-0.5 rounded text-xs font-mono font-bold text-[#8b9eb0] hover:text-white hover:bg-[#1a2d3b] transition"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* Center / Right: Instrument Switcher & Playback Engine */}
      <div className="flex items-center gap-3">
        {/* Instrument Switcher */}
        <div className="hidden lg:flex items-center bg-[#111c27] p-1 rounded-xl border border-[#223547] text-xs">
          <button
            onClick={() => onInstrumentChange('grand-piano')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              instrumentTone === 'grand-piano'
                ? 'bg-[#2dd4bf] text-[#042f2e] font-bold shadow'
                : 'text-[#8b9eb0] hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {t('grandPiano', lang)}
          </button>
          <button
            onClick={() => onInstrumentChange('warm-rhodes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              instrumentTone === 'warm-rhodes'
                ? 'bg-[#2dd4bf] text-[#042f2e] font-bold shadow'
                : 'text-[#8b9eb0] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('warmRhodes', lang)}
          </button>
        </div>

        {/* Groove pattern dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#111c27] px-2 py-1 rounded-xl border border-[#223547]">
          <Sliders className="w-3.5 h-3.5 text-[#8b9eb0]" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#f0f6fc] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="block" className="bg-[#111c27]">{t('grooveBlock', lang)}</option>
            <option value="ballad-arpeggio" className="bg-[#111c27]">{t('grooveBallad', lang)}</option>
            <option value="rnb-pulse" className="bg-[#111c27]">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova" className="bg-[#111c27]">{t('grooveBossa', lang)}</option>
          </select>
          <span className="text-[11px] font-mono text-[#f59e0b] ml-1">{bpm} BPM</span>
          <input
            type="range"
            min="50"
            max="140"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-16 accent-[#2dd4bf]"
          />
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('stopPlayback', lang)}</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162330] hover:bg-[#1d2d3e] text-[#d4e1ed] border border-[#25394d] text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t('playOriginal', lang)}</span>
              </button>
              <button
                onClick={onPlayReharmonized}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] hover:from-[#5eead4] hover:to-[#2dd4bf] text-[#042f2e] font-extrabold text-xs shadow-lg shadow-[#2dd4bf]/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{t('playReharmonized', lang)}</span>
              </button>
            </>
          )}

          {isPlaying && (
            <span className="hidden xl:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/30 animate-pulse">
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
