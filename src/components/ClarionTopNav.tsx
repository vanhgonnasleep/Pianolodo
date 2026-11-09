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
    <nav className="h-16 bg-[#FFFFFF]/95 dark:bg-[#12100E]/95 border-b border-[#E5DFD7] dark:border-[#292524] px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md shadow-xs transition-colors">
      {/* Left: Mobile hamburger + Context pill + Audio Visualizer */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F5F1EB] dark:bg-[#1C1917] text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] font-mono font-bold text-sm flex items-center gap-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B]" />
            Tone {keyRoot} Major
          </span>

          {/* Transpose -1 / +1 */}
          <div className="flex items-center bg-[#FAF8F5] dark:bg-[#1C1917] rounded-lg border border-[#E5DFD7] dark:border-[#292524] p-0.5">
            <button
              onClick={() => onTranspose(-1)}
              title="Dịch giọng xuống 1/2 cung (-1 semitone)"
              className="px-2 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] transition"
            >
              -1
            </button>
            <span className="w-px h-3.5 bg-[#E5DFD7] dark:bg-[#292524]" />
            <button
              onClick={() => onTranspose(1)}
              title="Dịch giọng lên 1/2 cung (+1 semitone)"
              className="px-2 py-0.5 rounded text-sm font-mono font-bold text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] transition"
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
                ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FDE68A] border-[#FDE68A] dark:border-[#D97706]/40'
                : 'bg-[#FAF8F5] dark:bg-[#1C1917] text-[#78716C] dark:text-[#A8A29E] border-[#E5DFD7] dark:border-[#292524] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-xs font-semibold transition"
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>{lang === 'vi' ? 'Share' : 'Share'}</span>
          </button>
        )}

        {/* Theme Toggle (Warm Ivory ↔ Dark OLED) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={
              theme === 'dark'
                ? lang === 'vi' ? 'Đổi sang Giao diện Giấy Ngà Sáng (Warm Ivory)' : 'Switch to Warm Ivory'
                : lang === 'vi' ? 'Đổi sang Chế độ Phòng Thu Đêm (Dark OLED Stage)' : 'Switch to Dark OLED Stage'
            }
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1917] text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#78716C]" />
            )}
          </button>
        )}

        {/* Instrument Switcher */}
        <div className="hidden xl:flex items-center bg-[#FAF8F5] dark:bg-[#1C1917] p-1 rounded-xl border border-[#E5DFD7] dark:border-[#292524] text-xs">
          <button
            onClick={() => onInstrumentChange('grand-piano')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'grand-piano'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white font-bold shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {t('grandPiano', lang)}
          </button>
          <button
            onClick={() => onInstrumentChange('warm-rhodes')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              instrumentTone === 'warm-rhodes'
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white font-bold shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('warmRhodes', lang)}
          </button>
        </div>

        {/* Groove pattern dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#FAF8F5] dark:bg-[#1C1917] px-2 py-1 rounded-xl border border-[#E5DFD7] dark:border-[#292524]">
          <Sliders className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E]" />
          <select
            value={groove}
            onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
            className="bg-transparent text-xs text-[#1C1917] dark:text-[#F5F5F4] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="block">{t('grooveBlock', lang)}</option>
            <option value="ballad-arpeggio">{t('grooveBallad', lang)}</option>
            <option value="rnb-pulse">{t('grooveRnb', lang)}</option>
            <option value="bossa-nova">{t('grooveBossa', lang)}</option>
            <option value="dilla-swing">Neo-Soul Dilla Swing</option>
            <option value="gospel-walk">Gospel Passing Walk</option>
            <option value="cinematic-wave">Cinematic Wave</option>
          </select>
          <span className="text-[11px] font-mono text-[#D97706] dark:text-[#F59E0B] font-bold ml-1">{bpm}</span>
          <input
            type="range"
            min="50"
            max="140"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-14 accent-[#D97706]"
          />
        </div>

        {/* Loop Mode Toggle Button */}
        <button
          onClick={onToggleLoop}
          title={lang === 'vi' ? 'Bật/tắt lặp lại liên tục để luyện tập' : 'Toggle infinite loop for practice'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
            isLooping
              ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#B45309] dark:text-[#FDE68A] border-[#FDE68A] dark:border-[#D97706]/40 shadow-xs'
              : 'bg-[#FAF8F5] dark:bg-[#1C1917] text-[#78716C] dark:text-[#A8A29E] border-[#E5DFD7] dark:border-[#292524] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('stopPlayback', lang)}</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F1EB] dark:bg-[#292524] hover:bg-[#EDE8E1] text-[#44403C] dark:text-[#E7E5E4] border border-[#E5DFD7] dark:border-[#38332E] text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t('playOriginal', lang)}</span>
              </button>
              <button
                onClick={onPlayReharmonized}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-extrabold text-xs shadow-md shadow-[#D97706]/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{t('playReharmonized', lang)}</span>
              </button>
            </>
          )}

          {isPlaying && (
            <span className="hidden 2xl:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#B45309] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#D97706]/40 animate-pulse">
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
