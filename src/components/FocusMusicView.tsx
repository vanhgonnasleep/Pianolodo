import React, { useState } from 'react';
import { FocusProfileId, Language } from '../types/harmony';
import {
  FOCUS_PROFILES,
  focusSoundscapeEngine,
  generateFocusMusicPrompt,
} from '../audio/focusSoundscapeEngine';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Brain,
  ShieldCheck,
} from 'lucide-react';

interface FocusMusicViewProps {
  keyRoot: string;
  progressionChordsStr: string;
  lang: Language;
}

export const FocusMusicView: React.FC<FocusMusicViewProps> = ({
  keyRoot,
  progressionChordsStr,
  lang,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<FocusProfileId>('deep-coding');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const promptData = generateFocusMusicPrompt(
    selectedProfileId,
    keyRoot,
    progressionChordsStr || 'C - Am7 - Dm7 - G7',
    lang
  );

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      focusSoundscapeEngine.stopSoundscape();
      setIsPlayingAudio(false);
    } else {
      await focusSoundscapeEngine.startSoundscape(selectedProfileId, keyRoot);
      setIsPlayingAudio(true);
    }
  };

  const handleSelectProfile = (id: FocusProfileId) => {
    setSelectedProfileId(id);
    if (isPlayingAudio) {
      focusSoundscapeEngine.stopSoundscape();
      focusSoundscapeEngine.startSoundscape(id, keyRoot);
    }
  };

  const copyToClipboard = async (text: string, isPos: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPos) {
        setCopiedPositive(true);
        setTimeout(() => setCopiedPositive(false), 2000);
      } else {
        setCopiedNegative(true);
        setTimeout(() => setCopiedNegative(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                <Brain className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                Pianolodo Neuroacoustic Flow Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              {lang === 'vi'
                ? 'Kiến Trúc Sư Nhạc Tập Trung & Âm Học Thần Kinh (Focus Music Architect)'
                : 'Focus Music Architect & Neuroacoustic Flow'}
            </h1>
            <p className="text-xs md:text-sm text-[#78716C] leading-relaxed">
              {lang === 'vi'
                ? 'Thiết kế âm cảnh không lời (Zero-Vocal), sóng não Alpha 10Hz và tiếng ồn màu chống xao nhãng. Xuất prompt tối ưu tức thì cho Suno v3.5 & Udio v1.5 dựa trên vòng hợp âm hiện tại.'
                : 'Design zero-vocal background flow soundscapes with 10Hz Alpha entrainment and Brownian noise. Instantly export prompt formulas tuned for Suno and Udio.'}
            </p>
          </div>

          {/* Soundscape Playback Control */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold transition shadow-sm ${
                isPlayingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white shadow-md shadow-[#D97706]/20'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Dừng Soundscape Nền' : 'Stop Ambient Layer'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Bật Soundscape Nền (Web Audio)' : 'Play Ambient Layer'}</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-[#78716C]">
              {lang === 'vi' ? 'Tần số gốc' : 'Root Drone'}: Tone {keyRoot}2
            </span>
          </div>
        </div>
      </div>

      {/* Profile Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FOCUS_PROFILES.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          const name = lang === 'vi' ? profile.nameVi : profile.nameEn;
          const desc = lang === 'vi' ? profile.descriptionVi : profile.descriptionEn;

          return (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
              className={`p-5 rounded-2xl text-left border transition flex flex-col justify-between space-y-3 shadow-xs ${
                isSelected
                  ? 'bg-[#FEF3C7]/40 border-[#D97706] shadow-sm'
                  : 'bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#D1C8BD]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5DFD7] text-[10px] font-mono font-bold text-[#D97706]">
                    {profile.targetBpm} BPM
                  </span>
                  {profile.hasAlphaWave && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                      10Hz Alpha
                    </span>
                  )}
                </div>

                <h3 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-[#B45309]' : 'text-[#1C1917]'}`}>
                  {name}
                </h3>

                <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                  {desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F5F1EB] text-[10px] text-[#A8A29E] font-mono uppercase">
                Noise: {profile.noiseType}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Prompt Generator Panel */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F5F1EB] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <h2 className="text-base font-bold text-[#1C1917] tracking-tight">
              {lang === 'vi'
                ? 'Công Thức Prompt AI Chuẩn Suno v3.5 & Udio v1.5'
                : 'Optimized Generative Prompts (Suno v3.5 & Udio v1.5)'}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-xs font-mono font-bold">
            Zero-Vocal Filter Active
          </span>
        </div>

        {/* Positive Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#D97706] flex items-center gap-1.5">
              <span>Positive Prompt (Phong cách & Nhạc cụ):</span>
            </span>
            <button
              onClick={() => copyToClipboard(promptData.positivePrompt, true)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border border-[#E5DFD7] font-semibold transition"
            >
              {copiedPositive ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#78716C]" />}
              <span>{copiedPositive ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] font-mono text-xs text-[#1C1917] leading-relaxed break-words select-all">
            {promptData.positivePrompt}
          </div>
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-700 flex items-center gap-1.5">
              <span>Negative Prompt (Tuyệt đối loại bỏ giọng hát / Vocals):</span>
            </span>
            <button
              onClick={() => copyToClipboard(promptData.negativePrompt, false)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border border-[#E5DFD7] font-semibold transition"
            >
              {copiedNegative ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#78716C]" />}
              <span>{copiedNegative ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] font-mono text-xs text-rose-800 leading-relaxed break-words select-all">
            {promptData.negativePrompt}
          </div>
        </div>

        {/* Neuroacoustic Engineering Note */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] text-xs text-[#78716C] space-y-1">
          <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>{lang === 'vi' ? 'Cơ sở khoa học âm học tập trung:' : 'Neuroacoustic Rationale:'}</span>
          </div>
          <p className="leading-relaxed">
            {lang === 'vi' ? promptData.workflowTipVi : promptData.workflowTipEn}
          </p>
        </div>
      </div>
    </div>
  );
};
