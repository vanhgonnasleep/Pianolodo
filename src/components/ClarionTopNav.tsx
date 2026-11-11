import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { GroovePatternId, Language } from '../types/harmony';
import { t } from '../i18n/translations';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';
import {
  Play,
  Square,
  Sparkles,
  Volume2,
  Sliders,
  Menu,
  Repeat,
  Sun,
  Moon,
  Download,
  Share2,
  GraduationCap,
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
  theme = 'dark',
  onToggleTheme,
  theoryDepth = 'pro',
  onToggleTheoryDepth,
  onExportMidi,
  onShareUrl,
  onOpenSongAnalyzer,
}) => {
  return (
    <nav className="h-16 bg-[#FFFFFF]/90 dark:bg-[#16192E]/90 border-b border-[#E5DFD7] dark:border-white/10 px-3 md:px-5 flex items-center justify-between gap-2 md:gap-3 sticky top-0 z-20 backdrop-blur-xl shadow-xs transition-colors">
      {/* Left: Mobile hamburger + Context pill + Audio Visualizer */}
      <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F5F1EB] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-xl bg-[#FAF8F5] dark:bg-[#15192C] text-[#1C1917] dark:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 font-mono font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] shrink-0" />
            <span>Tone {keyRoot}</span>
          </span>

          {/* Transpose -1 / +1 */}
          <div className="flex items-center bg-[#FAF8F5] dark:bg-[#15192C] rounded-xl border border-[#E5DFD7] dark:border-white/10 p-0.5 shrink-0">
            <button
              onClick={() => onTranspose(-1)}
              title="Dịch giọng xuống 1/2 cung (-1 semitone)"
              className="px-1.5 py-0.5 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
            >
              -1
            </button>
            <span className="w-px h-3 bg-[#E5DFD7] dark:bg-white/10" />
            <button
              onClick={() => onTranspose(1)}
              title="Dịch giọng lên 1/2 cung (+1 semitone)"
              className="px-1.5 py-0.5 rounded-lg text-xs font-mono font-bold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] transition"
            >
              +1
            </button>
          </div>
        </div>

        {/* Prominent Audio Input / Song Analyzer Pill Button */}
        {onOpenSongAnalyzer && (
          <button
            onClick={onOpenSongAnalyzer}
            className="pressable flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#2563EB]/20 via-[#38BDF8]/20 to-[#A78BFA]/20 hover:from-[#2563EB]/35 hover:via-[#38BDF8]/35 hover:to-[#A78BFA]/35 border border-[#38BDF8]/50 text-[#0284C7] dark:text-[#38BDF8] text-xs font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)] transition shrink-0"
            title={lang === 'vi' ? 'Input bài hát hoặc ngân nga Mic để AI tự động dò hợp âm' : 'Input song or hum via Mic for AI chord detection'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 animate-pulse" />
            <span className="whitespace-nowrap font-extrabold">{lang === 'vi' ? '🎧 Tách Nhạc / Mic' : '🎧 Song -> Chords'}</span>
          </button>
        )}

        {/* Real-Time Waveform Visualizer (Shown on wide screens) */}
        <div className="hidden 2xl:block shrink-0">
          <AudioWaveVisualizer isPlaying={isPlaying} theme={theme} />
        </div>
      </div>

      {/* Middle: Compact Studio Utility Controls (Hides gracefully on narrow screens to prevent overflow) */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        {/* Theory Depth Toggle */}
        {onToggleTheoryDepth && (
          <button
            onClick={onToggleTheoryDepth}
            title={
              theoryDepth === 'beginner'
                ? lang === 'vi' ? 'Đang ở Chế độ Người mới' : 'Beginner Mode'
                : lang === 'vi' ? 'Đang ở Chế độ Pro Studio' : 'Pro Studio Mode'
            }
            className={`hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-semibold shrink-0 transition ${
              theoryDepth === 'beginner'
                ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#F59E0B]/40'
                : 'bg-[#FAF8F5] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] border-[#E5DFD7] dark:border-white/10 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{theoryDepth === 'beginner' ? 'Beginner' : 'Pro'}</span>
          </button>
        )}

        {/* Export MIDI Button */}
        {onExportMidi && (
          <button
            onClick={onExportMidi}
            title={lang === 'vi' ? 'Xuất file MIDI (.mid)' : 'Export Standard MIDI (.mid)'}
            className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-[#FAF8F5] dark:bg-[#1C203B] text-[#1C1917] dark:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 hover:bg-[#EDE8E1] dark:hover:bg-[#232946] text-xs font-semibold shrink-0 transition"
          >
            <Download className="w-3 h-3 text-[#D97706] dark:text-[#F59E0B]" />
            <span>.MID</span>
          </button>
        )}

        {/* Share URL Button */}
        {onShareUrl && (
          <button
            onClick={onShareUrl}
            title={lang === 'vi' ? 'Sao chép link chia sẻ' : 'Copy shareable link'}
            className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-[#FAF8F5] dark:bg-[#1C203B] text-[#1C1917] dark:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 hover:bg-[#EDE8E1] dark:hover:bg-[#232946] text-xs font-semibold shrink-0 transition"
          >
            <Share2 className="w-3 h-3 text-[#2563EB] dark:text-[#38BDF8]" />
            <span>Share</span>
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Đổi sang giao diện sáng' : 'Đổi sang giao diện Twilight Aurora'}
            className="p-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 shrink-0 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#78716C]" />
            )}
          </button>
        )}

        {/* Compact Instrument Switcher (Grand / Rhodes) */}
        <div className="hidden 2xl:flex items-center bg-[#FAF8F5] dark:bg-[#15192C] p-0.5 rounded-xl border border-[#E5DFD7] dark:border-white/10 text-xs shrink-0">
          <button
            onClick={() => onInstrumentChange('grand-piano')}
            className={`px-2 py-0.5 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'grand-piano'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-extrabold shadow-xs'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span className="text-[11px]">Grand</span>
          </button>
          <button
            onClick={() => onInstrumentChange('warm-rhodes')}
            className={`px-2 py-0.5 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'warm-rhodes'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-extrabold shadow-xs'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-[11px]">Rhodes</span>
          </button>
        </div>

        {/* Groove Pattern Selector */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#15192C] px-2 py-1 rounded-xl border border-[#E5DFD7] dark:border-white/10 shrink-0">
          <Sliders className="w-3 h-3 text-[#78716C] dark:text-[#CBD5E1] shrink-0" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#1C1917] dark:text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[140px] truncate"
          >
            <option value="block" className="dark:bg-[#16192E]">{t('grooveBlock', lang)}</option>
            <option value="ballad-arpeggio" className="dark:bg-[#16192E]">{t('grooveBallad', lang)}</option>
            <option value="rnb-pulse" className="dark:bg-[#16192E]">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova" className="dark:bg-[#16192E]">{t('grooveBossa', lang)}</option>
            <option value="dilla-swing" className="dark:bg-[#16192E]">Neo-Soul Dilla</option>
            <option value="gospel-walk" className="dark:bg-[#16192E]">Gospel Walk</option>
            <option value="cinematic-wave" className="dark:bg-[#16192E]">Cinematic Wave</option>
          </select>
          <span className="text-[10px] font-mono text-[#D97706] dark:text-[#F59E0B] font-bold shrink-0">{bpm}</span>
          <input
            type="range"
            min="50"
            max="140"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="hidden xl:inline-block w-10 accent-[#D97706] dark:accent-[#F59E0B]"
          />
        </div>
      </div>

      {/* Right: Loop Mode + Playback Primary CTA (ALWAYS 100% VISIBLE & PINNED TO THE RIGHT) */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0 ml-auto z-10">
        {/* Loop Mode Toggle Button */}
        <button
          onClick={onToggleLoop}
          title={lang === 'vi' ? 'Bật/tắt lặp lại liên tục' : 'Toggle loop'}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition ${
            isLooping
              ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#F59E0B]/40 shadow-xs glow-amber'
              : 'bg-[#FAF8F5] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] border-[#E5DFD7] dark:border-white/10 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Loop</span>
        </button>

        {/* Playback Buttons - Guaranteed always visible! */}
        {isPlaying ? (
          <button
            onClick={onStop}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 glow-rose transition shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{t('stopPlayback', lang)}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPlayOriginal}
              className="pressable hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F1EB] dark:bg-[#1C203B] hover:bg-[#EDE8E1] dark:hover:bg-[#232946] text-[#44403C] dark:text-[#CBD5E1] border border-[#E5DFD7] dark:border-white/10 text-xs font-semibold transition shrink-0"
              title="Phát vòng hợp âm gốc"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{t('playOriginal', lang)}</span>
            </button>
            <button
              onClick={onPlayReharmonized}
              className="pressable flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] hover:from-[#FBBF24] hover:to-[#D97706] text-black font-extrabold text-xs shadow-md shadow-[#F59E0B]/30 dark:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition shrink-0"
              title="Phát bản hòa thanh nâng cao"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="whitespace-nowrap">{t('playReharmonized', lang)}</span>
            </button>
          </div>
        )}

        {isPlaying && (
          <span className="hidden 2xl:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40 animate-pulse glow-amber shrink-0">
            {playingMode === 'original'
              ? t('playingOriginalBadge', lang)
              : t('playingReharmonizedBadge', lang)}
          </span>
        )}
      </div>
    </nav>
  );
};
