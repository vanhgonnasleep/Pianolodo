import React, { useState } from 'react';
import { FocusProfileId, Language } from '../types/harmony';
import {
  FOCUS_PROFILES,
  focusSoundscapeEngine,
  generateFocusMusicPrompt,
} from '../audio/focusSoundscapeEngine';
import { t } from '../i18n/translations';
import { Headphones, Volume2, Copy, Check, X, ShieldAlert, Sparkles, Power } from 'lucide-react';

interface FocusMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyRoot: string;
  progressionChordsStr: string;
  lang: Language;
}

export const FocusMusicModal: React.FC<FocusMusicModalProps> = ({
  isOpen,
  onClose,
  keyRoot,
  progressionChordsStr,
  lang,
}) => {
  const [activeProfileId, setActiveProfileId] = useState<FocusProfileId>('deep-coding');
  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [copiedPositive, setCopiedPositive] = useState<boolean>(false);
  const [copiedNegative, setCopiedNegative] = useState<boolean>(false);

  if (!isOpen) return null;

  const promptData = generateFocusMusicPrompt(
    activeProfileId,
    keyRoot,
    progressionChordsStr,
    lang
  );

  const handleToggleSoundscape = async () => {
    if (isSoundscapePlaying) {
      focusSoundscapeEngine.stopSoundscape();
      setIsSoundscapePlaying(false);
    } else {
      await focusSoundscapeEngine.startSoundscape(activeProfileId, keyRoot);
      setIsSoundscapePlaying(true);
    }
  };

  const handleSelectProfile = async (id: FocusProfileId) => {
    setActiveProfileId(id);
    if (isSoundscapePlaying) {
      await focusSoundscapeEngine.startSoundscape(id, keyRoot);
    }
  };

  const handleCopyPositive = () => {
    navigator.clipboard.writeText(promptData.positivePrompt);
    setCopiedPositive(true);
    setTimeout(() => setCopiedPositive(false), 2000);
  };

  const handleCopyNegative = () => {
    navigator.clipboard.writeText(promptData.negativePrompt);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F5F1EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shadow-xs text-[#D97706]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#1C1917] flex items-center gap-2">
                {t('focusModalTitle', lang)}
              </h2>
              <p className="text-xs text-[#78716C]">
                {t('focusModalDesc', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              focusSoundscapeEngine.stopSoundscape();
              setIsSoundscapePlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#78716C] hover:text-[#1C1917] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Section 1: Live Neuroacoustic Soundscape Generator */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-indigo-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs md:text-sm font-bold text-[#1C1917]">
                  {t('activeSoundscape', lang)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                  Tone {keyRoot} Root Anchor
                </span>
              </div>

              <button
                onClick={handleToggleSoundscape}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  isSoundscapePlaying
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-[#D97706] hover:bg-[#B45309] text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {isSoundscapePlaying ? t('soundscapeOff', lang) : t('soundscapeOn', lang)}
              </button>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              {lang === 'vi'
                ? 'Âm thanh nền thực thi trực tiếp trên trình duyệt bằng Web Audio DSP: tạo tiếng ồn thư giãn (Vinyl crackle / Brown noise) và đệm Drone nốt chủ để ngăn chặn sao nhãng khi bạn gõ phím hoặc đệm piano.'
                : 'Runs offline in your browser via Web Audio DSP: generates relaxing noise textures (Vinyl / Brown noise) and a root drone to lock you into Flow State.'}
            </p>
          </div>

          {/* Section 2: Cognitive Profile Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              {lang === 'vi' ? 'Chọn Trạng Thái Tư Duy (Cognitive Profile):' : 'Select Cognitive Profile:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FOCUS_PROFILES.map((p) => {
                const isSelected = activeProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#FEF3C7] border-[#D97706] text-[#1C1917] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5DFD7] text-[#78716C] hover:border-[#D1C8BD] hover:text-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#B45309]' : 'text-[#1C1917]'}`}>
                        {lang === 'vi' ? p.nameVi : p.nameEn}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#E5DFD7] text-[#78716C]">
                        {p.targetBpm} BPM
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57534E] line-clamp-2 leading-relaxed">
                      {lang === 'vi' ? p.descriptionVi : p.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Generative AI Prompt Exporter */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD7] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-xs md:text-sm font-bold text-[#1C1917]">
                  {lang === 'vi'
                    ? 'Prompt Sinh Nhạc AI Chuẩn Phòng Thu (Suno v3.5/v4 & Udio)'
                    : 'Production-Grade AI Music Prompt (Suno & Udio)'}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                Zero-Vocal Guard
              </div>
            </div>

            {/* Positive Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
                <span>Prompt (Mô tả nhạc):</span>
                <button
                  onClick={handleCopyPositive}
                  className="flex items-center gap-1 text-[11px] text-[#D97706] hover:text-[#B45309] font-bold transition"
                >
                  {copiedPositive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">{t('copiedBtn', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('copyPromptBtn', lang)}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5DFD7] text-xs text-[#1C1917] font-mono leading-relaxed select-all">
                {promptData.positivePrompt}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
                <span className="text-rose-700 font-bold">Negative Prompt (Loại bỏ triệt để giọng hát):</span>
                <button
                  onClick={handleCopyNegative}
                  className="flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-800 font-bold transition"
                >
                  {copiedNegative ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">{t('copiedBtn', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép Negative</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#FFF1F2] p-2.5 rounded-xl border border-[#FECDD3] text-[11px] text-rose-900 font-mono leading-relaxed select-all">
                {promptData.negativePrompt}
              </div>
            </div>

            <div className="text-[11px] text-[#78716C] italic pt-1">
              {lang === 'vi' ? promptData.workflowTipVi : promptData.workflowTipEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
