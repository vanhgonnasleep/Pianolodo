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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                {t('focusModalTitle', lang)}
              </h2>
              <p className="text-xs text-slate-400">
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
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Section 1: Live Neuroacoustic Soundscape Generator */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs md:text-sm font-bold text-white">
                  {t('activeSoundscape', lang)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                  Tone {keyRoot} Root Anchor
                </span>
              </div>

              <button
                onClick={handleToggleSoundscape}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                  isSoundscapePlaying
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {isSoundscapePlaying ? t('soundscapeOff', lang) : t('soundscapeOn', lang)}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'vi'
                ? 'Âm thanh nền thực thi trực tiếp trên trình duyệt bằng Web Audio DSP: tạo tiếng ồn thư giãn (Vinyl crackle / Brown noise) và đệm Drone nốt chủ để ngăn chặn sao nhãng khi bạn gõ phím hoặc đệm piano.'
                : 'Runs offline in your browser via Web Audio DSP: generates relaxing noise textures (Vinyl / Brown noise) and a root drone to lock you into Flow State.'}
            </p>
          </div>

          {/* Section 2: Cognitive Profile Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {lang === 'vi' ? p.nameVi : p.nameEn}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {p.targetBpm} BPM
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {lang === 'vi' ? p.descriptionVi : p.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Generative AI Prompt Exporter (Suno / Udio / Stable Audio) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs md:text-sm font-bold text-white">
                  {lang === 'vi'
                    ? 'Prompt Sinh Nhạc AI Chuẩn Phòng Thu (Suno v3.5/v4 & Udio)'
                    : 'Production-Grade AI Music Prompt (Suno & Udio)'}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Zero-Vocal Guard
              </div>
            </div>

            {/* Positive Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Prompt (Mô tả nhạc):</span>
                <button
                  onClick={handleCopyPositive}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition"
                >
                  {copiedPositive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{t('copiedBtn', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('copyPromptBtn', lang)}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed select-all">
                {promptData.positivePrompt}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="text-rose-400">Negative Prompt (Loại bỏ triệt để giọng hát):</span>
                <button
                  onClick={handleCopyNegative}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
                >
                  {copiedNegative ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{t('copiedBtn', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép Negative</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-950 text-[11px] text-rose-300/80 font-mono leading-relaxed select-all">
                {promptData.negativePrompt}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic pt-1">
              {lang === 'vi' ? promptData.workflowTipVi : promptData.workflowTipEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
