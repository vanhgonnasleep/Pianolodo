import React, { useEffect, useRef } from 'react';
import { VoicedChord } from '../types/harmony';
import { Renderer, Stave, StaveNote, Formatter, StaveConnector, Voice } from 'vexflow';
import { Music, CheckCircle2, ArrowRight } from 'lucide-react';

interface NotationAndNotesPanelProps {
  activeChord: VoicedChord | null;
}

export const NotationAndNotesPanel: React.FC<NotationAndNotesPanelProps> = ({ activeChord }) => {
  const vexflowRef = useRef<HTMLDivElement>(null);

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

        trebleChordNote.setStyle({ fillStyle: '#f59e0b', strokeStyle: '#f59e0b' });

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

        bassChordNote.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#3b82f6' });

        const bassVoice = new Voice({ numBeats: 4, beatValue: 4 });
        bassVoice.addTickables([bassChordNote]);

        new Formatter().joinVoices([bassVoice]).formatToStave([bassVoice], bottomStave);
        bassVoice.draw(context, bottomStave);
      }
    } catch {
      // Graceful fallback for non-browser / headless test environments
    }
  }, [activeChord]);

  if (!activeChord) {
    return (
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        Chọn hợp âm để xem khuông nhạc & nốt bấm
      </div>
    );
  }

  const { leftHand, rightHand, voiceLeading } = activeChord;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900 border-b border-slate-800 p-4 md:p-5">
      {/* Column 1: Literal Note Names & Hands Readout */}
      <div className="md:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            Chi Tiết Nốt Bấm Từng Tay (Finger Voicing)
          </h3>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {activeChord.symbol} ({activeChord.romanDegree})
          </span>
        </div>

        {/* Left hand & Right hand pill lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Hand */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 space-y-2">
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
              <span>Tay trái (Bass):</span>
              <span className="text-[10px] text-slate-400">Quãng trầm C2 - B3</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {leftHand.map((n, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono"
                >
                  {n.noteName}{' '}
                  <span className="text-[10px] font-normal opacity-80">({n.role})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Hand */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Tay phải (Voicing):</span>
              <span className="text-[10px] text-slate-400">Quãng giữa E4 - D5</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rightHand.map((n, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono"
                >
                  {n.noteName}{' '}
                  <span className="text-[10px] font-normal opacity-80">({n.role})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Finger movement diff readout */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span>Chuyển động ngón tay so với hợp âm trước:</span>
            <span className="text-emerald-400 font-mono font-bold">
              Độ mượt: {voiceLeading.smoothnessScore}/100
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
            {voiceLeading.keptNotes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Giữ nguyên ngón:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {voiceLeading.keptNotes.join(', ')}
                </span>
              </div>
            )}

            {voiceLeading.movedNotes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span>Dịch ngón:</span>
                {voiceLeading.movedNotes.map((m, idx) => (
                  <span
                    key={idx}
                    className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 text-[10px]"
                  >
                    {m.fromNote} <ArrowRight className="w-2.5 h-2.5 text-amber-400" /> {m.toNote} (
                    {m.semitones > 0 ? `+${m.semitones}` : m.semitones})
                  </span>
                ))}
              </div>
            )}

            {voiceLeading.keptNotes.length === 0 && voiceLeading.movedNotes.length === 0 && (
              <span className="text-slate-500 italic">Hợp âm đầu tiên trong vòng</span>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: VexFlow Grand Staff Notation */}
      <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 mb-1 w-full text-left flex items-center justify-between">
          <span>Khuông Nhạc Đôi (Grand Staff):</span>
          <span className="text-[10px] text-slate-500">VexFlow 5 SVG</span>
        </div>
        <div
          ref={vexflowRef}
          className="flex items-center justify-center w-full min-h-[190px] overflow-hidden"
        />
      </div>
    </div>
  );
};
