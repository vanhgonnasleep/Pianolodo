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
      <div className="p-6 md:p-8 rounded-2xl bg-[#111a24] border border-[#233547] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#142936] border border-[#204359] flex items-center justify-center text-[#38bdf8]">
                <Brain className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
                Clarion Neuroacoustic Flow Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'vi'
                ? 'Kiến Trúc Sư Nhạc Tập Trung & Âm Học Thần Kinh (Focus Music Architect)'
                : 'Focus Music Architect & Neuroacoustic Flow'}
            </h1>
            <p className="text-xs md:text-sm text-[#8b9eb0] leading-relaxed">
              {lang === 'vi'
                ? 'Thiết kế âm cảnh không lời (Zero-Vocal), sóng não Alpha 10Hz và tiếng ồn màu chống xao nhãng. Xuất prompt tối ưu tức thì cho Suno v3.5 & Udio v1.5 dựa trên vòng hợp âm hiện tại.'
                : 'Design zero-vocal background flow soundscapes with 10Hz Alpha entrainment and Brownian noise. Instantly export prompt formulas tuned for Suno and Udio.'}
            </p>
          </div>

          {/* Soundscape Playback Control */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold transition shadow-lg ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-gradient-to-r from-[#2dd4bf] to-[#0d9488] hover:from-[#5eead4] hover:to-[#14b8a6] text-[#042f2e] shadow-[#2dd4bf]/20'
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
            <span className="text-[11px] font-mono text-[#8b9eb0]">
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
              className={`p-5 rounded-2xl text-left border transition flex flex-col justify-between space-y-3 shadow-lg ${
                isSelected
                  ? 'bg-[#152736] border-[#2dd4bf] shadow-[#2dd4bf]/10'
                  : 'bg-[#111a24] border-[#233547] hover:border-[#334d66]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#162230] border border-[#233547] text-[10px] font-mono font-bold text-[#f59e0b]">
                    {profile.targetBpm} BPM
                  </span>
                  {profile.hasAlphaWave && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                      10Hz Alpha
                    </span>
                  )}
                </div>

                <h3 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-[#2dd4bf]' : 'text-white'}`}>
                  {name}
                </h3>

                <p className="text-xs text-[#8b9eb0] leading-relaxed line-clamp-3">
                  {desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1b2b3a] text-[10px] text-[#627a8f] font-mono uppercase">
                Noise: {profile.noiseType}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Prompt Generator Panel */}
      <div className="p-6 rounded-2xl bg-[#111a24] border border-[#233547] space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1b2b3a] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
            <h2 className="text-base font-bold text-white tracking-tight">
              {lang === 'vi'
                ? 'Công Thức Prompt AI Chuẩn Suno v3.5 & Udio v1.5'
                : 'Optimized Generative Prompts (Suno v3.5 & Udio v1.5)'}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#162f36] text-[#2dd4bf] border border-[#2dd4bf]/30 text-xs font-mono font-bold">
            Zero-Vocal Filter Active
          </span>
        </div>

        {/* Positive Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2dd4bf] flex items-center gap-1.5">
              <span>Positive Prompt (Phong cách & Nhạc cụ):</span>
            </span>
            <button
              onClick={() => copyToClipboard(promptData.positivePrompt, true)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#162230] hover:bg-[#1f3347] text-white border border-[#2b4157] font-semibold transition"
            >
              {copiedPositive ? <Check className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPositive ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0f16] border border-[#1b2b3a] font-mono text-xs text-[#d0dee9] leading-relaxed break-words select-all">
            {promptData.positivePrompt}
          </div>
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <span>Negative Prompt (Tuyệt đối loại bỏ giọng hát / Vocals):</span>
            </span>
            <button
              onClick={() => copyToClipboard(promptData.negativePrompt, false)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#162230] hover:bg-[#1f3347] text-white border border-[#2b4157] font-semibold transition"
            >
              {copiedNegative ? <Check className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNegative ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0f16] border border-[#1b2b3a] font-mono text-xs text-rose-300 leading-relaxed break-words select-all">
            {promptData.negativePrompt}
          </div>
        </div>

        {/* Neuroacoustic Engineering Note */}
        <div className="p-4 rounded-xl bg-[#0e1721] border border-[#1b2b3a] text-xs text-[#8b9eb0] space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
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
