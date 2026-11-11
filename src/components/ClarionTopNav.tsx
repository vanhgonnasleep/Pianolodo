import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { GroovePatternId, Language } from '../types/harmony';
import { t } from '../i18n/translations';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';
import {
  Play,
  Square,
  Sparkles,
  Sliders,
  Menu,
  Repeat,
  Sun,
  Moon,
} from 'lucide-react';

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

  // Studio Cockpit Props
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  theoryDepth?: 'beginner' | 'pro';
  onToggleTheoryDepth?: () => void;
  onExportMidi?: () => void;
  onShareUrl?: () => void;
  onOpenSongAnalyzer?: () => void;
}

export const ClarionTopNav: React.FC<ClarionTopNavProps> = ({
  keyRoot,
  onTranspose,
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
  theme = 'dark',
  onToggleTheme,
}) => {
  return (
    <nav className="h-16 bg-[#FFFFFF]/90 dark:bg-[#16192E]/90 border-b border-[#E5DFD7] dark:border-white/10 px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-xl shadow-xs transition-colors select-none">
      {/* 1. Left Cluster: Tone Key & Transposition & Oscilloscope */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F5F1EB] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Tone Pill */}
        <div className="flex items-center bg-[#FAF8F5] dark:bg-[#15192C] rounded-xl border border-[#E5DFD7] dark:border-white/10 p-1 shadow-xs">
          <div className="px-2.5 py-1 flex items-center gap-1.5 font-mono font-bold text-xs md:text-sm text-[#1C1917] dark:text-[#F8FAFC]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] shrink-0" />
            <span className="whitespace-nowrap">Tone {keyRoot} Major</span>
          </div>

          <span className="w-px h-3.5 bg-[#E5DFD7] dark:bg-white/10 mx-0.5" />

          {/* Transpose buttons */}
          <div className="flex items-center">
            <button
              onClick={() => onTranspose(-1)}
              title={lang === 'vi' ? 'Dịch giọng xuống 1/2 cung (-1)' : 'Transpose down (-1)'}
              className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
            >
              -1
            </button>
            <button
              onClick={() => onTranspose(1)}
              title={lang === 'vi' ? 'Dịch giọng lên 1/2 cung (+1)' : 'Transpose up (+1)'}
              className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
            >
              +1
            </button>
          </div>
        </div>

        {/* Oscilloscope Waveform (Desktop) */}
        <div className="hidden lg:block shrink-0">
          <AudioWaveVisualizer isPlaying={isPlaying} theme={theme} />
        </div>
      </div>

      {/* 2. Center Cluster: Groove Pattern & Tempo & Loop */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {/* Groove Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] dark:bg-[#15192C] px-3 py-1.5 rounded-xl border border-[#E5DFD7] dark:border-white/10 shadow-xs">
          <Sliders className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B] shrink-0" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#1C1917] dark:text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer max-w-[140px] truncate"
            title={lang === 'vi' ? 'Chọn phong cách rải đệm' : 'Select accompaniment groove'}
          >
            <option value="ballad-arpeggio" className="dark:bg-[#16192E]">{t('grooveBallad', lang)}</option>
            <option value="block" className="dark:bg-[#16192E]">{t('grooveBlock', lang)}</option>
            <option value="rnb-pulse" className="dark:bg-[#16192E]">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova" className="dark:bg-[#16192E]">{t('grooveBossa', lang)}</option>
            <option value="dilla-swing" className="dark:bg-[#16192E]">Neo-Soul Dilla</option>
            <option value="gospel-walk" className="dark:bg-[#16192E]">Gospel Walk</option>
            <option value="cinematic-wave" className="dark:bg-[#16192E]">Cinematic Wave</option>
          </select>
        </div>

        {/* Compact Tempo Stepper (85 BPM) */}
        <div className="flex items-center bg-[#FAF8F5] dark:bg-[#15192C] rounded-xl border border-[#E5DFD7] dark:border-white/10 p-0.5 shadow-xs">
          <button
            onClick={() => onBpmChange(Math.max(50, bpm - 5))}
            title="-5 BPM"
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
          >
            -
          </button>
          <span className="px-2 text-xs font-mono font-bold text-[#D97706] dark:text-[#F59E0B]">
            {bpm} <span className="text-[10px] text-[#A8A29E] font-normal">BPM</span>
          </span>
          <button
            onClick={() => onBpmChange(Math.min(160, bpm + 5))}
            title="+5 BPM"
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
          >
            +
          </button>
        </div>

        {/* Loop Toggle */}
        <button
          onClick={onToggleLoop}
          title={lang === 'vi' ? 'Bật/tắt lặp lại liên tục' : 'Toggle infinite loop'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition ${
            isLooping
              ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border-[#D97706] dark:border-[#F59E0B] ring-1 ring-[#D97706] dark:ring-[#F59E0B] glow-amber'
              : 'bg-[#FAF8F5] dark:bg-[#15192C] text-[#78716C] dark:text-[#CBD5E1] border-[#E5DFD7] dark:border-white/10 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Loop</span>
        </button>
      </div>

      {/* 3. Right Cluster: Theme Switcher & Primary Playback CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark / Light Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Đổi sang giao diện sáng' : 'Đổi sang giao diện tối'}
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#15192C] text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 shadow-xs transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#78716C]" />
            )}
          </button>
        )}

        {/* Playback Primary Button */}
        {isPlaying ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onStop}
              className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs md:text-sm shadow-md shadow-rose-600/30 glow-rose transition"
              title="Dừng phát (Phím Space)"
            >
              <Square className="w-4 h-4 fill-current" />
              <span className="whitespace-nowrap">{t('stopPlayback', lang)}</span>
            </button>
            <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40 animate-pulse glow-amber">
              {playingMode === 'original'
                ? t('playingOriginalBadge', lang)
                : t('playingReharmonizedBadge', lang)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Optional Small A/B Original Button */}
            <button
              onClick={onPlayOriginal}
              className="pressable hidden md:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#15192C] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] text-[#78716C] dark:text-[#CBD5E1] border border-[#E5DFD7] dark:border-white/10 text-xs font-semibold transition"
              title={lang === 'vi' ? 'Nghe thử bản gốc cơ bản' : 'Play simple original chords'}
            >
              <Play className="w-3 h-3" />
              <span>Gốc</span>
            </button>

            {/* Flagship Play Button (Amber Gold) */}
            <button
              onClick={onPlayReharmonized}
              className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] hover:from-[#FBBF24] hover:to-[#D97706] text-black font-extrabold text-xs md:text-sm shadow-lg shadow-[#F59E0B]/30 dark:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition"
              title={lang === 'vi' ? 'Phát bản hòa thanh nâng cao (Phím Space)' : 'Play reharmonized progression (Space)'}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="whitespace-nowrap">{t('playReharmonized', lang)}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
