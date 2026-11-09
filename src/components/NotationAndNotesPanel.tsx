import React, { useEffect, useRef, useState } from 'react';
import { Language, VoicedChord } from '../types/harmony';
import { Renderer, Stave, StaveNote, Formatter, StaveConnector, Voice } from 'vexflow';
import { t } from '../i18n/translations';
import { Music, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react';

interface NotationAndNotesPanelProps {
  activeChord: VoicedChord | null;
  lang?: Language;
}

export const NotationAndNotesPanel: React.FC<NotationAndNotesPanelProps> = ({
  activeChord,
  lang = 'vi',
}) => {
  const vexflowRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!vexflowRef.current || !activeChord) return;

    vexflowRef.current.innerHTML = '';

    try {
      const container = vexflowRef.current;
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(280, 210);
      const context = renderer.getContext();

      // Treble Stave (Right Hand)
      const topStave = new Stave(15, 10, 240);
      topStave.addClef('treble');
      topStave.setContext(context).draw();

      // Bass Stave (Left Hand)
      const bottomStave = new Stave(15, 100, 240);
      bottomStave.addClef('bass');
      bottomStave.setContext(context).draw();

      // Connector (Brace)
      const brace = new StaveConnector(topStave, bottomStave);
      brace.setType(StaveConnector.type.BRACE);
      brace.setContext(context).draw();

      const lineLeft = new StaveConnector(topStave, bottomStave);
      lineLeft.setType(StaveConnector.type.SINGLE_LEFT);
      lineLeft.setContext(context).draw();

      const lineRight = new StaveConnector(topStave, bottomStave);
      lineRight.setType(StaveConnector.type.SINGLE_RIGHT);
      lineRight.setContext(context).draw();

      // Build VexFlow Treble Note (Right Hand chord)
      const rhKeys = activeChord.rightHand.map((n) => {
        const octave = n.noteName.slice(-1);
        const pitch = n.pitchClass.toLowerCase();
        return `${pitch}/${octave}`;
      });

      if (rhKeys.length > 0) {
        const trebleChordNote = new StaveNote({
          clef: 'treble',
          keys: rhKeys,
          duration: 'w',
        });

        trebleChordNote.setStyle({ fillStyle: '#D97706', strokeStyle: '#D97706' });

        const trebleVoice = new Voice({ numBeats: 4, beatValue: 4 });
        trebleVoice.addTickables([trebleChordNote]);

        new Formatter().joinVoices([trebleVoice]).formatToStave([trebleVoice], topStave);
        trebleVoice.draw(context, topStave);
      }

      // Build VexFlow Bass Note (Left Hand)
      const lhKeys = activeChord.leftHand.map((n) => {
        const octave = n.noteName.slice(-1);
        const pitch = n.pitchClass.toLowerCase();
        return `${pitch}/${octave}`;
      });

      if (lhKeys.length > 0) {
        const bassChordNote = new StaveNote({
          clef: 'bass',
          keys: lhKeys,
          duration: 'w',
        });

        bassChordNote.setStyle({ fillStyle: '#2563EB', strokeStyle: '#2563EB' });

        const bassVoice = new Voice({ numBeats: 4, beatValue: 4 });
        bassVoice.addTickables([bassChordNote]);

        new Formatter().joinVoices([bassVoice]).formatToStave([bassVoice], bottomStave);
        bassVoice.draw(context, bottomStave);
      }
    } catch {
      // Graceful fallback for non-browser / headless test environments
    }
  }, [activeChord]);

  const handleCopyVoicing = () => {
    if (!activeChord) return;
    const lhText = activeChord.leftHand.map((n) => `${n.noteName} (${n.role})`).join(', ');
    const rhText = activeChord.rightHand.map((n) => `${n.noteName} (${n.role})`).join(', ');
    const text = `Hợp âm / Chord: ${activeChord.symbol} (${activeChord.romanDegree})\nTay trái / Left Hand (Bass): ${lhText}\nTay phải / Right Hand (Voicing): ${rhText}\nĐộ mượt / Smoothness Score: ${activeChord.voiceLeading.smoothnessScore}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeChord) {
    return (
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD7] text-[#78716C] text-xs">
        {lang === 'vi' ? 'Chọn hợp âm để xem khuông nhạc & nốt bấm' : 'Select a chord to view sheet notation & note voicings'}
      </div>
    );
  }

  const { leftHand, rightHand, voiceLeading } = activeChord;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl p-4 md:p-6 shadow-sm">
      {/* Column 1: Literal Note Names & Hands Readout */}
      <div className="md:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
            <Music className="w-4 h-4 text-[#D97706]" />
            {t('voicingDetailTitle', lang)}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyVoicing}
              title={t('copyVoicingBtn', lang)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F1EB] text-xs font-semibold text-[#1C1917] border border-[#E5DFD7] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#78716C]" />}
              <span>{copied ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Copy nốt' : 'Copy notes')}</span>
            </button>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              {activeChord.symbol} ({activeChord.romanDegree})
            </span>
          </div>
        </div>

        {/* Left hand & Right hand pill lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Hand */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-blue-200 space-y-2">
            <div className="text-sm font-bold text-[#2563EB] flex items-center justify-between">
              <span>{t('leftHand', lang)}:</span>
              <span className="text-xs text-[#78716C]">{t('lhRange', lang)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {leftHand.map((n, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1D4ED8] border border-blue-200 text-sm font-bold font-mono"
                >
                  {n.noteName}{' '}
                  <span className="text-xs font-normal opacity-90">({n.role})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Hand */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-amber-200 space-y-2">
            <div className="text-sm font-bold text-[#D97706] flex items-center justify-between">
              <span>{t('rightHand', lang)}:</span>
              <span className="text-xs text-[#78716C]">{t('rhRange', lang)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rightHand.map((n, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#B45309] border border-amber-200 text-sm font-bold font-mono"
                >
                  {n.noteName}{' '}
                  <span className="text-xs font-normal opacity-90">({n.role})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Finger movement diff readout */}
        <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD7] text-sm space-y-2">
          <div className="font-semibold text-[#1C1917] flex items-center justify-between">
            <span>{t('movementDiffTitle', lang)}</span>
            <span className="text-[#10B981] font-mono font-bold">
              {t('smoothScore', lang)}: {voiceLeading.smoothnessScore}/100
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[#78716C] text-xs">
            {voiceLeading.keptNotes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{t('keptNotesLabel', lang)}</span>
                <span className="font-mono font-bold text-[#065F46]">
                  {voiceLeading.keptNotes.join(', ')}
                </span>
              </div>
            )}

            {voiceLeading.movedNotes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span>{t('movedNotesLabel', lang)}</span>
                {voiceLeading.movedNotes.map((m, idx) => (
                  <span
                    key={idx}
                    className="font-mono px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#1C1917] border border-[#E5DFD7] flex items-center gap-1 text-[10px]"
                  >
                    {m.fromNote} <ArrowRight className="w-2.5 h-2.5 text-[#D97706]" /> {m.toNote} (
                    {m.semitones > 0 ? `+${m.semitones}` : m.semitones})
                  </span>
                ))}
              </div>
            )}

            {voiceLeading.keptNotes.length === 0 && voiceLeading.movedNotes.length === 0 && (
              <span className="text-[#A8A29E] italic">{t('firstChordLabel', lang)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: VexFlow Grand Staff Notation */}
      <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD7]">
        <div className="text-xs font-semibold text-[#78716C] mb-1 w-full text-left flex items-center justify-between">
          <span>{t('grandStaffTitle', lang)}</span>
          <span className="text-[10px] text-[#A8A29E] font-mono">VexFlow 5 SVG</span>
        </div>
        <div
          ref={vexflowRef}
          className="flex items-center justify-center w-full min-h-[190px] overflow-hidden"
        />
      </div>
    </div>
  );
};
