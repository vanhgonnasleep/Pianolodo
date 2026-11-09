import React, { useState } from 'react';
import { CurriculumRule, Language, RuleCategory, VoicedChord } from '../types/harmony';
import { CURRICULUM_RULES } from '../data/curriculum';
import { t } from '../i18n/translations';
import { Lightbulb, Hand, Heart, BookOpen, X, Sparkles } from 'lucide-react';

interface ExplanationAndCurriculumProps {
  activeChord: VoicedChord | null;
  isCurriculumOpen: boolean;
  onCloseCurriculum: () => void;
  onSelectProgressionFormula?: (formula: string) => void;
  lang?: Language;
}

const CATEGORY_LABELS_VI: Record<RuleCategory, string> = {
  extension: 'Hợp Âm Màu (Color Extensions)',
  'slash-bass': 'Đi Bass Liền Bậc (Slash Chords)',
  'secondary-dominant': 'Bậc V Phụ (Secondary Dominant)',
  'diminished-passing': 'Diminished Nửa Cung (Passing)',
  'tritone-sub': 'Thế Ba Cung (Tritone Sub)',
  'modal-interchange': 'Mượn Màu Giọng Thứ (Modal Borrow)',
};

const CATEGORY_LABELS_EN: Record<RuleCategory, string> = {
  extension: 'Color Extensions (9th, 11th, 13th)',
  'slash-bass': 'Step-wise Slash Bass (Walkdowns)',
  'secondary-dominant': 'Secondary Dominants (V7/x)',
  'diminished-passing': 'Chromatic Passing Diminished',
  'tritone-sub': 'Tritone Substitution (bII7)',
  'modal-interchange': 'Modal Interchange (Minor Borrowing)',
};

export const ExplanationAndCurriculum: React.FC<ExplanationAndCurriculumProps> = ({
  activeChord,
  isCurriculumOpen,
  onCloseCurriculum,
  onSelectProgressionFormula,
  lang = 'vi',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryLabels = lang === 'vi' ? CATEGORY_LABELS_VI : CATEGORY_LABELS_EN;

  const filteredRules =
    selectedCategory === 'all'
      ? CURRICULUM_RULES
      : CURRICULUM_RULES.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Active Chord Explanation Section */}
      {activeChord && (
        <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5F1EB] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-[#1C1917]">{activeChord.symbol}</span>
              <span className="text-sm font-mono font-bold text-[#D97706]">
                ({activeChord.romanDegree})
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#57534E] border border-[#E5DFD7]">
                {lang === 'vi' ? activeChord.explanation.title : activeChord.explanation.titleEn || activeChord.explanation.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span>
                {t('emotionTag', lang)}{' '}
                {lang === 'vi'
                  ? activeChord.explanation.emotionTag
                  : activeChord.explanation.emotionTagEn || activeChord.explanation.emotionTag}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why Smooth */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#D97706] uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-[#D97706]" />
                <span>{t('whySmooth', lang)}</span>
              </div>
              <p className="text-sm md:text-base text-[#44403C] leading-relaxed">
                {lang === 'vi'
                  ? activeChord.explanation.whySmooth
                  : activeChord.explanation.whySmoothEn || activeChord.explanation.whySmooth}
              </p>
            </div>

            {/* Finger Tip */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2563EB] uppercase tracking-wider">
                <Hand className="w-4 h-4 text-[#2563EB]" />
                <span>{t('fingerTip', lang)}</span>
              </div>
              <p className="text-sm md:text-base text-[#44403C] leading-relaxed">
                {lang === 'vi'
                  ? activeChord.explanation.fingerTip
                  : activeChord.explanation.fingerTipEn || activeChord.explanation.fingerTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Modal Drawer */}
      {isCurriculumOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F5F1EB] flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#1C1917] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D97706]" />
                  {t('curriculumModalTitle', lang)}
                </h2>
                <p className="text-xs text-[#78716C]">
                  {t('curriculumModalDesc', lang)}
                </p>
              </div>
              <button
                onClick={onCloseCurriculum}
                className="p-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#78716C] hover:text-[#1C1917] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-4 border-b border-[#F5F1EB] bg-[#FAF8F5] flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-[#D97706] text-white'
                    : 'bg-[#FFFFFF] text-[#78716C] hover:text-[#1C1917] border border-[#E5DFD7]'
                }`}
              >
                {t('filterAll', lang)}
              </button>
              {Object.entries(categoryLabels).map(([cat, label]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#FFFFFF] text-[#78716C] hover:text-[#1C1917] border border-[#E5DFD7]'
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
                    className="bg-[#FAF8F5] border border-[#E5DFD7] hover:border-[#D97706] p-4 rounded-2xl space-y-3 transition group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        {categoryLabels[rule.category]}
                      </span>
                      <span className="text-[10px] text-[#A8A29E] font-mono">
                        {rule.sourceBook}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1C1917] group-hover:text-[#D97706] transition">
                      {lang === 'vi' ? rule.titleVi : rule.titleEn}
                    </h4>

                    {/* Formula box */}
                    <div className="bg-[#FFFFFF] px-3 py-2 rounded-xl text-xs font-mono text-[#D97706] font-semibold border border-[#E5DFD7]">
                      {rule.formulaSummary}
                    </div>

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {lang === 'vi' ? rule.whySmoothVi : rule.whySmoothEn}
                    </p>

                    <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between text-xs">
                      <span className="text-[#78716C] text-[11px] italic">
                        {lang === 'vi' ? 'Ví dụ' : 'Example'}: {rule.exampleInC.before} &rarr; {rule.exampleInC.after}
                      </span>
                      {onSelectProgressionFormula && (
                        <button
                          onClick={() => {
                            onSelectProgressionFormula(rule.exampleInC.after);
                            onCloseCurriculum();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#D97706] hover:text-white text-[#1C1917] text-xs font-semibold border border-[#E5DFD7] transition shadow-xs"
                        >
                          <Sparkles className="w-3 h-3 text-[#D97706] group-hover:text-white" />
                          {t('tryNow', lang)}
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
