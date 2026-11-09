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

  // New Studio Cockpit Props
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  theoryDepth?: 'beginner' | 'pro';
  onToggleTheoryDepth?: () => void;
  onExportMidi?: () => void;
  onShareUrl?: () => void;
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
  theme = 'light',
  onToggleTheme,
  theoryDepth = 'pro',
  onToggleTheoryDepth,
  onExportMidi,
  onShareUrl,
}) => {
  return (
    <nav className="h-16 bg-[#FFFFFF]/95 dark:bg-[#121217]/95 border-b border-[#E5DFD7] dark:border-[#272736] px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md shadow-xs transition-colors">
      {/* Left: Mobile hamburger + Context pill + Audio Visualizer */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F5F1EB] dark:bg-[#181824] text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F4F4F6]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#161622] text-[#1C1917] dark:text-[#F4F4F6] border border-[#E5DFD7] dark:border-[#272736] font-mono font-bold text-sm flex items-center gap-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
            Tone {keyRoot} Major
          </span>

          {/* Transpose -1 / +1 */}
          <div className="flex items-center bg-[#FAF8F5] dark:bg-[#0C0C10] rounded-lg border border-[#E5DFD7] dark:border-[#272736] p-0.5">
            <button
              onClick={() => onTranspose(-1)}
              title="Dịch giọng xuống 1/2 cung (-1 semitone)"
              className="px-2 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6] hover:bg-[#EDE8E1] dark:hover:bg-[#1E1E2C] transition"
            >
              -1
            </button>
            <span className="w-px h-3.5 bg-[#E5DFD7] dark:border-[#272736]" />
            <button
              onClick={() => onTranspose(1)}
              title="Dịch giọng lên 1/2 cung (+1 semitone)"
              className="px-2 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6] hover:bg-[#EDE8E1] dark:hover:bg-[#1E1E2C] transition"
            >
              +1
            </button>
          </div>
        </div>

        {/* Real-Time Waveform Visualizer */}
        <AudioWaveVisualizer isPlaying={isPlaying} theme={theme} />
      </div>

      {/* Center / Right: Studio Tools & Playback Engine */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theory Depth Toggle (Beginner / Pro) */}
        {onToggleTheoryDepth && (
          <button
            onClick={onToggleTheoryDepth}
            title={
              theoryDepth === 'beginner'
                ? lang === 'vi' ? 'Đang ở Chế độ Người mới (Bấm để sang Pro)' : 'Beginner Mode (Click for Pro)'
                : lang === 'vi' ? 'Đang ở Chế độ Pro Studio' : 'Pro Studio Mode'
            }
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              theoryDepth === 'beginner'
                ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#F59E0B]/40'
                : 'bg-[#FAF8F5] dark:bg-[#161622] text-[#78716C] dark:text-[#9494A6] border-[#E5DFD7] dark:border-[#272736] hover:text-[#1C1917] dark:hover:text-[#F4F4F6]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{theoryDepth === 'beginner' ? (lang === 'vi' ? 'Beginner' : 'Beginner') : 'Pro'}</span>
          </button>
        )}

        {/* Export MIDI Button */}
        {onExportMidi && (
          <button
            onClick={onExportMidi}
            title={lang === 'vi' ? 'Xuất file MIDI (.mid) cho DAW (Ableton / FL Studio / Logic)' : 'Export Standard MIDI (.mid) file'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#161622] text-[#1C1917] dark:text-[#F4F4F6] border border-[#E5DFD7] dark:border-[#272736] hover:bg-[#EDE8E1] dark:hover:bg-[#202030] text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
            <span>.MID</span>
          </button>
        )}

        {/* Share URL Button */}
        {onShareUrl && (
          <button
            onClick={onShareUrl}
            title={lang === 'vi' ? 'Sao chép link chia sẻ vòng hòa thanh' : 'Copy shareable progression link'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#161622] text-[#1C1917] dark:text-[#F4F4F6] border border-[#E5DFD7] dark:border-[#272736] hover:bg-[#EDE8E1] dark:hover:bg-[#202030] text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
            <span>{lang === 'vi' ? 'Share' : 'Share'}</span>
          </button>
        )}

        {/* Theme Toggle (Warm Ivory ↔ Midnight Synth Studio) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={
              theme === 'dark'
                ? lang === 'vi' ? 'Đổi sang Giao diện Giấy Ngà Sáng (Warm Studio)' : 'Switch to Warm Studio'
                : lang === 'vi' ? 'Đổi sang Chế độ Midnight Synth Studio' : 'Switch to Midnight Synth Studio'
            }
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#161622] text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6] border border-[#E5DFD7] dark:border-[#272736] transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#78716C]" />
            )}
          </button>
        )}

        {/* Instrument Switcher */}
        <div className="hidden xl:flex items-center bg-[#FAF8F5] dark:bg-[#0C0C10] p-1 rounded-xl border border-[#E5DFD7] dark:border-[#272736] text-xs">
          <button
            onClick={() => onInstrumentChange('grand-piano')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'grand-piano'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-extrabold shadow-xs dark:shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {t('grandPiano', lang)}
          </button>
          <button
            onClick={() => onInstrumentChange('warm-rhodes')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'warm-rhodes'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-extrabold shadow-xs dark:shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'text-[#78716C] dark:text-[#9494A6] hover:text-[#1C1917] dark:hover:text-[#F4F4F6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('warmRhodes', lang)}
          </button>
        </div>

        {/* Groove pattern dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#FAF8F5] dark:bg-[#0C0C10] px-2.5 py-1 rounded-xl border border-[#E5DFD7] dark:border-[#272736]">
          <Sliders className="w-3.5 h-3.5 text-[#78716C] dark:text-[#9494A6]" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#1C1917] dark:text-[#F4F4F6] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="block" className="dark:bg-[#121217]">{t('grooveBlock', lang)}</option>
            <option value="ballad-arpeggio" className="dark:bg-[#121217]">{t('grooveBallad', lang)}</option>
            <option value="rnb-pulse" className="dark:bg-[#121217]">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova" className="dark:bg-[#121217]">{t('grooveBossa', lang)}</option>
            <option value="dilla-swing" className="dark:bg-[#121217]">Neo-Soul Dilla Swing</option>
            <option value="gospel-walk" className="dark:bg-[#121217]">Gospel Passing Walk</option>
            <option value="cinematic-wave" className="dark:bg-[#121217]">Cinematic Wave</option>
          </select>
          <span className="text-[11px] font-mono text-[#D97706] dark:text-[#F59E0B] font-bold ml-1">{bpm}</span>
          <input
            type="range"
            min="50"
            max="140"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-14 accent-[#D97706] dark:accent-[#F59E0B]"
          />
        </div>

        {/* Loop Mode Toggle Button */}
        <button
          onClick={onToggleLoop}
          title={lang === 'vi' ? 'Bật/tắt lặp lại liên tục để luyện tập' : 'Toggle infinite loop for practice'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
            isLooping
              ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#F59E0B]/40 shadow-xs glow-amber'
              : 'bg-[#FAF8F5] dark:bg-[#161622] text-[#78716C] dark:text-[#9494A6] border-[#E5DFD7] dark:border-[#272736] hover:text-[#1C1917] dark:hover:text-[#F4F4F6]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{lang === 'vi' ? 'Loop' : 'Loop'}</span>
        </button>

        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 glow-rose transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('stopPlayback', lang)}</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="pressable hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F1EB] dark:bg-[#181824] hover:bg-[#EDE8E1] dark:hover:bg-[#202030] text-[#44403C] dark:text-[#E4E4E7] border border-[#E5DFD7] dark:border-[#2E2E42] text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t('playOriginal', lang)}</span>
              </button>
              <button
                onClick={onPlayReharmonized}
                className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] dark:from-[#F59E0B] dark:to-[#D97706] hover:from-[#F59E0B] hover:to-[#D97706] text-white dark:text-black font-extrabold text-xs shadow-md shadow-[#D97706]/20 dark:shadow-[0_0_18px_rgba(245,158,11,0.4)] transition"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{t('playReharmonized', lang)}</span>
              </button>
            </>
          )}

          {isPlaying && (
            <span className="hidden 2xl:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40 animate-pulse glow-amber">
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
