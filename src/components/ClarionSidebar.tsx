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
} from 'lucide-react';

export type NavTabId = 'studio' | 'curriculum' | 'focus' | 'presets' | 'midi';

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
    <aside className="w-64 bg-[#0d1620] border-r border-[#223547] flex flex-col justify-between p-5 select-none flex-shrink-0 z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173036] border border-[#264e55] flex items-center justify-center text-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/10">
            <AudioLines className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>{lang === 'vi' ? 'Trợ Lý Hòa Thanh' : 'Piano Harmony'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-[#8b9eb0] font-mono">
              CLARION CORE • v2.0
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left relative ${
                  isActive
                    ? 'bg-[#1a2d3b] text-white border border-[#2e4c61] shadow-md shadow-[#0a1219]/40'
                    : 'text-[#8b9eb0] hover:text-[#f0f6fc] hover:bg-[#13202c]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2dd4bf]' : 'text-[#627a8f]'}`} />
                <span>{lang === 'vi' ? item.labelVi : item.labelEn}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] ml-auto shadow-sm shadow-[#2dd4bf]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Widget: Active Progression Status */}
      <div className="space-y-4 my-auto pt-6 pb-4">
        <div className="p-3.5 rounded-2xl bg-[#121f2b] border border-[#223547] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8b9eb0]">
            <span className="flex items-center gap-1.5 text-white">
              <Music className="w-3.5 h-3.5 text-[#f59e0b]" />
              {lang === 'vi' ? 'Phiên làm việc hiện tại' : 'Active Progression'}
            </span>
            <span className="font-mono text-[#f59e0b]">
              Tone {activeProgressionSummary.keyRoot}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-white truncate bg-[#0d1620] px-2.5 py-1.5 rounded-lg border border-[#1b2b3a]">
            {activeProgressionSummary.rawInput}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8b9eb0] pt-1 border-t border-[#1b2b3a]">
            <span>{activeProgressionSummary.chordCount} {lang === 'vi' ? 'hợp âm' : 'chords'}</span>
            <span className="text-[#2dd4bf] font-bold font-mono">
              {lang === 'vi' ? 'Mượt' : 'Smooth'}: {activeProgressionSummary.avgSmoothness}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Local Engine Status & Language Switcher */}
      <div className="space-y-4 pt-4 border-t border-[#1b2b3a]">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[#8b9eb0]">
          <span className="w-2 h-2 rounded-full bg-[#2dd4bf] pulse-dot shadow-sm shadow-[#2dd4bf]" />
          <div>
            <div className="font-semibold text-[#d0dee9]">
              {lang === 'vi' ? 'Lõi Nhạc Lý Offline Sẵn Sàng' : 'Local Deterministic Engine Online'}
            </div>
            <div className="text-[10px] text-[#627a8f]">
              {lang === 'vi' ? 'Độ trễ <5ms • 100% On-Device' : 'Zero-Egress • <5ms Latency'}
            </div>
          </div>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center bg-[#0d1620] p-1 rounded-xl border border-[#223547] text-xs">
          <button
            onClick={() => onToggleLang('vi')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 ${
              lang === 'vi'
                ? 'bg-[#2dd4bf] text-[#042f2e] shadow'
                : 'text-[#8b9eb0] hover:text-white'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 ${
              lang === 'en'
                ? 'bg-[#2dd4bf] text-[#042f2e] shadow'
                : 'text-[#8b9eb0] hover:text-white'
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
