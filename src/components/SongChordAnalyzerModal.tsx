import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Mic,
  Music,
  Sparkles,
  Square,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Sliders,
  FileAudio,
} from 'lucide-react';
import { Language, VibeId } from '../types/harmony';
import {
  SongAnalysisResult,
  analyzeAudioFile,
  recordMicrophoneAndAnalyze,
  createInstantDemoTrackAndAnalyze,
} from '../core/audioChordAnalyzer';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { buildProgressionState } from '../engine/reharmonizer';

interface SongChordAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProgression: (formula: string, keyRoot: string, vibe: VibeId) => void;
  lang: Language;
}

type InputTab = 'upload' | 'mic' | 'demo';

export const SongChordAnalyzerModal: React.FC<SongChordAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyProgression,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>('demo');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<SongAnalysisResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Mic state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micCountdown, setMicCountdown] = useState<number>(6);

  // Playback state
  const [isPlayingAudition, setIsPlayingAudition] = useState<boolean>(false);
  const [auditioningOptionId, setAuditioningOptionId] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsAnalyzing(true);
    setProgressPct(10);

    try {
      const result = await analyzeAudioFile(file, (pct) => setProgressPct(pct));
      setAnalysisResult(result);
    } catch {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Mic Recording
  const handleStartMic = async () => {
    setIsRecording(true);
    setMicCountdown(6);
    setIsAnalyzing(true);
    setProgressPct(15);

    try {
      const result = await recordMicrophoneAndAnalyze(
        6,
        (remaining) => setMicCountdown(remaining),
        (pct) => setProgressPct(pct)
      );
      setAnalysisResult(result);
    } catch {
      // Fallback
    } finally {
      setIsRecording(false);
      setIsAnalyzing(false);
    }
  };

  // Handle Instant Demo Generation
  const handleInstantDemo = async () => {
    setIsAnalyzing(true);
    setProgressPct(20);

    try {
      const result = await createInstantDemoTrackAndAnalyze((pct) => setProgressPct(pct));
      setAnalysisResult(result);
      setSelectedFileName('Bản Demo Mẫu (4-Bar Ballad in C)');
    } catch {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Audition an Accompaniment Option
  const handleAudition = async (optionId: string, formula: string, keyRoot: string) => {
    if (isPlayingAudition && auditioningOptionId === optionId) {
      pianoAudioEngine.stopPlayback();
      setIsPlayingAudition(false);
      setAuditioningOptionId(null);
      return;
    }

    pianoAudioEngine.stopPlayback();
    setIsPlayingAudition(true);
    setAuditioningOptionId(optionId);

    const vibeMap: Record<string, VibeId> = {
      'pop-ballad': 'pop-ballad',
      'rnb-neosoul': 'rnb-neosoul',
      'jazz-lounge': 'jazz-bossa',
    };
    const targetVibe = vibeMap[optionId] || 'pop-ballad';

    const tempState = buildProgressionState(formula, targetVibe, 2, keyRoot.replace('m', ''));

    await pianoAudioEngine.playProgression(
      tempState.reharmonizedChords,
      'ballad-arpeggio',
      analysisResult?.detectedBpm || 85,
      (idx) => setActiveSegmentIndex(idx),
      () => {
        setIsPlayingAudition(false);
        setAuditioningOptionId(null);
      },
      false
    );
  };

  const handleApply = (formula: string, keyRoot: string, optionId: string) => {
    pianoAudioEngine.stopPlayback();
    const vibeMap: Record<string, VibeId> = {
      'pop-ballad': 'pop-ballad',
      'rnb-neosoul': 'rnb-neosoul',
      'jazz-lounge': 'jazz-bossa',
    };
    onApplyProgression(formula, keyRoot.replace('m', ''), vibeMap[optionId] || 'pop-ballad');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#16192E]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(10,14,28,0.7),inset_0_1px_0_rgba(255,255,255,0.16)] text-[#F8FAFC] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10 bg-[#1C203B]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#38BDF8]/20 to-[#818CF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2 font-serif">
                <span>{lang === 'vi' ? 'Trợ Lý Tách Hợp Âm Từ Nhạc / Mic' : 'Audio & Melody-to-Chord Analyzer'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
                  AI DSP • Web Audio
                </span>
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {lang === 'vi'
                  ? 'Phân tích vòng hòa thanh tự động từ file nhạc, giọng hát Micro hoặc giai điệu mẫu'
                  : 'Automated harmonic extraction & 3 reharmonized accompaniment styles'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              pianoAudioEngine.stopPlayback();
              onClose();
            }}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Input Method Segmented Control */}
          <div className="flex flex-wrap items-center bg-[#15192C]/80 p-1.5 rounded-2xl border border-white/10 gap-1.5">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Giai Điệu Mẫu (Demo)' : 'Instant Demo Track'}</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white font-extrabold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Tải File Nhạc (.MP3/.WAV/.MID)' : 'Upload Audio File'}</span>
            </button>

            <button
              onClick={() => setActiveTab('mic')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'mic'
                  ? 'bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-extrabold shadow-[0_0_15px_rgba(167,139,250,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Thu Âm Giọng Hát / Đàn (Mic)' : 'Live Mic Record'}</span>
            </button>
          </div>

          {/* TAB 1: INSTANT DEMO TRACK */}
          {activeTab === 'demo' && (
            <div className="p-6 rounded-2xl bg-[#1C203B]/70 border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <Music className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  {lang === 'vi' ? 'Thử Ngay Không Cần File Sẵn Có' : 'Instant Demo Audio Synthesizer'}
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'vi'
                    ? 'Hệ thống sẽ tự động tổng hợp đoạn audio 4 hợp âm mẫu qua Web Audio API và chạy giải thuật phân tích phổ Chromagram ngay lập tức.'
                    : 'Synthesize a 4-bar piano audio snippet in real time and extract its chord progression.'}
                </p>
              </div>

              <button
                onClick={handleInstantDemo}
                disabled={isAnalyzing}
                className="pressable px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition disabled:opacity-50"
              >
                {isAnalyzing
                  ? lang === 'vi' ? 'Đang Phân Tích...' : 'Analyzing...'
                  : lang === 'vi' ? '✨ Thử Ngay Bản Demo (Instant Demo)' : '✨ Analyze Instant Demo'}
              </button>
            </div>
          )}

          {/* TAB 2: UPLOAD AUDIO FILE */}
          {activeTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#38BDF8]/60 bg-[#1C203B]/50 hover:bg-[#1C203B]/80 text-center space-y-3 cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.ogg,.m4a,.mid"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#F8FAFC]">
                  {selectedFileName || (lang === 'vi' ? 'Kéo thả hoặc Bấm để tải file nhạc' : 'Click or drag audio file here')}
                </div>
                <div className="text-xs text-[#94A3B8]">
                  Hỗ trợ định dạng .MP3, .WAV, .OGG, .M4A, .MID (Tối đa 15MB)
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MICROPHONE RECORDING */}
          {activeTab === 'mic' && (
            <div className="p-6 rounded-2xl bg-[#1C203B]/70 border border-white/10 text-center space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition ${
                  isRecording
                    ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                    : 'bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.25)]'
                }`}
              >
                <Mic className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  {isRecording
                    ? `${lang === 'vi' ? 'Đang lắng nghe...' : 'Listening...'} (${micCountdown}s)`
                    : lang === 'vi' ? 'Ngân Nga Hoặc Chơi Đàn Trước Micro' : 'Sing, Hum or Play Your Instrument'}
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'vi'
                    ? 'Hãy hát hoặc gõ một đoạn giai điệu ngắn 6 giây, thuật toán sẽ bóc tách cao độ và tìm hòa âm phù hợp nhất.'
                    : 'Record 6 seconds of melody and let the AI DSP extract root pitches and chords.'}
                </p>
              </div>

              <button
                onClick={handleStartMic}
                disabled={isRecording || isAnalyzing}
                className="pressable px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#C4B5FD] hover:to-[#8B5CF6] text-white font-extrabold text-sm shadow-[0_0_20px_rgba(167,139,250,0.4)] transition disabled:opacity-50"
              >
                {isRecording
                  ? lang === 'vi' ? `Đang Thu Âm (${micCountdown}s)...` : `Recording (${micCountdown}s)...`
                  : lang === 'vi' ? '🎙️ Bắt Đầu Thu Âm (6 Giây)' : '🎙️ Start Recording (6s)'}
              </button>
            </div>
          )}

          {/* Loading / Progress Indicator */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#15192C] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#CBD5E1]">
                <span>{lang === 'vi' ? 'Đang giải mã âm thanh & phân tích Pitch Class Profile...' : 'Decoding audio & extracting chromagram...'}</span>
                <span className="font-mono text-[#38BDF8]">{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#38BDF8] via-[#A78BFA] to-[#F59E0B] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* RESULTS DISPLAY */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-fadeIn">
              {/* Metrics Summary Strip */}
              <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-white/12 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 font-mono font-bold">
                    Tone {analysisResult.detectedKey}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-mono font-bold">
                    {analysisResult.detectedBpm} BPM
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-mono font-bold">
                    {analysisResult.confidence}% {lang === 'vi' ? 'Độ tin cậy' : 'Confidence'}
                  </span>
                </div>

                <div className="text-xs text-[#94A3B8] font-mono">
                  {lang === 'vi' ? 'Chuỗi gốc' : 'Detected'}:{' '}
                  <span className="font-bold text-[#F8FAFC]">{analysisResult.rawFormula}</span>
                </div>
              </div>

              {/* Karaoke Waveform Chord Sync Strip */}
              <div className="p-4 rounded-2xl bg-[#15192C]/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#CBD5E1]">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{lang === 'vi' ? 'Tiến Trình Hợp Âm Theo Thời Gian (Chord Timeline Strip)' : 'Synchronized Chord Timeline'}</span>
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    {analysisResult.segments.length} {lang === 'vi' ? 'phân đoạn ô nhịp' : 'measure segments'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {analysisResult.segments.map((seg, idx) => {
                    const isActive = isPlayingAudition && activeSegmentIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition text-center space-y-1 ${
                          isActive
                            ? 'bg-[#F59E0B]/25 border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-102'
                            : 'bg-[#1C203B]/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-[#94A3B8]">
                          {seg.startTime}s - {seg.endTime}s
                        </div>
                        <div className="text-base font-extrabold text-[#F8FAFC] font-serif">
                          {seg.chordSymbol}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-[#38BDF8]">
                          Bậc {seg.romanDegree}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 Reharmonized Accompaniment Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>{lang === 'vi' ? '3 Phương Án Phối Khí & Hòa Thanh Nâng Cấp' : '3 Reharmonized Accompaniment Options'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analysisResult.accompaniments.map((opt) => {
                    const isPlayingThis = isPlayingAudition && auditioningOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className="p-4 rounded-2xl bg-[#1C203B]/80 border border-white/12 hover:border-[#38BDF8]/50 transition flex flex-col justify-between space-y-4 shadow-sm group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
                              {opt.styleBadge}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-[#F8FAFC] font-serif">
                            {lang === 'vi' ? opt.titleVi : opt.titleEn}
                          </h5>

                          <p className="text-xs text-[#CBD5E1] line-clamp-2">
                            {lang === 'vi' ? opt.descriptionVi : opt.descriptionEn}
                          </p>

                          <div className="p-2.5 rounded-xl bg-[#15192C] border border-white/10 text-xs font-mono font-bold text-[#FBBF24]">
                            {opt.progressionFormula}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          {/* Audition Button */}
                          <button
                            onClick={() => handleAudition(opt.id, opt.progressionFormula, analysisResult.detectedKey)}
                            className="pressable flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F8FAFC] border border-white/10 flex items-center justify-center gap-1.5 transition"
                          >
                            {isPlayingThis ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                                <span>{lang === 'vi' ? 'Dừng' : 'Stop'}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span>{lang === 'vi' ? 'Nghe Thử' : 'Audition'}</span>
                              </>
                            )}
                          </button>

                          {/* Apply to Studio Button */}
                          <button
                            onClick={() => handleApply(opt.progressionFormula, analysisResult.detectedKey, opt.id)}
                            className="pressable flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-black font-extrabold text-xs shadow-md shadow-[#F59E0B]/20 flex items-center justify-center gap-1 transition"
                          >
                            <span>{lang === 'vi' ? 'Đẩy Lên Studio' : 'Load Studio'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Legal Compliance Footer */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/10 text-[11px] text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
            <span>
              {lang === 'vi'
                ? 'Bảo vệ quyền riêng tư & bản quyền: Toàn bộ quá trình giải mã âm thanh và trích xuất hợp âm diễn ra cục bộ 100% trong trình duyệt (On-Device DSP), không gửi file ra ngoài internet.'
                : '100% On-Device Web Audio DSP: All audio decoding and harmonic extraction run locally in your browser with zero server egress.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
