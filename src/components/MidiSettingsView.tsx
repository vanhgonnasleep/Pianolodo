import React, { useState, useEffect } from 'react';
import { InstrumentToneType, pianoAudioEngine } from '../audio/pianoAudioEngine';
import { Language } from '../types/harmony';
import { Sliders, Volume2, Sparkles, Radio, Check, Activity } from 'lucide-react';
import { initWebMidi } from '../audio/webMidiService';

interface MidiSettingsViewProps {
  instrumentTone: InstrumentToneType;
  onInstrumentChange: (tone: InstrumentToneType) => void;
  lang: Language;
}

export const MidiSettingsView: React.FC<MidiSettingsViewProps> = ({
  instrumentTone,
  onInstrumentChange,
  lang,
}) => {
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [isMidiSupported, setIsMidiSupported] = useState<boolean>(true);
  const [lastNote, setLastNote] = useState<number | null>(null);

  useEffect(() => {
    initWebMidi(
      (midiNote) => {
        setLastNote(midiNote);
      },
      () => {}
    ).then((status) => {
      setIsMidiSupported(status.supported);
      setMidiDevices(status.deviceNames);
    });
  }, []);

  const handleTestNote = (note: string) => {
    pianoAudioEngine.playNote(note);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706]">
              Pianolodo Hardware & Sound Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] tracking-tight">
            {lang === 'vi'
              ? 'Cài Đặt Âm Sắc Nhạc Cụ & Giao Thức Web MIDI'
              : 'Instrument Timbre & Web MIDI Controller'}
          </h1>
          <p className="text-xs md:text-sm text-[#78716C] leading-relaxed">
            {lang === 'vi'
              ? 'Tùy chỉnh động cơ âm thanh Web Audio và kết nối trực tiếp với đàn Piano điện tử bên ngoài qua cổng USB MIDI để luyện tập trực tiếp theo thời gian thực.'
              : 'Configure local Web Audio synthesizers and connect external USB/Bluetooth MIDI keyboards for zero-latency interactive coaching.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instrument Tone Switcher */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F5F1EB] pb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-[#1C1917] tracking-tight">
                {lang === 'vi' ? 'Động Cơ Âm Sắc (Sound Font)' : 'Sound Font Engine'}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#78716C]">Polyphony: 32 voices</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grand Piano */}
            <div
              onClick={() => onInstrumentChange('grand-piano')}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                instrumentTone === 'grand-piano'
                  ? 'bg-[#FEF3C7]/40 border-[#D97706] shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E5DFD7] hover:border-[#D1C8BD]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-center text-[#D97706]">
                    <Volume2 className="w-4 h-4" />
                  </span>
                  {instrumentTone === 'grand-piano' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#1C1917]">
                  {lang === 'vi' ? 'Concert Grand Piano' : 'Concert Grand Piano'}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {lang === 'vi'
                    ? 'Âm thanh đại dương cầm Yamaha CFX trong trẻo, lực gõ rõ nét, phù hợp Pop Ballad và Cổ điển.'
                    : 'Pristine concert acoustic piano with rich wooden resonance and crisp hammer attack.'}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTestNote('C4');
                }}
                className="w-full py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold text-[#D97706] border border-[#E5DFD7] transition shadow-xs"
              >
                {lang === 'vi' ? 'Nghe thử nốt C4' : 'Audition C4'}
              </button>
            </div>

            {/* Warm Rhodes */}
            <div
              onClick={() => onInstrumentChange('warm-rhodes')}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                instrumentTone === 'warm-rhodes'
                  ? 'bg-[#FEF3C7]/40 border-[#D97706] shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E5DFD7] hover:border-[#D1C8BD]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-center text-[#D97706]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  {instrumentTone === 'warm-rhodes' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#1C1917]">
                  {lang === 'vi' ? 'Vintage Warm Rhodes' : 'Vintage Warm Rhodes'}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {lang === 'vi'
                    ? 'Đàn phím điện Rhodes Mark I ấm áp, tiếng chuông ngân êm dịu, chuẩn phong cách Neo-Soul & Jazz.'
                    : 'Warm vintage electric piano with bell-like overtones and velvety low-end sustain.'}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTestNote('E4');
                }}
                className="w-full py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold text-[#D97706] border border-[#E5DFD7] transition shadow-xs"
              >
                {lang === 'vi' ? 'Nghe thử nốt E4' : 'Audition E4'}
              </button>
            </div>
          </div>
        </div>

        {/* Web MIDI Connection Panel */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F5F1EB] pb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#1C1917] tracking-tight">
                {lang === 'vi' ? 'Cổng Web MIDI Controller' : 'Web MIDI Controller Port'}
              </h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                isMidiSupported
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isMidiSupported ? (lang === 'vi' ? 'Web MIDI Sẵn Sàng' : 'MIDI Supported') : 'Unsupported'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-2">
              <div className="text-xs font-semibold text-[#78716C]">
                {lang === 'vi' ? 'Thiết bị đàn MIDI đã kết nối:' : 'Connected MIDI Devices:'}
              </div>
              {midiDevices.length > 0 ? (
                <ul className="space-y-1">
                  {midiDevices.map((d, i) => (
                    <li key={i} className="text-xs font-mono text-[#D97706] flex items-center gap-2 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-[#A8A29E] italic">
                  {lang === 'vi'
                    ? 'Chưa phát hiện thiết bị đàn MIDI ngoài cắm qua USB. Hãy cắm đàn của bạn và cấp quyền trình duyệt khi được hỏi.'
                    : 'No external USB MIDI keyboard detected. Plug in your keyboard to enable live coaching.'}
                </div>
              )}
            </div>

            {/* Live MIDI Note Monitor */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs text-[#78716C]">
                  {lang === 'vi' ? 'Tín hiệu phím gõ gần nhất:' : 'Latest Incoming Note:'}
                </span>
              </div>
              <span className="font-mono text-sm font-extrabold text-[#D97706]">
                {lastNote !== null ? `MIDI #${lastNote}` : 'Waiting...'}
              </span>
            </div>
          </div>

          {/* Engine Specs */}
          <div className="pt-2 border-t border-[#F5F1EB] grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7]">
              <div className="text-[10px] text-[#A8A29E]">LATENCY</div>
              <div className="text-xs font-mono font-bold text-[#10B981]">&lt; 5 ms</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7]">
              <div className="text-[10px] text-[#A8A29E]">BUFFER</div>
              <div className="text-xs font-mono font-bold text-[#1C1917]">128 samples</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7]">
              <div className="text-[10px] text-[#A8A29E]">SAMPLE RATE</div>
              <div className="text-xs font-mono font-bold text-[#1C1917]">48,000 Hz</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
