import React, { useState } from 'react';
import { Language, RuleCategory } from '../types/harmony';
import { CURRICULUM_RULES } from '../data/curriculum';
import { BookOpen, Lightbulb, Hand, ArrowRight, Search, Heart } from 'lucide-react';

interface CurriculumViewProps {
  lang: Language;
  onSelectFormula: (formula: string) => void;
}

const CATEGORIES: { id: 'all' | RuleCategory; labelVi: string; labelEn: string }[] = [
  { id: 'all', labelVi: 'Tất cả 12 chiêu', labelEn: 'All 12 Rules' },
  { id: 'extension', labelVi: 'Hợp Âm Màu (9th, 11th, 13th)', labelEn: 'Color Extensions' },
  { id: 'slash-bass', labelVi: 'Bass Liền Bậc (Slash Chords)', labelEn: 'Step-wise Slash Bass' },
  { id: 'secondary-dominant', labelVi: 'Bậc V Phụ (Secondary Dom)', labelEn: 'Secondary Dominants' },
  { id: 'diminished-passing', labelVi: 'Diminished Nửa Cung (Passing)', labelEn: 'Passing Diminished' },
  { id: 'tritone-sub', labelVi: 'Thế Ba Cung (Tritone Sub)', labelEn: 'Tritone Sub' },
  { id: 'modal-interchange', labelVi: 'Mượn Màu Giọng Thứ (Modal Borrow)', labelEn: 'Modal Interchange' },
];

export const CurriculumView: React.FC<CurriculumViewProps> = ({ lang, onSelectFormula }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | RuleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = CURRICULUM_RULES.filter((rule) => {
    const matchCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchCategory;
    const matchText =
      rule.titleVi.toLowerCase().includes(query) ||
      rule.titleEn.toLowerCase().includes(query) ||
      rule.formulaSummary.toLowerCase().includes(query) ||
      rule.whySmoothVi.toLowerCase().includes(query);
    return matchCategory && matchText;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706]">
                Pianolodo Master Curriculum • 12 Rules
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              {lang === 'vi'
                ? 'Giáo Trình 12 Tuyệt Chiêu Hòa Thanh & Voicing Hiện Đại'
                : 'Modern Harmony Playbook: 12 Master Reharmonization Rules'}
            </h1>
            <p className="text-xs md:text-sm text-[#78716C] leading-relaxed">
              {lang === 'vi'
                ? 'Tổng hợp giải pháp cải tiến vòng hợp âm mộc mạc thành hòa thanh dầy dặn, sang trọng dựa trên giáo trình Berklee Contemporary Harmony và Mark Levine Jazz Piano.'
                : 'Comprehensive masterclass translating rigid triads into lush, velvety piano voicings based on Berklee and Mark Levine harmonic pedagogy.'}
            </p>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD7] px-3.5 py-2 rounded-xl text-xs w-full md:w-64 focus-within:border-[#D97706] transition shadow-xs">
            <Search className="w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm chiêu hòa thanh...' : 'Search techniques...'}
              className="bg-transparent text-[#1C1917] placeholder-[#A8A29E] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-[#F5F1EB] mt-6 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const label = lang === 'vi' ? cat.labelVi : cat.labelEn;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs font-bold'
                    : 'bg-[#FAF8F5] text-[#78716C] border-[#E5DFD7] hover:text-[#1C1917] hover:border-[#D1C8BD]'
                }`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredRules.map((rule, idx) => {
          const title = lang === 'vi' ? rule.titleVi : rule.titleEn;
          const emotion = lang === 'vi' ? rule.emotionTagVi : rule.emotionTagEn;
          const whySmooth = lang === 'vi' ? rule.whySmoothVi : rule.whySmoothEn;
          const fingerTip = lang === 'vi' ? rule.fingerTipVi : rule.fingerTipEn;

          return (
            <div
              key={rule.id}
              className="p-5 md:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] hover:border-[#D97706] transition space-y-4 shadow-sm flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Rule index, title, emotion tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-center font-mono font-bold text-xs text-[#D97706]">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-[#1C1917] group-hover:text-[#D97706] transition">
                      {title}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium flex items-center gap-1 shrink-0">
                    <Heart className="w-3 h-3 fill-current text-rose-500" />
                    <span>{emotion}</span>
                  </span>
                </div>

                {/* Formula Box */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] font-mono text-xs text-[#D97706] font-semibold flex items-center justify-between">
                  <span>{rule.formulaSummary}</span>
                  <span className="text-[10px] text-[#A8A29E] font-sans italic">
                    {rule.sourceBook}
                  </span>
                </div>

                {/* Why it sounds smooth */}
                <div className="space-y-1 text-xs leading-relaxed text-[#44403C]">
                  <div className="flex items-center gap-1.5 font-bold text-[#D97706] uppercase tracking-wider text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Bản chất nhạc lý' : 'Harmonic Principle'}</span>
                  </div>
                  <p className="pl-5 text-[#57534E]">{whySmooth}</p>
                </div>

                {/* Split Hands Finger Tip */}
                <div className="space-y-1 text-xs leading-relaxed text-[#44403C]">
                  <div className="flex items-center gap-1.5 font-bold text-[#2563EB] uppercase tracking-wider text-[11px]">
                    <Hand className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Mẹo bấm 2 tay (Ergonomics)' : 'Split-Hand Voicing Tip'}</span>
                  </div>
                  <p className="pl-5 text-[#57534E]">{fingerTip}</p>
                </div>
              </div>

              {/* Bottom Action: Try in Studio */}
              <div className="pt-3 border-t border-[#F5F1EB] flex items-center justify-between">
                <span className="text-[11px] text-[#78716C]">
                  Ví dụ Tone C: <strong className="text-[#1C1917] font-mono">{rule.exampleInC.before}</strong> ➔ <strong className="text-[#D97706] font-mono">{rule.exampleInC.after}</strong>
                </span>

                <button
                  onClick={() => onSelectFormula(rule.formulaSummary)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#D97706] text-[#1C1917] hover:text-white border border-[#E5DFD7] text-xs font-semibold transition shadow-xs"
                >
                  <span>{lang === 'vi' ? 'Thử trong Studio' : 'Open in Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
