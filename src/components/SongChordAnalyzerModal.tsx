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
  MonitorPlay,
  FileText,
  KeyRound,
  Play,
  Piano,
  Wand2,
  AlertCircle,
  Gauge,
} from 'lucide-react';
import { Note } from '@tonaljs/tonal';
import { Language, VibeId } from '../types/harmony';
import {
  SongAnalysisResult,
  DetectedChordSegment,
  analyzeAudioFile,
  recordMicrophoneAndAnalyze,
  createInstantDemoTrackAndAnalyze,
  captureTabAudioAndAnalyze,
  midiToNoteName,
} from '../core/audioChordAnalyzer';
import {
  alignCustomLyricsToSegments,
  getSavedGeminiApiKey,
  saveGeminiApiKey,
  startLiveSpeechRecognition,
  transcribeWithGeminiAudio,
} from '../core/lyricsTranscriber';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { buildProgressionState } from '../engine/reharmonizer';

interface SongChordAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProgression: (formula: string, keyRoot: string, vibe: VibeId) => void;
  lang: Language;
}

type InputTab = 'tab-capture' | 'upload' | 'mic' | 'demo';
type ResultSubTab = 'notes-inspector' | 'lyrics-leadsheet' | 'reharm-options';

// Visual 37-key Studio Inspector Keyboard (C2 = MIDI 36 to C5 = MIDI 72)
const INSPECTOR_START_MIDI = 36;
const INSPECTOR_END_MIDI = 72;
const BLACK_KEY_OFFSETS = new Set([1, 3, 6, 8, 10]);

