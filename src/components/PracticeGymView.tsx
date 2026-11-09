import React, { useState, useCallback } from 'react';
import { Language, VoicedChord } from '../types/harmony';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { voiceSingleChord } from '../engine/voiceLeadingSolver';
import {
  Target,
  Ear,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  Keyboard,
} from 'lucide-react';

interface PracticeGymViewProps {
  chords: VoicedChord[];
  keyRoot: string;
  lang?: Language;
}

type GymSubTab = 'wait-for-note' | 'ear-training';

const QUIZ_BANK: Array<{
  symbol: string;
  titleVi: string;
  titleEn: string;
  colorVi: string;
  colorEn: string;
  distractors: Array<{ id: string; labelVi: string; labelEn: string; colorVi: string; colorEn: string }>;
}> = [
  {
    symbol: 'Cmaj9',
    titleVi: 'Hợp Âm Trưởng 9 (Maj9)',
    titleEn: 'Major 9th Chord (Maj9)',
    colorVi: 'Mơ màng, lãng mạn, êm dịu phong cách Ballad / Lo-Fi',
    colorEn: 'Dreamy, lush, modern romantic acoustic warmth',
    distractors: [
      { id: 'm11', labelVi: 'Hợp Âm Thứ 11 (m11)', labelEn: 'Minor 11th (m11)', colorVi: 'U buồn, sâu lắng kiểu Neo-Soul', colorEn: 'Deep contemplative Neo-Soul melancholy' },
      { id: '7alt', labelVi: 'Hợp âm 7 Altered (7#9b13)', labelEn: 'Altered Dominant (7alt)', colorVi: 'Căng thẳng, xoắn gai góc Jazz Bebop', colorEn: 'Tense, dark angular jazz tension' },
      { id: 'dim7', labelVi: 'Hợp Âm Giảm 7 (dim7)', labelEn: 'Diminished 7th (dim7)', colorVi: 'Bí ẩn, kịch tính, bất an điện ảnh', colorEn: 'Suspenseful, cinematic film noir tension' },
    ],
  },
  {
    symbol: 'Dm11',
    titleVi: 'Hợp Âm Thứ 11 (m11)',
    titleEn: 'Minor 11th Chord (m11)',
    colorVi: 'Sâu lắng, mở rộng, không gian vũ trụ Neo-Soul',
    colorEn: 'Deep, open modal quartal space and calm melancholy',
    distractors: [
      { id: 'maj9', labelVi: 'Hợp Âm Trưởng 9 (Maj9)', labelEn: 'Major 9th (Maj9)', colorVi: 'Tươi sáng, êm dịu, ngọt ngào', colorEn: 'Bright, sweet, sunny acoustic warmth' },
      { id: '7b9', labelVi: 'Hợp Âm Dominant 7b9', labelEn: 'Dominant 7b9', colorVi: 'Gắt gỏng, chuẩn bị hút về bậc I', colorEn: 'Harsh, biting pull towards resolution' },
      { id: 'm6', labelVi: 'Hợp Âm Thứ 6 (m6)', labelEn: 'Minor 6th (m6)', colorVi: 'Bí hiểm, điệp viên 007 hoài niệm', colorEn: 'Mysterious, classic spy noir harmonic color' },
    ],
  },
  {
    symbol: 'G13',
    titleVi: 'Hợp Âm Dominant 13 (V13)',
    titleEn: 'Dominant 13th Chord (V13)',
    colorVi: 'Sang trọng, rực rỡ, tinh tế bậc V phong cách Jazz / Bossa',
    colorEn: 'Sophisticated, sparkling, rich dominant extension',
    distractors: [
      { id: 'dim7', labelVi: 'Hợp Âm Giảm 7 (dim7)', labelEn: 'Diminished 7th (dim7)', colorVi: 'Bất an, hoang mang, kịch tính', colorEn: 'Dramatic tension, unstable and suspended' },
      { id: 'maj7', labelVi: 'Hợp Âm Trưởng 7 (Maj7)', labelEn: 'Major 7th (Maj7)', colorVi: 'Êm đềm, an toàn, ổn định', colorEn: 'Peaceful, stable and settled' },
      { id: 'm9', labelVi: 'Hợp Âm Thứ 9 (m9)', labelEn: 'Minor 9th (m9)', colorVi: 'Trầm ngâm, tĩnh lặng', colorEn: 'Quiet, introspective mood' },
    ],
  },
  {
    symbol: 'Db7#11',
    titleVi: 'Thay Thế Tritone Lydian Dominant (7#11)',
    titleEn: 'Tritone Sub Lydian Dominant (7#11)',
    colorVi: 'Sắc sảo, ảo diệu, màu phim khoa học viễn tưởng',
    colorEn: 'Sharp, iridescent, exotic sci-fi mystery',
    distractors: [
      { id: 'maj9', labelVi: 'Trưởng 9 (Maj9)', labelEn: 'Major 9th (Maj9)', colorVi: 'Mộc mạc, bình yên', colorEn: 'Gentle and simple' },
      { id: 'sus4', labelVi: 'Treo 4 (sus4)', labelEn: 'Suspended 4th (sus4)', colorVi: 'Chờ đợi, trung tính', colorEn: 'Neutral open longing' },
      { id: 'm7b5', labelVi: 'Nửa Giảm (Half-Diminished)', labelEn: 'Half-Diminished (m7b5)', colorVi: 'U sầu, mong manh', colorEn: 'Fragile bittersweet longing' },
    ],
  },
];

