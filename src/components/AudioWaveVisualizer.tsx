import React, { useEffect, useRef } from 'react';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';

interface AudioWaveVisualizerProps {
  isPlaying: boolean;
  theme?: 'light' | 'dark';
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isPlaying,
  theme = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const waveform = pianoAudioEngine.getWaveformData();
      const hasAudio = isPlaying || Array.from(waveform).some((v) => Math.abs(v) > 0.01);

      ctx.lineWidth = 1.75;
      if (theme === 'dark') {
        if (typeof ctx.createLinearGradient === 'function') {
          const grad = ctx.createLinearGradient(0, 0, width, 0);
          grad.addColorStop(0, '#06B6D4');
          grad.addColorStop(0.5, '#F59E0B');
          grad.addColorStop(1, '#3B82F6');
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = '#F59E0B';
        }
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = hasAudio ? 8 : 2;
      } else {
        ctx.strokeStyle = '#D97706';
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();

      const sliceWidth = width / waveform.length;
      let x = 0;

      for (let i = 0; i < waveform.length; i++) {
        let v = waveform[i];
        if (!hasAudio) {
          // Subtle resting breathing wave when silent
          v = Math.sin(i * 0.2 + phase) * 0.05;
        }

        const y = (v * 0.5 + 0.5) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      phase += 0.05;
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, theme]);

  return (
    <div
      className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0C10] border border-[#E5DFD7] dark:border-[#272736] shadow-xs"
      title="Web Audio Real-Time Waveform Visualizer"
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={20}
        className="rounded opacity-90"
      />
    </div>
  );
};
