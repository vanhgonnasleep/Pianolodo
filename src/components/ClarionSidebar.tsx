import React from 'react';
import { Language } from '../types/harmony';
import {
  AudioLines,
  BookOpen,
  Headphones,
  LayoutDashboard,
  Sparkles,
  Sliders,
  Globe,
  Music,
  Target,
} from 'lucide-react';

export type NavTabId = 'studio' | 'practice' | 'curriculum' | 'focus' | 'presets' | 'midi';

interface ClarionSidebarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  activeProgressionSummary: {
    rawInput: string;
    keyRoot: string;
    chordCount: number;
    avgSmoothness: number;
  };
}

export const ClarionSidebar: React.FC<ClarionSidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  activeProgressionSummary,
}) => {
  const navItems = [
    {
      id: 'studio' as NavTabId,
      labelVi: 'Studio Hòa Thanh & Voicing',
      labelEn: 'Harmony Studio & Voicing',
      icon: LayoutDashboard,
    },
    {
      id: 'practice' as NavTabId,
      labelVi: 'Phòng Tập & Cảm Âm (Gym)',
      labelEn: 'Practice Gym & Ear Training',
      icon: Target,
    },
    {
      id: 'curriculum' as NavTabId,
      labelVi: 'Giáo Trình 12 Tuyệt Chiêu',
      labelEn: 'Harmony Playbook (12 Rules)',
      icon: BookOpen,
    },
    {
      id: 'focus' as NavTabId,
      labelVi: 'Deep Focus & Neuroacoustics',
      labelEn: 'Deep Focus & Neuroacoustics',
      icon: Headphones,
    },
    {
      id: 'presets' as NavTabId,
      labelVi: 'Kho Vòng Hợp Âm Mẫu',
      labelEn: 'Iconic Presets Library',
      icon: Sparkles,
    },
    {
      id: 'midi' as NavTabId,
      labelVi: 'Cài Đặt Âm Sắc & Web MIDI',
      labelEn: 'Sound Tone & Web MIDI',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-[#F7F4EE] dark:bg-[#0C0A09] border-r border-[#E5DFD7] dark:border-[#292524] flex flex-col justify-between p-5 select-none flex-shrink-0 z-30 shadow-sm transition-colors">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B] shadow-sm">
            <AudioLines className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F5F4] flex items-center gap-1.5 font-serif">
              <span>Pianolodo</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#D97706]/15 dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FDE68A] border border-[#D97706]/25 font-bold">
                3.0
              </span>
            </div>
            <div className="text-xs text-[#78716C] dark:text-[#A8A29E] font-medium">
              {lang === 'vi' ? 'Studio Hòa Thanh & Cảm Âm' : 'Piano Harmony Studio'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Main sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left relative ${
                  isActive
                    ? 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] shadow-sm'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] hover:bg-[#EDE8E1] dark:hover:bg-[#1C1917]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D97706] dark:text-[#F59E0B]' : 'text-[#A8A29E]'}`} />
                <span>{lang === 'vi' ? item.labelVi : item.labelEn}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#D97706] dark:bg-[#F59E0B] ml-auto shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Widget: Active Progression Status */}
      <div className="space-y-4 my-auto pt-6 pb-4">
        <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E5DFD7] dark:border-[#292524] space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
            <span className="flex items-center gap-1.5 text-[#1C1917] dark:text-[#F5F5F4]">
              <Music className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
              {lang === 'vi' ? 'Phiên làm việc' : 'Active Session'}
            </span>
            <span className="font-mono text-[#D97706] dark:text-[#F59E0B] font-bold">
              Tone {activeProgressionSummary.keyRoot}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-[#1C1917] dark:text-[#F5F5F4] truncate bg-[#F7F4EE] dark:bg-[#12100E] px-2.5 py-1.5 rounded-lg border border-[#E5DFD7] dark:border-[#292524]">
            {activeProgressionSummary.rawInput}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#78716C] dark:text-[#A8A29E] pt-1 border-t border-[#F5F1EB] dark:border-[#292524]">
            <span>{activeProgressionSummary.chordCount} {lang === 'vi' ? 'hợp âm' : 'chords'}</span>
            <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold font-mono">
              {lang === 'vi' ? 'Mượt' : 'Smooth'}: {activeProgressionSummary.avgSmoothness}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Local Engine Status & Language Switcher */}
      <div className="space-y-4 pt-4 border-t border-[#E5DFD7] dark:border-[#292524]">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[#78716C] dark:text-[#A8A29E]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot shadow-xs shadow-[#10B981]" />
          <div>
            <div className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              {lang === 'vi' ? 'Lõi Nhạc Lý Sẵn Sàng' : 'Local Engine Online'}
            </div>
            <div className="text-[10px] text-[#A8A29E]">
              {lang === 'vi' ? 'Độ trễ <5ms • 100% Cục bộ' : 'Zero-Egress • <5ms Latency'}
            </div>
          </div>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center bg-[#EDE8E1] dark:bg-[#1C1917] p-1 rounded-xl border border-[#E5DFD7] dark:border-[#292524] text-xs">
          <button
            onClick={() => onToggleLang('vi')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 ${
              lang === 'vi'
                ? 'bg-[#FFFFFF] dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 ${
              lang === 'en'
                ? 'bg-[#FFFFFF] dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>English</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