export const PracticeGymView: React.FC<PracticeGymViewProps> = ({
  chords,
  keyRoot,
  lang = 'vi',
}) => {
  const [activeTab, setActiveTab] = useState<GymSubTab>('wait-for-note');

  // --- WAIT FOR NOTE STATE ---
  const [practiceChordIndex, setPracticeChordIndex] = useState<number>(0);
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeChords = chords.length > 0 ? chords : [];
  const currentPracticeChord = safeChords[practiceChordIndex] || null;

  const handleSimulateNoteSuccess = useCallback(() => {
    if (!currentPracticeChord) return;

    pianoAudioEngine.playVoicedChord(currentPracticeChord, 'block');
    setStreak((prev) => prev + 1);
    setFeedback(lang === 'vi' ? '🎉 Chính xác! Độ mượt hoàn hảo!' : '🎉 Perfect voice-leading hit!');

    setTimeout(() => {
      setFeedback(null);
      setPracticeChordIndex((prev) => {
        if (prev + 1 >= safeChords.length) {
          setCompletedRounds((r) => r + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 800);
  }, [currentPracticeChord, safeChords.length, lang]);

  const handleAuditionCurrent = () => {
    if (currentPracticeChord) {
      pianoAudioEngine.playVoicedChord(currentPracticeChord, 'block');
    }
  };

  // --- EAR TRAINING QUIZ STATE ---
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  const currentQuizData = QUIZ_BANK[quizIndex % QUIZ_BANK.length];

  const currentQuizChord = React.useMemo(() => {
    return voiceSingleChord(currentQuizData.symbol, keyRoot);
  }, [currentQuizData.symbol, keyRoot]);

  const playQuizAudio = useCallback(() => {
    const fakeChord: VoicedChord = {
      id: `quiz-${currentQuizData.symbol}`,
      symbol: currentQuizData.symbol,
      romanDegree: '',
      functionRole: 'primary',
      leftHand: currentQuizChord.leftHand,
      rightHand: currentQuizChord.rightHand,
      voiceLeading: currentQuizChord.voiceLeading,
      explanation: {
        ruleId: 'quiz',
        title: currentQuizData.titleVi,
        titleEn: currentQuizData.titleEn,
        whySmooth: '',
        whySmoothEn: '',
        fingerTip: '',
        fingerTipEn: '',
        emotionTag: currentQuizData.colorVi,
        emotionTagEn: currentQuizData.colorEn,
      },
      beats: 4,
    };
    pianoAudioEngine.playVoicedChord(fakeChord, 'ballad-arpeggio');
  }, [currentQuizChord, currentQuizData]);

  const handleSelectAnswer = (id: string, isCorrect: boolean) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(id);
    setIsAnswerRevealed(true);

    if (isCorrect) {
      setQuizScore((prev) => prev + 10);
      setQuizStreak((prev) => prev + 1);
    } else {
      setQuizStreak(0);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setQuizIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Pills & Score Banner */}
      <div className="p-4 md:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E5DFD7] dark:border-[#292524] shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4] tracking-tight font-serif">
              {lang === 'vi' ? 'Phòng Luyện Phím & Cảm Âm (Gym)' : 'Practice Gym & Ear Training'}
            </h2>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              {lang === 'vi'
                ? 'Luyện phản xạ cơ ngón tay với cơ chế Wait-for-Note & Trắc nghiệm nhận diện màu hòa thanh'
                : 'Muscle memory reinforcement with Wait-for-Note & harmonic color recognition quiz'}
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-[#FAF8F5] dark:bg-[#12100E] p-1 rounded-xl border border-[#E5DFD7] dark:border-[#292524] text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('wait-for-note')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'wait-for-note'
                ? 'bg-[#FFFFFF] dark:bg-[#292524] text-[#D97706] dark:text-[#F59E0B] font-bold shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Luyện Phím Chờ Nốt' : 'Wait-for-Note Practice'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ear-training');
              playQuizAudio();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ear-training'
                ? 'bg-[#FFFFFF] dark:bg-[#292524] text-[#2563EB] dark:text-[#60A5FA] font-bold shadow-xs'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Ear className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Cảm Âm Màu Sắc' : 'Chord Color Quiz'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: WAIT FOR NOTE */}
      {activeTab === 'wait-for-note' && (
        <div className="space-y-4">
          {/* Practice HUD Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E5DFD7] dark:border-[#292524] shadow-sm space-y-6 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F1EB] dark:border-[#292524] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                  {lang === 'vi' ? 'Luyện Phím Theo Hợp Âm:' : 'Follow Chord Target:'}
                </span>
                <span className="text-xl md:text-2xl font-extrabold font-serif text-[#D97706] dark:text-[#F59E0B]">
                  {currentPracticeChord?.symbol || 'Dm9'}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#12100E] text-[#2563EB] dark:text-[#60A5FA] border border-[#E5DFD7] dark:border-[#292524]">
                  {currentPracticeChord?.romanDegree || 'ii9'}
                </span>
              </div>

              {/* Score & Streak */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 text-xs font-bold text-[#B45309] dark:text-[#FDE68A]">
                  <Flame className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
                  <span>Streak: {streak}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#BFDBFE] dark:border-[#3B82F6]/40 text-xs font-bold text-[#1D4ED8] dark:text-[#93C5FD]">
                  <Trophy className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>Rounds: {completedRounds}</span>
                </div>
              </div>
            </div>

            {/* Target Hands Breakdown */}
            {currentPracticeChord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left hand */}
                <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 border border-[#BFDBFE] dark:border-[#1E3A8A]/40 space-y-2">
                  <span className="text-xs font-bold text-[#1D4ED8] dark:text-[#60A5FA] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    {lang === 'vi' ? 'Tay trái (Bass):' : 'Left Hand (Bass):'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentPracticeChord.leftHand.map((n, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] font-mono font-bold text-sm text-[#1D4ED8] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A8A]/40 shadow-xs"
                      >
                        {n.noteName} ({n.role})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right hand */}
                <div className="p-4 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#78350F]/40 space-y-2">
                  <span className="text-xs font-bold text-[#B45309] dark:text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    {lang === 'vi' ? 'Tay phải (Thế bấm):' : 'Right Hand (Voicing):'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentPracticeChord.rightHand.map((n, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] font-mono font-bold text-sm text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#78350F]/40 shadow-xs"
                      >
                        {n.noteName} ({n.role})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback message banner */}
            {feedback && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Interactive Controller Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleAuditionCurrent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] text-xs font-bold hover:bg-[#EDE8E1] dark:hover:bg-[#292524] transition shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
                <span>{lang === 'vi' ? 'Nghe Mẫu Hợp Âm Này' : 'Listen to Target Voicing'}</span>
              </button>

              <button
                onClick={handleSimulateNoteSuccess}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold text-sm shadow-md hover:from-[#F59E0B] hover:to-[#D97706] transition"
              >
                <span>{lang === 'vi' ? 'Đã Bấm Xong (Tiếp Theo →)' : 'Hit Notes (Next Chord →)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CHORD COLOR EAR TRAINING QUIZ */}
      {activeTab === 'ear-training' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E5DFD7] dark:border-[#292524] shadow-sm space-y-6 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F1EB] dark:border-[#292524] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F5F5F4] flex items-center gap-2 font-serif">
                  <Ear className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>{lang === 'vi' ? 'Nghe & Nhận Diện Màu Sắc Hợp Âm' : 'Listen & Identify Harmonic Color'}</span>
                </h3>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  {lang === 'vi'
                    ? 'Lắng nghe hợp âm bí ẩn và đoán đúng tính chất cảm xúc'
                    : 'Listen to the mystery chord and identify its harmonic color family'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#BFDBFE] dark:border-[#3B82F6]/40 text-xs font-bold text-[#1D4ED8] dark:text-[#93C5FD]">
                  <Trophy className="w-4 h-4 text-[#2563EB]" />
                  <span>Điểm: {quizScore}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 text-xs font-bold text-[#B45309] dark:text-[#FDE68A]">
                  <Flame className="w-4 h-4 text-[#D97706]" />
                  <span>Streak: {quizStreak}</span>
                </div>
              </div>
            </div>

            {/* Mystery Audio Player Button */}
            <div className="text-center py-6 bg-[#FAF8F5] dark:bg-[#12100E] rounded-xl border border-[#E5DFD7] dark:border-[#292524] space-y-3">
              <button
                onClick={playQuizAudio}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-[#2563EB]/25 transition"
              >
                <Volume2 className="w-5 h-5" />
                <span>{lang === 'vi' ? '🔊 Nghe Lại Âm Thanh Bí Ẩn' : '🔊 Replay Mystery Chord'}</span>
              </button>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                {lang === 'vi' ? 'Âm sắc: Ballad Arpeggio • Key ' + keyRoot : 'Tone: Ballad Arpeggio in key of ' + keyRoot}
              </div>
            </div>

            {/* Multiple Choice Question Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Correct option */}
              <button
                onClick={() => handleSelectAnswer('correct', true)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  isAnswerRevealed
                    ? selectedAnswer === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                    : 'bg-[#FAF8F5] dark:bg-[#12100E] border-[#E5DFD7] dark:border-[#292524] hover:border-[#D97706] text-[#1C1917] dark:text-[#F5F5F4]'
                }`}
              >
                <div className="font-bold text-sm font-serif">
                  {lang === 'vi' ? currentQuizData.titleVi : currentQuizData.titleEn}
                </div>
                <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
                  {lang === 'vi' ? currentQuizData.colorVi : currentQuizData.colorEn}
                </div>
              </button>

              {/* Distractors */}
              {currentQuizData.distractors.map((dist) => {
                const isSelectedThis = selectedAnswer === dist.id;
                return (
                  <button
                    key={dist.id}
                    onClick={() => handleSelectAnswer(dist.id, false)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      isAnswerRevealed
                        ? isSelectedThis
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                          : 'opacity-50 bg-[#FAF8F5] dark:bg-[#12100E] border-[#E5DFD7] dark:border-[#292524]'
                        : 'bg-[#FAF8F5] dark:bg-[#12100E] border-[#E5DFD7] dark:border-[#292524] hover:border-[#D97706] text-[#1C1917] dark:text-[#F5F5F4]'
                    }`}
                  >
                    <div className="font-bold text-sm font-serif">
                      {lang === 'vi' ? dist.labelVi : dist.labelEn}
                    </div>
                    <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
                      {lang === 'vi' ? dist.colorVi : dist.colorEn}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer Reveal Feedback & Next Button */}
            {isAnswerRevealed && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F5F1EB] dark:border-[#292524]">
                <div className="flex items-center gap-2">
                  {selectedAnswer === 'correct' ? (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{lang === 'vi' ? 'Chính xác! +10 điểm' : 'Correct! +10 points'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="w-5 h-5" />
                      <span>{lang === 'vi' ? 'Chưa đúng rồi! Đây là ' + currentQuizData.symbol : 'Incorrect! It was ' + currentQuizData.symbol}</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextQuiz}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F5F4] text-white dark:text-[#1C1917] font-bold text-xs hover:bg-[#292524] transition shadow-xs"
                >
                  <span>{lang === 'vi' ? 'Câu hỏi tiếp theo' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeGymView;
