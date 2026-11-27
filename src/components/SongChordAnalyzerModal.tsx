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
  Radio,
} from 'lucide-react';
import { Note } from '@tonaljs/tonal';
import { Language, VibeId } from '../types/harmony';
import {
  SongAnalysisResult,
  DetectedChordSegment,
  ContinuousCaptureSession,
  analyzeAudioFile,
  createInstantDemoTrackAndAnalyze,
  startContinuousStreamSession,
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

const INSPECTOR_START_MIDI = 36; // C2
const INSPECTOR_END_MIDI = 84;   // C6 (4 full octaves: 29 white keys + 20 black keys)
const BLACK_KEY_OFFSETS = new Set([1, 3, 6, 8, 10]);

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const SongChordAnalyzerModal: React.FC<SongChordAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyProgression,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>('tab-capture');
  const [resultSubTab, setResultSubTab] = useState<ResultSubTab>('notes-inspector');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<SongAnalysisResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Video & Audio Media Player state (supports both uploaded long videos AND captured Tab/Mic WAVs!)
  const [mediaObjectUrl, setMediaObjectUrl] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Continuous Unlimited Live Capture State (Tab & Mic)
  const [isCapturingLive, setIsCapturingLive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [liveSegments, setLiveSegments] = useState<DetectedChordSegment[]>([]);
  const [liveRunningKey, setLiveRunningKey] = useState<string>('C');
  const [liveSpeechPreview, setLiveSpeechPreview] = useState<string>('');

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
  const activeSessionRef = useRef<ContinuousCaptureSession | null>(null);
  const speechRecRef = useRef<{ stop: () => void } | null>(null);
  const liveSpeechTextRef = useRef<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    return () => {
      if (mediaObjectUrl) {
        URL.revokeObjectURL(mediaObjectUrl);
      }
      activeSessionRef.current?.cancel();
      speechRecRef.current?.stop();
    };
  }, [mediaObjectUrl]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    pianoAudioEngine.stopPlayback();
    activeSessionRef.current?.cancel();
    activeSessionRef.current = null;
    speechRecRef.current?.stop();
    speechRecRef.current = null;
    setIsCapturingLive(false);
    onClose();
  };

  const populateResult = (result: SongAnalysisResult, label: string) => {
    // If the live session produced a playable WAV Blob, attach it to the Slow-Mo Media Player!
    if (result.capturedAudioBlob && typeof URL.createObjectURL === 'function') {
      if (mediaObjectUrl) URL.revokeObjectURL(mediaObjectUrl);
      setIsVideoFile(false);
      setMediaObjectUrl(URL.createObjectURL(result.capturedAudioBlob));
    }

    setAnalysisResult(result);
    setSelectedFileName(label);
    setActiveSegmentIndex(0);
    setCustomLyricsInput(result.lyricLines.map((l) => l.rawText).join('\n'));
    setErrorMessage(null);
  };

  // 1. Handle Full-Length Video / Audio File Upload (.MP4, .MOV, .WEBM, .MP3, .WAV, .MID — any length!)
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
    setProgressPct(5);
    setErrorMessage(null);

    try {
      const result = await analyzeAudioFile(file, (pct) => setProgressPct(pct));
      populateResult(result, file.name);
    } catch {
      setErrorMessage(
        lang === 'vi'
          ? 'Không thể giải mã file này. Hãy thử định dạng .MP4, .MOV, .WEBM, .MP3 hoặc .WAV.'
          : 'Could not decode this media file. Please try .MP4, .MOV, .WEBM, .MP3, or .WAV.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Start UNLIMITED Continuous Live Stream (Facebook/YouTube Tab OR Microphone)
  const handleStartContinuousCapture = async (mode: 'tab' | 'mic') => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setLiveSegments([]);
    setElapsedSeconds(0);
    setLiveSpeechPreview('');
    liveSpeechTextRef.current = '';

    const speechCtrl = startLiveSpeechRecognition(lang, (txt) => {
      liveSpeechTextRef.current = txt;
      setLiveSpeechPreview(txt);
    });
    speechRecRef.current = speechCtrl;

    try {
      const session = await startContinuousStreamSession(mode, {
        onStreamReady: (stream) => {
          if (mode === 'tab' && liveTabVideoRef.current) {
            liveTabVideoRef.current.srcObject = stream;
            liveTabVideoRef.current.play().catch(() => {});
          }
        },
        onElapsedTick: (sec) => {
          setElapsedSeconds(sec);
        },
        onLiveSegment: (_seg, allSegs, runningKey) => {
          setLiveSegments(allSegs);
          setLiveRunningKey(runningKey);
          setActiveSegmentIndex(allSegs.length - 1);
        },
        onAutoEnded: (finalRes) => {
          // Triggered if user clicks Chrome's native "Stop sharing" bar
          speechRecRef.current?.stop();
          speechRecRef.current = null;
          activeSessionRef.current = null;
          setIsCapturingLive(false);
          if (liveSpeechTextRef.current.trim()) {
            finalRes.lyricLines = alignCustomLyricsToSegments(
              liveSpeechTextRef.current,
              finalRes.segments
            );
          }
          populateResult(
            finalRes,
            lang === 'vi'
              ? `Bản Thu Trực Tiếp (${formatClock(finalRes.duration)})`
              : `Live Captured Track (${formatClock(finalRes.duration)})`
          );
        },
      });

      activeSessionRef.current = session;
      setIsCapturingLive(true);
    } catch (err) {
      speechCtrl?.stop();
      speechRecRef.current = null;
      setIsCapturingLive(false);
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'NO_TAB_AUDIO_TRACK') {
        setErrorMessage(
          lang === 'vi'
            ? '⚠️ Bạn chưa tích ô "Also share tab audio / Chia sẻ âm thanh tab" ở góc dưới khi chọn Tab Facebook! Hãy bấm lại và tích chọn chia sẻ âm thanh nhé.'
            : '⚠️ Please check "Also share tab audio" at the bottom of the browser tab picker dialog!'
        );
      } else {
        setErrorMessage(
          lang === 'vi'
            ? 'Đã hủy hoặc trình duyệt chưa cấp quyền thu âm. Bạn cũng có thể kéo thả trực tiếp file video .MP4 dài bất kỳ ở tab bên cạnh!'
            : 'Capture cancelled or permission denied. You can also upload any full-length .MP4 video file!'
        );
      }
    }
  };

  // Stop & Finalize Unlimited Live Capture whenever user clicks Stop
  const handleStopContinuousCapture = async () => {
    const session = activeSessionRef.current;
    if (!session) return;

    speechRecRef.current?.stop();
    speechRecRef.current = null;
    setIsCapturingLive(false);
    setIsAnalyzing(true);
    setProgressPct(65);

    try {
      const finalRes = await session.stopAndFinalize();
      activeSessionRef.current = null;
      if (liveSpeechTextRef.current.trim()) {
        finalRes.lyricLines = alignCustomLyricsToSegments(
          liveSpeechTextRef.current,
          finalRes.segments
        );
      }
      populateResult(
        finalRes,
        lang === 'vi'
          ? `Bản Thu Cả Bài (${formatClock(finalRes.duration)})`
          : `Full Captured Song (${formatClock(finalRes.duration)})`
      );
    } catch {
      setErrorMessage(
        lang === 'vi'
          ? 'Có lỗi khi tổng hợp bản thu.'
          : 'Failed to finalize captured session.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Instant Demo Generation
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

  const handlePlaySingleNote = (noteName: string) => {
    setHighlightedArpNote(noteName);
    pianoAudioEngine.playNote(noteName, '4n');
    setTimeout(() => {
      setHighlightedArpNote((prev) => (prev === noteName ? null : prev));
    }, 450);
  };

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

  const handleApplyCustomLyrics = () => {
    if (!analysisResult) return;
    const synced = alignCustomLyricsToSegments(customLyricsInput, analysisResult.segments);
    setAnalysisResult({
      ...analysisResult,
      lyricLines: synced,
    });
    setShowLyricsEditor(false);
  };

  const handleGeminiAudioTranscribe = async () => {
    if (!analysisResult) return;
    if (!geminiApiKey.trim()) {
      setShowApiKeyBox(true);
      setErrorMessage(
        lang === 'vi'
          ? 'Hãy nhập Gemini API Key miễn phí (từ Google AI Studio) để AI nghe toàn bộ bài hát và chép lời!'
          : 'Please enter a free Gemini API Key from Google AI Studio to enable full-song AI audio transcription!'
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
          ? `Không thể gọi Gemini Audio API (${msg}). Bạn có thể dùng nút "Dán / Sửa Lời Tự Khớp Hợp Âm" ngay bên cạnh!`
          : `Gemini Audio API failed (${msg}). You can use the instant offline Lyrics Auto-Sync editor!`
      );
    } finally {
      setIsTranscribingAi(false);
    }
  };

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
    handleCloseModal();
  };

  // Active segment works seamlessly both DURING live capture (real-time radar!) and AFTER completion!
  const displayedSegments = isCapturingLive ? liveSegments : analysisResult?.segments || [];
  const activeSeg: DetectedChordSegment | undefined =
    displayedSegments[activeSegmentIndex] || displayedSegments[displayedSegments.length - 1];

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
  const blackKeys: Array<{ midi: number; leftWhiteIndex: number }> = [];
  for (let m = INSPECTOR_START_MIDI; m <= INSPECTOR_END_MIDI; m++) {
    if (!BLACK_KEY_OFFSETS.has(m % 12)) {
      whiteKeys.push(m);
    } else {
      blackKeys.push({ midi: m, leftWhiteIndex: whiteKeys.length - 1 });
    }
  }
  const whiteKeyWidthPct = 100 / whiteKeys.length;
  const blackKeyWidthPct = whiteKeyWidthPct * 0.66;

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
              <h2 className="text-base md:text-lg font-extrabold tracking-tight text-[#F8FAFC] flex flex-wrap items-center gap-2 font-sans">
                <span>
                  {lang === 'vi'
                    ? 'Phòng Thu Bóc Tách Video Dài & Live Tab: Hợp Âm • Từng Nốt • Lời Hát'
                    : 'Full-Length Video & Live Tab Analyzer: Chords • Exact Notes • Lyrics'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-bold">
                  Unlimited Duration • Live Radar
                </span>
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {lang === 'vi'
                  ? 'Nghe trọn vẹn cả bài dài (3–15+ phút) từ Tab Facebook/YouTube hoặc tải file Video .MP4 dài bất kỳ — Bắt nốt trực tiếp theo thời gian thực!'
                  : 'Listen to full-length songs (unlimited minutes) from Facebook/YouTube tabs or full .MP4 videos with real-time 3-layer note radar!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
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
              disabled={isCapturingLive}
              onClick={() => setActiveTab('tab-capture')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'tab-capture'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white font-extrabold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40'
              }`}
            >
              <MonitorPlay className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '📺 Bắt Tab FB / YT (Cả Bài)' : '📺 Live FB/YT Tab (Full)'}</span>
            </button>

            <button
              disabled={isCapturingLive}
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-[#34D399] to-[#059669] text-black font-extrabold shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '🎬 Tải Video Dài (.MP4/.MP3)' : '🎬 Upload Long .MP4/.MP3'}</span>
            </button>

            <button
              disabled={isCapturingLive}
              onClick={() => setActiveTab('mic')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'mic'
                  ? 'bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-extrabold shadow-[0_0_15px_rgba(167,139,250,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? '🎙️ Thu Mic (Không Giới Hạn)' : '🎙️ Unlimited Mic'}</span>
            </button>

            <button
              disabled={isCapturingLive}
              onClick={() => setActiveTab('demo')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40'
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

          {/* TAB 1: CONTINUOUS UNLIMITED FACEBOOK / YOUTUBE TAB CAPTURE */}
          {activeTab === 'tab-capture' && (
            <div className="p-5 rounded-2xl bg-[#1C203B]/70 border border-[#38BDF8]/30 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8] font-mono text-[10px] font-bold border border-[#38BDF8]/40">
                      UNLIMITED FULL-SONG STREAM
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-[#F8FAFC]">
                      {lang === 'vi'
                        ? 'Nghe Trọn Vẹn Cả Video Dài Trên Tab Facebook / YouTube (Không Giới Hạn Giây!)'
                        : 'Continuous Real-Time Facebook / YouTube Tab Listener (Unlimited Duration)'}
                    </h3>
                  </div>
                  <ol className="text-xs text-[#CBD5E1] space-y-1 list-decimal list-inside">
                    <li>
                      {lang === 'vi'
                        ? 'Mở Tab Facebook/YouTube có video ca sĩ hát → Bấm nút "Bắt Đầu Nghe Tab" bên phải và tích "Also share tab audio".'
                        : 'Open the Facebook/YouTube tab -> Click Start below and check "Also share tab audio".'}
                    </li>
                    <li>
                      {lang === 'vi'
                        ? 'Để video phát thoải mái 3 phút, 5 phút hay 15 phút tuỳ ý! Hợp âm & nốt nhạc sẽ nhảy trực tiếp từng nhịp ngay bên dưới. Khi nào nghe xong bạn mới bấm nút "⏹ Dừng & Hoàn Tất"!'
                        : 'Let the video play as long as you want! Chords and notes appear live every 2s until you click Stop & Finalize.'}
                    </li>
                  </ol>
                </div>

                {!isCapturingLive ? (
                  <button
                    onClick={() => handleStartContinuousCapture('tab')}
                    disabled={isAnalyzing}
                    className="pressable px-5 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#3B82F6] text-white font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition disabled:opacity-50 shrink-0 flex items-center gap-2"
                  >
                    <MonitorPlay className="w-4 h-4" />
                    <span>
                      {lang === 'vi'
                        ? '📺 Bắt Đầu Nghe Tab Facebook (Không Giới Hạn)'
                        : '📺 Start Unlimited Tab Capture'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopContinuousCapture}
                    className="pressable px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs md:text-sm shadow-[0_0_25px_rgba(244,63,94,0.6)] transition shrink-0 flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>
                      {lang === 'vi'
                        ? `⏹ Dừng & Hoàn Tất Cả Bài (${formatClock(elapsedSeconds)})`
                        : `⏹ Stop & Finalize (${formatClock(elapsedSeconds)})`}
                    </span>
                  </button>
                )}
              </div>

              {isCapturingLive && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#0C0E1A] border border-rose-500/40">
                  <div className="md:col-span-5 rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-40">
                    <video ref={liveTabVideoRef} muted playsInline className="max-h-36 w-auto object-contain" />
                  </div>
                  <div className="md:col-span-7 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-extrabold text-rose-400">
                        <Radio className="w-4 h-4 animate-ping" />
                        LIVE RADAR • {formatClock(elapsedSeconds)}
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#FBBF24] font-bold">
                        Tone tạm tính: {liveRunningKey} • {liveSegments.length} ô nhịp đã bắt
                      </span>
                    </div>
                    {activeSeg ? (
                      <div className="p-2.5 rounded-xl bg-[#1C203B] border border-white/10 space-y-1">
                        <div className="text-sm font-extrabold text-[#F8FAFC]">
                          Hợp âm hiện tại: <span className="text-[#F59E0B]">{activeSeg.chordSymbol}</span>{' '}
                          <span className="text-xs font-mono text-blue-300">(Bass: {activeSeg.bassNote})</span>
                        </div>
                        <div className="font-mono text-[11px] text-amber-200">
                          🎹 Nốt đang rải: {activeSeg.arpeggioSequence.join(' → ')}
                        </div>
                        <div className="font-mono text-[11px] text-cyan-300">
                          🎤 Nốt ca sĩ hát: {activeSeg.vocalMelodyNotes.join(' → ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[#94A3B8] italic">
                        {lang === 'vi'
                          ? 'Đang thu ô nhịp đầu tiên từ Tab Facebook... Hãy đảm bảo video đang phát có tiếng!'
                          : 'Listening for the first measure... Make sure the video is playing!'}
                      </div>
                    )}
                    {liveSpeechPreview && (
                      <div className="text-[11px] text-purple-300 truncate">
                        📝 Lời bắt trực tiếp: &ldquo;{liveSpeechPreview}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FULL-LENGTH VIDEO (.MP4/.MOV) OR AUDIO (.MP3/.WAV) */}
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
                        ? 'Kéo thả hoặc Bấm chọn Video Dài Nguyên Bài (.MP4, .MOV, .WEBM) hoặc Nhạc (.MP3, .WAV)'
                        : 'Click or drag Full-Length Video (.MP4, .MOV, .WEBM) or Audio (.MP3, .WAV)')}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {lang === 'vi'
                      ? 'Hỗ trợ video dài nguyên bài (3–15+ phút) • Tự động bóc tách toàn bộ ô nhịp & phát chậm 0.5x/0.75x đồng bộ phím đàn'
                      : 'Supports full-length videos (3–15+ mins) with non-blocking measure extraction and slow-motion playback'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTINUOUS UNLIMITED MICROPHONE RECORDING */}
          {activeTab === 'mic' && (
            <div className="p-5 rounded-2xl bg-[#1C203B]/70 border border-white/10 text-center space-y-3">
              <div className="max-w-lg mx-auto space-y-1">
                <h3 className="text-sm md:text-base font-bold text-[#F8FAFC]">
                  {isCapturingLive
                    ? `${lang === 'vi' ? '🔴 Đang thu âm liên tục cả bài:' : '🔴 Recording Live:'} ${formatClock(elapsedSeconds)}`
                    : lang === 'vi'
                    ? 'Thu Âm Giọng Hát / Đàn Không Giới Hạn Thời Gian (Khi Nào Xong Mới Bấm Dừng)'
                    : 'Unlimited Live Microphone Capture (Stop Whenever You Finish)'}
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  {lang === 'vi'
                    ? 'Hát, chơi đàn hoặc bật loa điện thoại video Facebook cạnh Micro dài bao nhiêu phút tùy thích — hợp âm và nốt nhạc sẽ hiện trực tiếp từng ô nhịp!'
                    : 'Sing, play piano, or hold your phone playing a video near the mic for as many minutes as needed!'}
                </p>
              </div>

              {!isCapturingLive ? (
                <button
                  onClick={() => handleStartContinuousCapture('mic')}
                  disabled={isAnalyzing}
                  className="pressable px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#C4B5FD] hover:to-[#8B5CF6] text-white font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(167,139,250,0.4)] transition disabled:opacity-50"
                >
                  {lang === 'vi'
                    ? '🎙️ Bắt Đầu Thu Âm Cả Bài (Không Giới Hạn)'
                    : '🎙️ Start Unlimited Mic Recording'}
                </button>
              ) : (
                <button
                  onClick={handleStopContinuousCapture}
                  className="pressable px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs md:text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse"
                >
                  {lang === 'vi'
                    ? `⏹ Dừng Thu & Tổng Hợp Cả Bài (${formatClock(elapsedSeconds)})`
                    : `⏹ Stop & Finalize (${formatClock(elapsedSeconds)})`}
                </button>
              )}
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
                    ? 'Tổng hợp sóng âm mẫu để xem thử cách hiển thị Nốt Bass tay trái, Thứ tự nốt rải tay phải, Nốt hát và Lời bài hát.'
                    : 'Synthesize a sample track to preview Left-Hand Bass, Right-Hand Arpeggio order, Vocal Melody pitches, and Lead Sheet lyrics.'}
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

          {/* Synchronized Slow-Motion Video / Captured Audio Replay Deck (Available after upload OR after Tab/Mic capture!) */}
          {mediaObjectUrl && !isCapturingLive && (
            <div className="p-4 rounded-2xl bg-[#15192C] border border-white/12 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#34D399] flex items-center gap-1.5">
                  <MonitorPlay className="w-4 h-4" />
                  <span>
                    {lang === 'vi'
                      ? `Trình Phát Lại & Tua Chậm Đồng Bộ Nốt Đàn: ${selectedFileName || ''}`
                      : `Synchronized Slow-Mo Replay Deck: ${selectedFileName || ''}`}
                  </span>
                </span>

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

          {/* Loading Progress Bar */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#15192C] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#CBD5E1]">
                <span>
                  {lang === 'vi'
                    ? 'Đang giải mã toàn bộ thời lượng bài hát: Bóc tách Bass (Tay trái), Nốt rải (Tay phải) & Giai điệu giọng hát...'
                    : 'Analyzing full-length track: Extracting Left-Hand Bass, Right-Hand Arpeggio sequence, and Vocal Melody...'}
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
          {/* LIVE STREAMING TIMELINE (Shown live while recording long songs!)  */}
          {/* ================================================================= */}
          {isCapturingLive && liveSegments.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#15192C]/90 border border-[#38BDF8]/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#38BDF8]">
                <span>
                  ⚡ Tiến trình hợp âm & nốt đang bắt trực tiếp ({liveSegments.length} ô nhịp — {formatClock(elapsedSeconds)})
                </span>
                <span className="text-[11px] text-[#CBD5E1]">Tự động cuộn theo video đang phát</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                {liveSegments.map((seg, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveSegmentIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left space-y-1 transition ${
                      activeSegmentIndex === idx
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8]'
                        : 'bg-[#1C203B]/60 border-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-[#94A3B8]">
                      {formatClock(seg.startTime)} - {formatClock(seg.endTime)}
                    </div>
                    <div className="text-sm font-extrabold text-[#F8FAFC] flex justify-between">
                      <span>{seg.chordSymbol}</span>
                      <span className="text-[10px] font-mono text-[#FBBF24]">Bass {seg.bassNote}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#CBD5E1] truncate">
                      {seg.arpeggioSequence.join('→')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* FINALIZED FULL-SONG WORKSPACE                                     */}
          {/* ================================================================= */}
          {analysisResult && !isAnalyzing && !isCapturingLive && (
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
                    ⏱️ {formatClock(analysisResult.duration)} ({analysisResult.segments.length} ô nhịp)
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

              {/* Scrollable Full-Song Synchronized Chord Timeline (Handles 200+ segments effortlessly!) */}
              <div className="p-4 rounded-2xl bg-[#15192C]/90 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#CBD5E1]">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>
                      {lang === 'vi'
                        ? 'Tiến Trình Toàn Bộ Bài Hát (Bấm vào ô nhịp bất kỳ để tua Video & nghe từng nốt rải)'
                        : 'Full-Song Synchronized Chord Timeline (Click any bar to seek video & hear exact notes)'}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    Ô nhịp đang soi: #{activeSegmentIndex + 1} / {analysisResult.segments.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                  {analysisResult.segments.map((seg, idx) => {
                    const isSelected = activeSegmentIndex === idx;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handlePlaySegmentNoteRoll(seg, idx)}
                        className={`p-2.5 rounded-xl border transition text-left space-y-1 ${
                          isSelected
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                            : 'bg-[#1C203B]/60 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                          <span>
                            {formatClock(seg.startTime)}-{formatClock(seg.endTime)}
                          </span>
                          <span className="text-[#38BDF8] font-bold">{seg.romanDegree}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-extrabold text-[#F8FAFC] font-serif">
                            {seg.chordSymbol}
                          </span>
                          <span className="text-[10px] font-mono text-[#FBBF24]">
                            {seg.bassNote}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#CBD5E1] truncate">
                          {seg.arpeggioSequence.join('→')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUB-VIEW 1: 3-LAYER NOTE-BY-NOTE INSPECTOR + VISUAL KEYBOARD */}
              {resultSubTab === 'notes-inspector' && activeSeg && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                          ? 'Nốt trầm nền tảng giữ nhịp và xác định thế đảo hợp âm:'
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

                  {/* Interactive Visual 37-Key Piano Strip */}
                  <div className="p-4 rounded-2xl bg-[#0C0E1A] border border-white/12 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#F8FAFC] flex items-center gap-2">
                        <Piano className="w-4 h-4 text-[#F59E0B]" />
                        <span>
                          {lang === 'vi'
                            ? `Bàn Phím Soi Nốt Trực Quan — Ô nhịp #${activeSegmentIndex + 1} (${formatClock(activeSeg.startTime)}): ${activeSeg.chordSymbol}`
                            : `Visual Note Inspector Keyboard — Bar #${activeSegmentIndex + 1}: ${activeSeg.chordSymbol}`}
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

                    <div className="overflow-x-auto pb-1 select-none">
                      <div className="relative h-36 flex min-w-[860px] w-full">
                        {/* 1. White Keys Layer (C2 to C6) */}
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
                              title={`Phím trắng ${noteName}`}
                              onClick={() => handlePlaySingleNote(noteName)}
                              className={`flex-1 h-full rounded-b-lg border border-slate-400/60 flex flex-col items-center justify-end pb-1.5 text-[10px] font-mono transition relative z-10 ${bgClass} ${
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

                        {/* 2. Overlaid 3D Black Keys Layer (Db, Eb, F#, Ab, Bb across C2–C6) */}
                        {blackKeys.map(({ midi, leftWhiteIndex }) => {
                          const noteName = midiToNoteName(midi);
                          const isBass = activeBassMidis.has(midi);
                          const isRight = activeRightMidis.has(midi);
                          const isVocal = activeVocalMidis.has(midi);
                          const isArpNow = activeHighlightMidi === midi;

                          const leftPct = (leftWhiteIndex + 1) * whiteKeyWidthPct - blackKeyWidthPct / 2;

                          let blackBgClass =
                            'bg-gradient-to-b from-[#262B42] via-[#151828] to-[#0A0C14] hover:from-[#333A58] text-slate-300/80 border border-white/20 shadow-[0_5px_10px_rgba(0,0,0,0.75)]';
                          if (isArpNow) {
                            blackBgClass =
                              'bg-emerald-400 text-black font-extrabold border-white shadow-[0_0_16px_#34D399]';
                          } else if (isBass) {
                            blackBgClass =
                              'bg-gradient-to-b from-blue-400 to-blue-600 text-white font-extrabold border-blue-200 shadow-[0_0_15px_#3B82F6]';
                          } else if (isRight) {
                            blackBgClass =
                              'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-extrabold border-amber-100 shadow-[0_0_15px_#F59E0B]';
                          }

                          return (
                            <button
                              key={midi}
                              type="button"
                              title={`Phím đen ${noteName}`}
                              onClick={() => handlePlaySingleNote(noteName)}
                              style={{
                                left: `${leftPct}%`,
                                width: `${blackKeyWidthPct}%`,
                              }}
                              className={`absolute top-0 h-[62%] z-20 rounded-b-md flex flex-col items-center justify-end pb-1.5 text-[9px] font-mono transition ${blackBgClass} ${
                                isVocal ? 'ring-2 ring-cyan-300' : ''
                              }`}
                            >
                              {isVocal && (
                                <span className="w-2 h-2 rounded-full bg-cyan-300 mb-0.5 shadow-[0_0_8px_#22D3EE]" />
                              )}
                              <span className="leading-none tracking-tighter">{noteName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: CHORD-OVER-LYRICS & MELODY LEAD SHEET */}
              {resultSubTab === 'lyrics-leadsheet' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1C203B]/80 border border-white/12 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A78BFA]" />
                        <span>
                          {lang === 'vi'
                            ? 'Bản Nhạc Hợp Âm & Nốt Giai Điệu Trên Từng Chữ (Toàn Bộ Bài Hát)'
                            : 'Full-Song Interactive Chord-over-Lyrics Lead Sheet'}
                        </span>
                      </h4>
                      <p className="text-xs text-[#CBD5E1]">
                        {lang === 'vi'
                          ? 'Hỗ trợ AI nghe trọn vẹn bài dài (lên tới 6 phút) để chép lời Tiếng Việt/Anh hoặc dán lời để tự khớp hợp âm'
                          : 'AI listens up to 6 minutes of audio to transcribe lyrics & chords, or paste lyrics for instant alignment'}
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
                              ? 'AI Đang Nghe Cả Bài & Chép Lời...'
                              : 'AI Transcribing Full Song...'
                            : lang === 'vi'
                            ? '✨ AI Nghe Cả Bài & Chép Lời (Gemini Audio)'
                            : '✨ AI Full-Song Lyrics Transcribe'}
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

                  {showApiKeyBox && (
                    <div className="p-4 rounded-2xl bg-[#15192C] border border-[#F59E0B]/40 space-y-2">
                      <div className="text-xs font-bold text-[#FBBF24]">
                        {lang === 'vi'
                          ? '🔑 Nhập Google Gemini API Key (Miễn phí tại aistudio.google.com - Lưu cục bộ trên trình duyệt):'
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

                  {showLyricsEditor && (
                    <div className="p-4 rounded-2xl bg-[#15192C] border border-[#38BDF8]/40 space-y-3">
                      <span className="text-xs font-bold text-[#38BDF8] block">
                        {lang === 'vi'
                          ? '📝 Dán lời bài hát đầy đủ tại đây (Mỗi câu 1 dòng — Hệ thống tự động chia đều & gắn Hợp âm + Nốt nhạc theo toàn bộ bài):'
                          : '📝 Paste full song lyrics line by line for automatic chord & melody alignment:'}
                      </span>
                      <textarea
                        rows={6}
                        value={customLyricsInput}
                        onChange={(e) => setCustomLyricsInput(e.target.value)}
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

                  <div className="p-5 rounded-2xl bg-[#15192C]/95 border border-white/12 space-y-4 max-h-96 overflow-y-auto">
                    {analysisResult.lyricLines.map((line, lIdx) => {
                      const matchingSegIdx = analysisResult.segments.findIndex(
                        (s) => Math.abs(s.startTime - line.startTime) < 1.1
                      );
                      const segIdx =
                        matchingSegIdx !== -1 ? matchingSegIdx : lIdx % analysisResult.segments.length;
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
                              ⏱️ {formatClock(line.startTime)} – {formatClock(line.endTime)}
                            </span>
                            {seg && (
                              <span className="text-amber-300">
                                🎹 Rải: <strong>{seg.arpeggioSequence.join(' → ')}</strong>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-end gap-x-3 gap-y-4 leading-relaxed">
                            {line.tokens.map((tok, tIdx) => (
                              <div key={tIdx} className="inline-flex flex-col items-start">
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

              {/* SUB-VIEW 3: 3 REHARMONIZED ACCOMPANIMENT OPTIONS */}
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
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-bold inline-block">
                              {opt.styleBadge}
                            </span>

                            <h5 className="text-sm font-bold text-[#F8FAFC] font-serif">
                              {lang === 'vi' ? opt.titleVi : opt.titleEn}
                            </h5>

                            <p className="text-xs text-[#CBD5E1] line-clamp-2">
                              {lang === 'vi' ? opt.descriptionVi : opt.descriptionEn}
                            </p>

                            <div className="p-2.5 rounded-xl bg-[#15192C] border border-white/10 text-xs font-mono font-bold text-[#FBBF24] max-h-20 overflow-y-auto">
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
                  ? '100% On-Device Streaming DSP: Thu âm không giới hạn thời gian & bóc nốt trực tiếp trên RAM trình duyệt, không lưu trữ nhạc ra ngoài.'
                  : '100% On-Device Streaming DSP: Unlimited duration audio analysis runs locally in browser memory.'}
              </span>
            </div>
            {analysisResult && !isCapturingLive && (
              <button
                onClick={() =>
                  handleApply(
                    analysisResult.accompaniments[0]?.progressionFormula || analysisResult.rawFormula,
                    analysisResult.detectedKey,
                    'pop-ballad'
                  )
                }
                className="pressable px-3.5 py-1.5 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs shrink-0 flex items-center gap-1"
              >
                <span>{lang === 'vi' ? 'Nạp Lên Đàn 88 Phím' : 'Load to 88-Key Piano'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