export const SongChordAnalyzerModal: React.FC<SongChordAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyProgression,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>('demo');
  const [resultSubTab, setResultSubTab] = useState<ResultSubTab>('notes-inspector');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<SongAnalysisResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Video & Audio Media Player state
  const [mediaObjectUrl, setMediaObjectUrl] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Mic & Tab Capture state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [captureCountdown, setCaptureCountdown] = useState<number>(8);

  // Playback & Active Segment Inspector state
  const [isPlayingAudition, setIsPlayingAudition] = useState<boolean>(false);
  const [auditioningOptionId, setAuditioningOptionId] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [highlightedArpNote, setHighlightedArpNote] = useState<string | null>(null);

  // Hybrid Lyrics & Gemini AI state
  const [customLyricsInput, setCustomLyricsInput] = useState<string>('');
  const [showLyricsEditor, setShowLyricsEditor] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => getSavedGeminiApiKey());
  const [showApiKeyBox, setShowApiKeyBox] = useState<boolean>(false);
  const [isTranscribingAi, setIsTranscribingAi] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const liveTabVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (mediaObjectUrl) {
        URL.revokeObjectURL(mediaObjectUrl);
      }
    };
  }, [mediaObjectUrl]);

  if (!isOpen) return null;

  const populateResult = (result: SongAnalysisResult, label: string) => {
    setAnalysisResult(result);
    setSelectedFileName(label);
    setActiveSegmentIndex(0);
    setCustomLyricsInput(result.lyricLines.map((l) => l.rawText).join('\n'));
    setErrorMessage(null);
  };

  // 1. Handle Video / Audio File Upload (.MP4, .MOV, .WEBM, .MP3, .WAV, .MID)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaObjectUrl) {
      URL.revokeObjectURL(mediaObjectUrl);
    }

    const isVid =
      file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/i.test(file.name);
    setIsVideoFile(isVid);
    const objUrl = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null;
    setMediaObjectUrl(objUrl);

    setSelectedFileName(file.name);
    setIsAnalyzing(true);
    setProgressPct(10);
    setErrorMessage(null);

    try {
      const result = await analyzeAudioFile(file, (pct) => setProgressPct(pct));
      populateResult(result, file.name);
    } catch {
      setErrorMessage(
        lang === 'vi'
          ? 'Không thể giải mã file này. Hãy thử định dạng .MP4, .MP3 hoặc .WAV.'
          : 'Could not decode this media file. Please try .MP4, .MP3, or .WAV.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Handle Live Facebook / YouTube Tab Capture
  const handleStartTabCapture = async () => {
    setIsRecording(true);
    setCaptureCountdown(8);
    setIsAnalyzing(true);
    setProgressPct(15);
    setErrorMessage(null);

    let liveSpeechText = '';
    const speechController = startLiveSpeechRecognition(lang, (txt) => {
      liveSpeechText = txt;
    });

    try {
      const result = await captureTabAudioAndAnalyze(
        8,
        (remaining) => setCaptureCountdown(remaining),
        (pct) => setProgressPct(pct),
        (stream) => {
          if (liveTabVideoRef.current) {
            liveTabVideoRef.current.srcObject = stream;
            liveTabVideoRef.current.play().catch(() => {});
          }
        }
      );

      if (speechController) speechController.stop();
      if (liveSpeechText.trim()) {
        result.lyricLines = alignCustomLyricsToSegments(liveSpeechText, result.segments);
      }

      populateResult(
        result,
        lang === 'vi' ? 'Video Ca Sĩ Trên Tab Facebook (8s)' : 'Facebook Tab Live Capture (8s)'
      );
    } catch (err) {
      if (speechController) speechController.stop();
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'NO_TAB_AUDIO_TRACK') {
        setErrorMessage(
          lang === 'vi'
            ? '⚠️ Bạn chưa tích ô "Also share tab audio / Chia sẻ âm thanh tab" khi chọn tab Facebook! Hãy bấm lại và tích chọn chia sẻ âm thanh ở góc dưới hộp thoại.'
            : '⚠️ Please check "Also share tab audio" at the bottom of the browser tab picker dialog!'
        );
      } else {
        setErrorMessage(
          lang === 'vi'
            ? 'Đã hủy chọn Tab hoặc trình duyệt không hỗ trợ bắt âm thanh Tab. Bạn có thể tải video .MP4 lên ở tab bên cạnh!'
            : 'Tab capture cancelled or unsupported. You can also upload an .MP4 video file directly!'
        );
      }
    } finally {
      setIsRecording(false);
      setIsAnalyzing(false);
    }
  };

  // 3. Handle Live Microphone Recording + Live Web Speech Lyrics
  const handleStartMic = async () => {
    setIsRecording(true);
    setCaptureCountdown(6);
    setIsAnalyzing(true);
    setProgressPct(15);
    setErrorMessage(null);

    let liveSpeechText = '';
    const speechController = startLiveSpeechRecognition(lang, (txt) => {
      liveSpeechText = txt;
    });

    try {
      const result = await recordMicrophoneAndAnalyze(
        6,
        (remaining) => setCaptureCountdown(remaining),
        (pct) => setProgressPct(pct)
      );
      if (speechController) speechController.stop();
      if (liveSpeechText.trim()) {
        result.lyricLines = alignCustomLyricsToSegments(liveSpeechText, result.segments);
      }
      populateResult(result, lang === 'vi' ? 'Bản Thu Âm Micro (6s)' : 'Live Mic Recording (6s)');
    } catch {
      if (speechController) speechController.stop();
    } finally {
      setIsRecording(false);
      setIsAnalyzing(false);
    }
  };

  // 4. Handle Instant Demo Generation
  const handleInstantDemo = async () => {
    setIsAnalyzing(true);
    setProgressPct(20);
    setErrorMessage(null);

    try {
      const result = await createInstantDemoTrackAndAnalyze((pct) => setProgressPct(pct));
      populateResult(
        result,
        lang === 'vi'
          ? 'Bản Demo Ca Sĩ Đệm Hát Mẫu (C - Am - F - G)'
          : 'Demo Singer & Piano Track (C - Am - F - G)'
      );
    } catch {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Play a single note on click
  const handlePlaySingleNote = (noteName: string) => {
    setHighlightedArpNote(noteName);
    pianoAudioEngine.playNote(noteName, '4n');
    setTimeout(() => {
      setHighlightedArpNote((prev) => (prev === noteName ? null : prev));
    }, 450);
  };

  // Play the exact time-ordered Arpeggio / Note Roll of a segment ("Ca sĩ đã đánh nốt gì, nốt gì")
  const handlePlaySegmentNoteRoll = (seg: DetectedChordSegment, segIdx: number) => {
    setActiveSegmentIndex(segIdx);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seg.startTime;
    }

    const notesToPlay =
      seg.arpeggioSequence.length > 0
        ? seg.arpeggioSequence
        : [...seg.leftHandNotes, ...seg.rightHandNotes];

    const stepMs = Math.round(240 / playbackRate);
    notesToPlay.forEach((n, idx) => {
      setTimeout(() => {
        setHighlightedArpNote(n);
        pianoAudioEngine.playNote(n, '8n');
        if (idx === notesToPlay.length - 1) {
          setTimeout(() => setHighlightedArpNote(null), stepMs);
        }
      }, idx * stepMs);
    });
  };

  // Play the singer's vocal melody notes in the selected segment
  const handlePlayVocalMelody = (seg: DetectedChordSegment) => {
    const stepMs = Math.round(320 / playbackRate);
    seg.vocalMelodyNotes.forEach((n, idx) => {
      setTimeout(() => {
        setHighlightedArpNote(n);
        pianoAudioEngine.playNote(n, '4n');
        if (idx === seg.vocalMelodyNotes.length - 1) {
          setTimeout(() => setHighlightedArpNote(null), stepMs);
        }
      }, idx * stepMs);
    });
  };

  // Synchronize HTML5 Video playback time with active chord & 3-layer notes
  const handleVideoTimeUpdate = () => {
    const vid = videoPlayerRef.current;
    if (!vid || !analysisResult) return;
    const t = vid.currentTime;
    const foundIdx = analysisResult.segments.findIndex(
      (s) => t >= s.startTime && t <= s.endTime
    );
    if (foundIdx !== -1 && foundIdx !== activeSegmentIndex) {
      setActiveSegmentIndex(foundIdx);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = rate;
    }
  };

  // Apply Manual / Edited Lyrics Sync
  const handleApplyCustomLyrics = () => {
    if (!analysisResult) return;
    const synced = alignCustomLyricsToSegments(customLyricsInput, analysisResult.segments);
    setAnalysisResult({
      ...analysisResult,
      lyricLines: synced,
    });
    setShowLyricsEditor(false);
  };

  // Trigger Gemini 2.5 Flash Multimodal Audio Transcription
  const handleGeminiAudioTranscribe = async () => {
    if (!analysisResult) return;
    if (!geminiApiKey.trim()) {
      setShowApiKeyBox(true);
      setErrorMessage(
        lang === 'vi'
          ? 'Hãy nhập Gemini API Key miễn phí (từ Google AI Studio) để AI nghe trực tiếp giọng ca sĩ trong video!'
          : 'Please enter a free Gemini API Key from Google AI Studio to enable AI audio transcription!'
      );
      return;
    }

    saveGeminiApiKey(geminiApiKey);
    setIsTranscribingAi(true);
    setErrorMessage(null);

    try {
      const res = await transcribeWithGeminiAudio(analysisResult, geminiApiKey, lang);
      setAnalysisResult({
        ...analysisResult,
        lyricLines: res.lyricLines,
        rawFormula: res.refinedFormula || analysisResult.rawFormula,
      });
      setCustomLyricsInput(res.lyricLines.map((l) => l.rawText).join('\n'));
      setResultSubTab('lyrics-leadsheet');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      setErrorMessage(
        lang === 'vi'
          ? `Không thể gọi Gemini Audio API (${msg}). Bạn có thể dùng tính năng "Dán / Sửa Lời Tự Khớp Hợp Âm" ngay bên cạnh!`
          : `Gemini Audio API failed (${msg}). You can use the instant offline Lyrics Auto-Sync editor!`
      );
    } finally {
      setIsTranscribingAi(false);
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
      Math.round((analysisResult?.detectedBpm || 85) * playbackRate),
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

  const activeSeg: DetectedChordSegment | undefined =
    analysisResult?.segments[activeSegmentIndex] || analysisResult?.segments[0];

  // Build sets of active MIDI numbers for the Visual 3-Layer Piano Strip
  const activeBassMidis = new Set(
    (activeSeg?.leftHandNotes || []).map((n) => Note.midi(n)).filter((m): m is number => typeof m === 'number')
  );
  const activeRightMidis = new Set(
    (activeSeg?.rightHandNotes || []).map((n) => Note.midi(n)).filter((m): m is number => typeof m === 'number')
  );
  const activeVocalMidis = new Set(
    (activeSeg?.vocalMelodyNotes || []).map((n) => Note.midi(n)).filter((m): m is number => typeof m === 'number')
  );
  const activeHighlightMidi = highlightedArpNote ? Note.midi(highlightedArpNote) : null;

  const whiteKeys: number[] = [];
  for (let m = INSPECTOR_START_MIDI; m <= INSPECTOR_END_MIDI; m++) {
    if (!BLACK_KEY_OFFSETS.has(m % 12)) {
      whiteKeys.push(m);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#16192E]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(10,14,28,0.8),inset_0_1px_0_rgba(255,255,255,0.16)] text-[#F8FAFC] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1C203B]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#38BDF8]/25 to-[#818CF8]/25 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-tight text-[#F8FAFC] flex flex-wrap items-center gap-2 font-serif">
                <span>
                  {lang === 'vi'
                    ? 'Phòng Thu Bóc Tách Video Ca Sĩ Hát: Hợp Âm • Từng Nốt Đàn • Lời Bài Hát'
                    : 'Video & Singer Performance Analyzer: Chords • Exact Notes • Lyrics'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
                  3-Layer Note DSP + AI Lyrics
                </span>
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {lang === 'vi'
                  ? 'Bắt trực tiếp video Facebook đang phát hoặc tải file .MP4/.MP3 để soi từng nốt Tay Trái, Tay Phải rải, Nốt Hát và Lời bài hát'
                  : 'Capture live Facebook/YouTube tab audio or upload .MP4/.MP3 to inspect Left Hand, Right Hand arpeggio notes, and synced lyrics'}
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

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5">
          {/* 4-Way Input Method Segmented Control */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#15192C]/90 p-1.5 rounded-2xl border border-white/10 gap-1.5">
            <button
              onClick={() => setActiveTab('tab-capture')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'tab-capture'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white font-extrabold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <MonitorPlay className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '📺 Bắt Tab Facebook / YT' : '📺 Capture FB/YT Tab'}</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-[#34D399] to-[#059669] text-black font-extrabold shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '🎬 Tải Video .MP4 / .MP3' : '🎬 Upload Video / Audio'}</span>
            </button>

            <button
              onClick={() => setActiveTab('mic')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'mic'
                  ? 'bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-extrabold shadow-[0_0_15px_rgba(167,139,250,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '🎙️ Thu Âm Giọng / Đàn' : '🎙️ Live Mic Record'}</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Music className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '🎼 Bản Demo Đủ 3 Tầng Nốt' : '🎼 Full 3-Layer Demo'}</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CAPTURE LIVE FACEBOOK / YOUTUBE BROWSER TAB */}
          {activeTab === 'tab-capture' && (
            <div className="p-5 rounded-2xl bg-[#1C203B]/70 border border-[#38BDF8]/30 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8] font-mono text-[10px] font-bold border border-[#38BDF8]/40">
                      LIVE DIGITAL STREAM
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-[#F8FAFC]">
                      {lang === 'vi'
                        ? 'Nghe Trực Tiếp Video Ca Sĩ Hát Từ Tab Facebook / YouTube'
                        : 'Listen Directly to Any Facebook / YouTube Singer Video Tab'}
                    </h3>
                  </div>
                  <ol className="text-xs text-[#CBD5E1] space-y-1 list-decimal list-inside">
                    <li>
                      {lang === 'vi'
                        ? 'Mở sẵn Tab Facebook (hoặc YouTube/TikTok) có video ca sĩ đang hát trên trình duyệt.'
                        : 'Open the Facebook/YouTube video in another browser tab and play it.'}
                    </li>
                    <li>
                      {lang === 'vi'
                        ? 'Bấm nút bên phải → Chọn Tab Facebook đó → Bắt buộc tích ô "Also share tab audio (Chia sẻ âm thanh tab)" ở góc dưới.'
                        : 'Click the button -> Select that browser tab -> Ensure "Also share tab audio" is checked.'}
                    </li>
                  </ol>
                </div>

                <button
                  onClick={handleStartTabCapture}
                  disabled={isRecording || isAnalyzing}
                  className="pressable px-5 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#3B82F6] text-white font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition disabled:opacity-50 shrink-0 flex items-center gap-2"
                >
                  <MonitorPlay className="w-4 h-4" />
                  <span>
                    {isRecording
                      ? lang === 'vi'
                        ? `Đang Nghe & Bóc Nốt (${captureCountdown}s)...`
                        : `Listening to Tab (${captureCountdown}s)...`
                      : lang === 'vi'
                      ? '📺 Chọn Tab Facebook Để Bắt Đầu Nghe (8s)'
                      : '📺 Select Facebook Tab & Analyze (8s)'}
                  </span>
                </button>
              </div>

              {isRecording && (
                <div className="rounded-xl overflow-hidden border border-white/15 bg-black/60 max-h-44 flex items-center justify-center">
                  <video ref={liveTabVideoRef} muted playsInline className="max-h-40 w-auto object-contain" />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD VIDEO (.MP4/.MOV) OR AUDIO (.MP3/.WAV) */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#34D399]/60 bg-[#1C203B]/50 hover:bg-[#1C203B]/80 text-center space-y-2.5 cursor-pointer transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.webm,.mkv,.mp3,.wav,.ogg,.m4a,.mid,video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399] group-hover:scale-110 transition shadow-[0_0_15px_rgba(52,211,153,0.25)]">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#F8FAFC]">
                    {selectedFileName ||
                      (lang === 'vi'
                        ? 'Kéo thả hoặc Bấm để chọn Video Ca Sĩ (.MP4, .MOV, .WEBM) hoặc File Nhạc (.MP3, .WAV)'
                        : 'Click or drag singer Video (.MP4, .MOV, .WEBM) or Audio (.MP3, .WAV)')}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {lang === 'vi'
                      ? 'Tự động tách âm thanh từ Video, phát hình ảnh quay chậm 0.5x/0.75x đồng bộ cùng phím đàn Piano'
                      : 'Extracts audio track from video and syncs slow-motion video playback with 3-layer piano notes'}
                  </div>
                </div>
              </div>

              {/* Synchronized Slow-Motion Video / Audio Deck */}
              {mediaObjectUrl && (
                <div className="p-4 rounded-2xl bg-[#15192C] border border-white/12 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#34D399] flex items-center gap-1.5">
                      <MonitorPlay className="w-4 h-4" />
                      <span>
                        {lang === 'vi'
                          ? 'Trình Phát Video / Audio Đồng Bộ Từng Nốt Đàn'
                          : 'Synchronized Video / Audio Note Deck'}
                      </span>
                    </span>

                    {/* Slow-Mo Speed Controls */}
                    <div className="flex items-center gap-1 bg-[#1C203B] p-1 rounded-xl border border-white/10 text-xs">
                      <Gauge className="w-3.5 h-3.5 text-[#F59E0B] ml-1.5 mr-1" />
                      {[
                        { rate: 0.5, label: '0.5x (Soi nốt)' },
                        { rate: 0.75, label: '0.75x (Tập)' },
                        { rate: 1.0, label: '1.0x (Gốc)' },
                      ].map((item) => (
                        <button
                          key={item.rate}
                          onClick={() => handleChangePlaybackRate(item.rate)}
                          className={`px-2 py-1 rounded-lg font-mono font-bold transition ${
                            playbackRate === item.rate
                              ? 'bg-[#F59E0B] text-black'
                              : 'text-[#CBD5E1] hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <video
                    ref={videoPlayerRef}
                    src={mediaObjectUrl}
                    controls
                    playsInline
                    onTimeUpdate={handleVideoTimeUpdate}
                    className={`w-full rounded-xl bg-black/90 border border-white/10 ${
                      isVideoFile ? 'max-h-60 object-contain' : 'h-12'
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE MICROPHONE RECORDING */}
          {activeTab === 'mic' && (
            <div className="p-5 rounded-2xl bg-[#1C203B]/70 border border-white/10 text-center space-y-3">
              <div className="max-w-lg mx-auto space-y-1">
                <h3 className="text-sm md:text-base font-bold text-[#F8FAFC]">
                  {isRecording
                    ? `${lang === 'vi' ? 'Đang nghe giọng hát & tiếng đàn...' : 'Listening...'} (${captureCountdown}s)`
                    : lang === 'vi'
                    ? 'Hát Hoặc Mở Loa Video Trước Micro (Vừa Bắt Nốt Vừa Chép Lời)'
                    : 'Sing or Play Audio Near Microphone (Pitch + Live Speech)'}
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'vi'
                    ? 'Thu âm 6 giây qua Micro: Hệ thống vừa tách 3 tầng nốt nhạc, vừa bật nhận diện giọng hát Tiếng Việt/Anh.'
                    : 'Records 6 seconds of audio while running real-time speech-to-lyrics and 3-layer pitch extraction.'}
                </p>
              </div>

              <button
                onClick={handleStartMic}
                disabled={isRecording || isAnalyzing}
                className="pressable px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#C4B5FD] hover:to-[#8B5CF6] text-white font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(167,139,250,0.4)] transition disabled:opacity-50"
              >
                {isRecording
                  ? lang === 'vi'
                    ? `Đang Thu Âm (${captureCountdown}s)...`
                    : `Recording (${captureCountdown}s)...`
                  : lang === 'vi'
                  ? '🎙️ Bắt Đầu Thu Âm & Bắt Lời (6 Giây)'
                  : '🎙️ Start Mic & Lyrics Capture (6s)'}
              </button>
            </div>
          )}

          {/* TAB 4: INSTANT DEMO TRACK */}
          {activeTab === 'demo' && (
            <div className="p-5 rounded-2xl bg-[#1C203B]/70 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm md:text-base font-bold text-[#F8FAFC]">
                  {lang === 'vi'
                    ? 'Thử Ngay Bản Demo Ca Sĩ Đệm Hát (Có Đủ 3 Tầng Nốt & Lời Bài Hát)'
                    : 'Instant Singer & Piano Demo (Full 3-Layer Notes & Synced Lyrics)'}
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'vi'
                    ? 'Tổng hợp sóng âm 4 ô nhịp mẫu và phân tích chi tiết: Nốt Bass tay trái, Thứ tự nốt rải tay phải, Nốt giai điệu hát và Lời bài hát.'
                    : 'Synthesize a 4-bar track and inspect Left-Hand Bass, Right-Hand Arpeggio order, Vocal Melody pitches, and Lead Sheet lyrics.'}
                </p>
              </div>

              <button
                onClick={handleInstantDemo}
                disabled={isAnalyzing}
                className="pressable px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-black font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition disabled:opacity-50 shrink-0"
              >
                {isAnalyzing
                  ? lang === 'vi'
                    ? 'Đang Phân Tích...'
                    : 'Analyzing...'
                  : lang === 'vi'
                  ? '✨ Thử Ngay Bản Demo (Instant Demo)'
                  : '✨ Analyze Instant Demo'}
              </button>
            </div>
          )}

          {/* Loading Progress Bar */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#15192C] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#CBD5E1]">
                <span>
                  {lang === 'vi'
                    ? 'Đang mổ xẻ dải tần Bass (Tay trái), chuỗi nốt rải Arpeggio (Tay phải) & Giai điệu giọng hát...'
                    : 'Extracting Left-Hand Bass, Right-Hand Arpeggio sequence, and Vocal Melody contour...'}
                </span>
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

          {/* ================================================================= */}
          {/* RESULTS WORKSPACE: 3-LAYER NOTE INSPECTOR + LYRICS + REHARM       */}
          {/* ================================================================= */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Metrics & Sub-View Switcher Bar */}
              <div className="p-3.5 rounded-2xl bg-[#1C203B]/90 border border-white/12 flex flex-wrap items-center justify-between gap-3">
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
                  <span className="text-xs text-[#CBD5E1] font-mono ml-1">
                    {lang === 'vi' ? 'Vòng gốc:' : 'Chords:'}{' '}
                    <strong className="text-[#F8FAFC]">{analysisResult.rawFormula}</strong>
                  </span>
                </div>

                {/* Result Mode Tabs */}
                <div className="flex items-center bg-[#15192C] p-1 rounded-xl border border-white/10 gap-1 text-xs font-bold">
                  <button
                    onClick={() => setResultSubTab('notes-inspector')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      resultSubTab === 'notes-inspector'
                        ? 'bg-[#38BDF8] text-black font-extrabold'
                        : 'text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    <Piano className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? '1. Đánh Nốt Gì (3 Tầng Nốt)' : '1. Exact Notes Played'}</span>
                  </button>

                  <button
                    onClick={() => setResultSubTab('lyrics-leadsheet')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      resultSubTab === 'lyrics-leadsheet'
                        ? 'bg-[#A78BFA] text-black font-extrabold'
                        : 'text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? '2. Lời Bài Hát & Hợp Âm' : '2. Lyrics Lead Sheet'}</span>
                  </button>

                  <button
                    onClick={() => setResultSubTab('reharm-options')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      resultSubTab === 'reharm-options'
                        ? 'bg-[#F59E0B] text-black font-extrabold'
                        : 'text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? '3. Phối Khí Nâng Cấp (3 Style)' : '3. Reharmonize (3 Styles)'}</span>
                  </button>
                </div>
              </div>

              {/* Synchronized Segment Selector Strip (Always visible so user can click any bar) */}
              <div className="p-4 rounded-2xl bg-[#15192C]/90 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#CBD5E1]">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>
                      {lang === 'vi'
                        ? 'Tiến Trình Hợp Âm Theo Thời Gian (Bấm vào từng ô nhịp để nghe & soi từng nốt đã đánh)'
                        : 'Synchronized Chord Timeline (Click any bar to inspect & hear exact notes played)'}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    {analysisResult.segments.length} {lang === 'vi' ? 'phân đoạn ô nhịp' : 'measure segments'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {analysisResult.segments.map((seg, idx) => {
                    const isSelected = activeSegmentIndex === idx;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handlePlaySegmentNoteRoll(seg, idx)}
                        className={`p-3 rounded-xl border transition text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                            : 'bg-[#1C203B]/60 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                          <span>
                            {seg.startTime}s - {seg.endTime}s
                          </span>
                          <span className="text-[#38BDF8] font-bold">Bậc {seg.romanDegree}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-base font-extrabold text-[#F8FAFC] font-serif">
                            {seg.chordSymbol}
                          </span>
                          <span className="text-[10px] font-mono text-[#FBBF24]">
                            Bass: {seg.bassNote}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#CBD5E1] truncate">
                          Rải: {seg.arpeggioSequence.join(' → ')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================= */}
              {/* SUB-VIEW 1: 3-LAYER NOTE-BY-NOTE INSPECTOR + VISUAL KEYBOARD  */}
              {/* ============================================================= */}
              {resultSubTab === 'notes-inspector' && activeSeg && (
                <div className="space-y-4">
                  {/* Detailed 3-Layer Breakdown Cards for Selected Measure */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Layer 1: Left Hand Bass */}
                    <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-blue-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                          {lang === 'vi' ? '1. Tay Trái (Nốt Bass Trầm)' : '1. Left Hand (Bass Notes)'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                          Root: {activeSeg.bassNote}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1]">
                        {lang === 'vi'
                          ? 'Nốt trầm nền tảng giữ nhịp và xác định thế đảo hợp âm (bấm vào nốt để nghe):'
                          : 'Foundational low register bass notes:'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {activeSeg.leftHandNotes.map((n, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlaySingleNote(n)}
                            className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/50 text-blue-200 font-mono font-extrabold text-xs transition"
                          >
                            🔊 {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layer 2: Right Hand Arpeggio / Note Roll */}
                    <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                          {lang === 'vi' ? '2. Tay Phải Đã Đánh / Rải Nốt' : '2. Right Hand Arpeggio Roll'}
                        </span>
                        <button
                          onClick={() => handlePlaySegmentNoteRoll(activeSeg, activeSegmentIndex)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{lang === 'vi' ? 'Nghe Rải' : 'Play Roll'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1]">
                        {lang === 'vi'
                          ? 'Thứ tự từng nốt đàn đã vang lên trong ô nhịp này:'
                          : 'Chronological sequence of notes played in this bar:'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {activeSeg.arpeggioSequence.map((n, i) => (
                          <React.Fragment key={i}>
                            <button
                              onClick={() => handlePlaySingleNote(n)}
                              className={`px-2 py-1 rounded-lg font-mono font-extrabold text-xs border transition ${
                                highlightedArpNote === n
                                  ? 'bg-amber-400 text-black border-white scale-110 shadow-[0_0_12px_#F59E0B]'
                                  : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/40 text-amber-200'
                              }`}
                            >
                              {n}
                            </button>
                            {i < activeSeg.arpeggioSequence.length - 1 && (
                              <span className="text-[10px] text-[#94A3B8]">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Layer 3: Singer's Vocal Melody Pitches */}
                    <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-cyan-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                          {lang === 'vi' ? '3. Nốt Giai Điệu Ca Sĩ Hát' : '3. Singer Vocal Melody Notes'}
                        </span>
                        <button
                          onClick={() => handlePlayVocalMelody(activeSeg)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{lang === 'vi' ? 'Nghe Nốt Hát' : 'Play Vocal'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1]">
                        {activeSeg.lyricSnippet
                          ? `"${activeSeg.lyricSnippet}"`
                          : lang === 'vi'
                          ? 'Các nốt cao độ giọng hát chính của ca sĩ:'
                          : 'Detected vocal melody pitch contour:'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {activeSeg.vocalMelodyNotes.map((n, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlaySingleNote(n)}
                            className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 font-mono font-extrabold text-xs transition"
                          >
                            🎤 {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual 37-Key Piano Strip (C2 to C5) */}
                  <div className="p-4 rounded-2xl bg-[#0C0E1A] border border-white/12 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#F8FAFC] flex items-center gap-2">
                        <Piano className="w-4 h-4 text-[#F59E0B]" />
                        <span>
                          {lang === 'vi'
                            ? `Bàn Phím Soi Nốt Trực Quan — Ô nhịp ${activeSegmentIndex + 1}: Hợp âm ${activeSeg.chordSymbol}`
                            : `Visual Note Inspector Keyboard — Bar ${activeSegmentIndex + 1}: ${activeSeg.chordSymbol}`}
                        </span>
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Tay Trái (Bass)
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Tay Phải (Voicing)
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-400 inline-block" /> Nốt Hát (Vocal)
                        </span>
                      </div>
                    </div>

                    <div className="relative h-28 flex select-none overflow-x-auto pb-1">
                      {whiteKeys.map((midi) => {
                        const noteName = midiToNoteName(midi);
                        const isBass = activeBassMidis.has(midi);
                        const isRight = activeRightMidis.has(midi);
                        const isVocal = activeVocalMidis.has(midi);
                        const isArpNow = activeHighlightMidi === midi;

                        let bgClass = 'bg-[#F8FAFC] hover:bg-slate-200 text-slate-800';
                        if (isArpNow) {
                          bgClass = 'bg-emerald-400 text-black font-extrabold shadow-[0_0_15px_#34D399]';
                        } else if (isBass) {
                          bgClass = 'bg-blue-500 text-white font-extrabold shadow-[0_0_12px_#3B82F6]';
                        } else if (isRight) {
                          bgClass = 'bg-amber-400 text-black font-extrabold shadow-[0_0_12px_#F59E0B]';
                        }

                        return (
                          <button
                            key={midi}
                            type="button"
                            onClick={() => handlePlaySingleNote(noteName)}
                            className={`flex-1 min-w-[28px] h-full rounded-b-lg border border-slate-400/50 flex flex-col items-center justify-end pb-1.5 text-[10px] font-mono transition relative ${bgClass} ${
                              isVocal ? 'ring-2 ring-cyan-400 ring-inset' : ''
                            }`}
                          >
                            {isVocal && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 mb-1 shadow-[0_0_6px_#06B6D4]" />
                            )}
                            <span>{noteName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* SUB-VIEW 2: CHORD-OVER-LYRICS & MELODY LEAD SHEET             */}
              {/* ============================================================= */}
              {resultSubTab === 'lyrics-leadsheet' && (
                <div className="space-y-4">
                  {/* Hybrid Lyrics Action Toolbar */}
                  <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-white/12 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A78BFA]" />
                        <span>
                          {lang === 'vi'
                            ? 'Bản Nhạc Hợp Âm & Nốt Giai Điệu Trên Từng Chữ (Interactive Lead Sheet)'
                            : 'Interactive Chord-over-Lyrics & Melody Note Lead Sheet'}
                        </span>
                      </h4>
                      <p className="text-xs text-[#CBD5E1]">
                        {lang === 'vi'
                          ? 'Bấm vào bất kỳ hợp âm hoặc câu hát nào để nghe thế bấm & nốt giai điệu tương ứng'
                          : 'Click any chord badge or lyric phrase to hear its exact piano voicing and vocal note'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowApiKeyBox((prev) => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-[#CBD5E1] flex items-center gap-1.5 transition"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{lang === 'vi' ? 'Cài Gemini Key' : 'Gemini Key'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGeminiAudioTranscribe}
                        disabled={isTranscribingAi}
                        className="pressable px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#C4B5FD] hover:to-[#8B5CF6] text-white font-extrabold text-xs shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>
                          {isTranscribingAi
                            ? lang === 'vi'
                              ? 'AI Đang Nghe & Chép Lời...'
                              : 'AI Transcribing...'
                            : lang === 'vi'
                            ? '✨ AI Nghe Nhạc & Chép Lời (Gemini Audio)'
                            : '✨ AI Audio Lyrics Transcribe'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowLyricsEditor((prev) => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-bold transition"
                      >
                        {lang === 'vi' ? '📝 Dán / Sửa Lời Tự Khớp Hợp Âm' : '📝 Edit / Paste Lyrics Auto-Sync'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Gemini API Key Input Box */}
                  {showApiKeyBox && (
                    <div className="p-4 rounded-2xl bg-[#15192C] border border-[#F59E0B]/40 space-y-2">
                      <div className="text-xs font-bold text-[#FBBF24]">
                        {lang === 'vi'
                          ? '🔑 Nhập Google Gemini API Key (Miễn phí tại aistudio.google.com - Lưu cục bộ trên trình duyệt của bạn):'
                          : '🔑 Enter Google Gemini API Key (Stored locally in your browser):'}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="flex-1 bg-[#1C203B] border border-white/15 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            saveGeminiApiKey(geminiApiKey);
                            setShowApiKeyBox(false);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs"
                        >
                          {lang === 'vi' ? 'Lưu Key' : 'Save Key'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Offline Smart Lyrics Paste & Auto-Align Editor */}
                  {showLyricsEditor && (
                    <div className="p-4 rounded-2xl bg-[#15192C] border border-[#38BDF8]/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#38BDF8]">
                          {lang === 'vi'
                            ? '📝 Dán hoặc sửa lời bài hát (Mỗi câu 1 dòng — Hệ thống sẽ tự động gắn Hợp âm & Nốt nhạc vào từng chữ):'
                            : '📝 Paste or edit song lyrics (One phrase per line for automatic chord & melody alignment):'}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={customLyricsInput}
                        onChange={(e) => setCustomLyricsInput(e.target.value)}
                        placeholder={
                          lang === 'vi'
                            ? 'Nhập lời bài hát tại đây...\nVí dụ:\nChiều buông nắng trên phím đàn xưa\nTừng câu hát ngân nga nhẹ rơi'
                            : 'Paste lyrics line by line...'
                        }
                        className="w-full rounded-xl bg-[#1C203B] border border-white/15 p-3 text-xs text-white font-sans focus:outline-none focus:border-[#38BDF8]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLyricsEditor(false)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-[#CBD5E1]"
                        >
                          {lang === 'vi' ? 'Đóng' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyCustomLyrics}
                          className="px-4 py-1.5 rounded-xl bg-[#38BDF8] text-black font-extrabold text-xs"
                        >
                          {lang === 'vi'
                            ? '⚡ Tự Động Khớp Hợp Âm & Nốt Vào Lời'
                            : '⚡ Auto-Align Chords & Notes to Lyrics'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Lead Sheet Display */}
                  <div className="p-5 rounded-2xl bg-[#15192C]/95 border border-white/12 space-y-5">
                    {analysisResult.lyricLines.map((line, lIdx) => {
                      const matchingSegIdx = analysisResult.segments.findIndex(
                        (s) => Math.abs(s.startTime - line.startTime) < 0.9
                      );
                      const segIdx = matchingSegIdx !== -1 ? matchingSegIdx : lIdx % analysisResult.segments.length;
                      const seg = analysisResult.segments[segIdx];
                      const isLineActive = activeSegmentIndex === segIdx;

                      return (
                        <div
                          key={lIdx}
                          onClick={() => seg && handlePlaySegmentNoteRoll(seg, segIdx)}
                          className={`p-4 rounded-2xl border transition cursor-pointer ${
                            isLineActive
                              ? 'bg-[#1C203B] border-[#F59E0B]/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                              : 'bg-[#1C203B]/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-2">
                            <span>
                              ⏱️ {line.startTime}s – {line.endTime}s
                            </span>
                            {seg && (
                              <span className="text-amber-300">
                                🎹 Rải tay phải: <strong>{seg.arpeggioSequence.join(' → ')}</strong>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-end gap-x-3 gap-y-4 leading-relaxed">
                            {line.tokens.map((tok, tIdx) => (
                              <div key={tIdx} className="inline-flex flex-col items-start">
                                {/* Chord & Vocal Note Header above word */}
                                <div className="flex items-center gap-1 mb-1">
                                  {tok.chordSymbol && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#F59E0B] text-black font-mono font-extrabold text-xs shadow-xs">
                                      [{tok.chordSymbol}]
                                    </span>
                                  )}
                                  {tok.melodyNote && (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-[10px] font-bold">
                                      🎤 {tok.melodyNote}
                                    </span>
                                  )}
                                </div>
                                {/* Sung lyric words */}
                                <span className="text-sm md:text-base font-semibold text-[#F8FAFC]">
                                  {tok.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* SUB-VIEW 3: 3 REHARMONIZED ACCOMPANIMENT OPTIONS              */}
              {/* ============================================================= */}
              {resultSubTab === 'reharm-options' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span>
                      {lang === 'vi'
                        ? '3 Phương Án Phối Khí & Hòa Thanh Đệm Nâng Cấp Cho Bài Hát Này'
                        : '3 Reharmonized Piano Accompaniment Options'}
                    </span>
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
                            <button
                              onClick={() =>
                                handleAudition(opt.id, opt.progressionFormula, analysisResult.detectedKey)
                              }
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

                            <button
                              onClick={() =>
                                handleApply(opt.progressionFormula, analysisResult.detectedKey, opt.id)
                              }
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
              )}
            </div>
          )}

          {/* Privacy & Legal Compliance Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>
                {lang === 'vi'
                  ? '100% On-Device Web Audio DSP: Giải mã video/âm thanh và bóc tách 3 tầng nốt diễn ra cục bộ ngay trên trình duyệt, an toàn bản quyền.'
                  : '100% On-Device Web Audio DSP: Video decoding and 3-layer note extraction run locally in your browser.'}
              </span>
            </div>
            {analysisResult && (
              <button
                onClick={() =>
                  handleApply(analysisResult.rawFormula, analysisResult.detectedKey, 'pop-ballad')
                }
                className="pressable px-3.5 py-1.5 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs shrink-0 flex items-center gap-1"
              >
                <span>{lang === 'vi' ? 'Nạp Vòng Hợp Âm Lên Đàn 88 Phím' : 'Load to 88-Key Piano'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
