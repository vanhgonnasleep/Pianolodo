import React, { useState } from 'react';
import { CurriculumRule, RuleCategory, VoicedChord } from '../types/harmony';
import { CURRICULUM_RULES } from '../data/curriculum';
import { Lightbulb, Hand, Heart, BookOpen, X, Sparkles } from 'lucide-react';

interface ExplanationAndCurriculumProps {
  activeChord: VoicedChord | null;
  isCurriculumOpen: boolean;
  onCloseCurriculum: () => void;
  onSelectProgressionFormula?: (formula: string) => void;
}

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  extension: 'Hợp Âm Màu (Color Extensions)',
  'slash-bass': 'Đi Bass Liền Bậc (Slash Chords)',
  'secondary-dominant': 'Bậc V Phụ (Secondary Dominant)',
  'diminished-passing': 'Diminished Nửa Cung (Passing)',
  'tritone-sub': 'Thế Ba Cung (Tritone Sub)',
  'modal-interchange': 'Mượn Màu Giọng Thứ (Modal Borrow)',
};

export const ExplanationAndCurriculum: React.FC<ExplanationAndCurriculumProps> = ({
  activeChord,
  isCurriculumOpen,
  onCloseCurriculum,
  onSelectProgressionFormula,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRules =
    selectedCategory === 'all'
      ? CURRICULUM_RULES
      : CURRICULUM_RULES.filter((r) => r.category === selectedCategory);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Active Chord Explanation Section */}
      {activeChord && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white">{activeChord.symbol}</span>
              <span className="text-sm font-mono font-bold text-amber-400">
                ({activeChord.romanDegree})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeChord.explanation.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Cảm xúc: {activeChord.explanation.emotionTag}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why Smooth */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Tại sao nghe mượt? (Bản chất hòa thanh)
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {activeChord.explanation.whySmooth}
              </p>
            </div>

            {/* Finger Tip */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Hand className="w-4 h-4 text-blue-400" />
                Mẹo bấm ngón tay (Voice-Leading Tip)
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {activeChord.explanation.fingerTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Modal Drawer */}
      {isCurriculumOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Kho Giáo Trình & 12 Tuyệt Chiêu Hòa Thanh Piano Thực Chiến
                </h2>
                <p className="text-xs text-slate-400">
                  Đúc kết từ Berklee Contemporary Harmony & Mark Levine Jazz Piano Book
                </p>
              </div>
              <button
                onClick={onCloseCurriculum}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả (12 chiêu)
              </button>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Rules Grid */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRules.map((rule: CurriculumRule) => (
                  <div
                    key={rule.id}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-3 transition group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {CATEGORY_LABELS[rule.category]}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {rule.sourceBook}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                      {rule.titleVi}
                    </h4>

                    {/* Formula box */}
                    <div className="bg-slate-900 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 border border-slate-800">
                      {rule.formulaSummary}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{rule.whySmoothVi}</p>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] italic">
                        Ví dụ: {rule.exampleInC.before} → {rule.exampleInC.after}
                      </span>
                      {onSelectProgressionFormula && (
                        <button
                          onClick={() => {
                            onSelectProgressionFormula(rule.exampleInC.after);
                            onCloseCurriculum();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          Thử ngay
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
