import * as Tone from 'tone';
import { GroovePatternId, VoicedChord } from '../types/harmony';

export type InstrumentToneType = 'grand-piano' | 'warm-rhodes';

class PianoAudioEngine {
  private synth: Tone.PolySynth | null = null;
  private rhodesSynth: Tone.PolySynth | null = null;
  private analyser: Tone.Analyser | null = null;
  private currentInstrument: InstrumentToneType = 'grand-piano';
  private isInitialized = false;
  private activeSequenceId: number | null = null;
  private activeTimeoutIds: number[] = [];

  private async ensureAudioContext() {
    try {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }
      if (!this.isInitialized) {
        this.initSynths();
        this.isInitialized = true;
      }
    } catch {
      // Safe fallback for non-browser / headless test environments
    }
  }

  private initSynths() {
    // Web Audio Analyser for Real-Time Waveform / Spectrum Visualizer (safe for headless/jsdom)
    try {
      this.analyser = new Tone.Analyser('waveform', 64);
    } catch {
      this.analyser = null;
    }

    // Grand Piano Polyphonic Synthesizer
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },
        envelope: {
          attack: 0.005,
          decay: 1.8,
          sustain: 0.15,
          release: 1.2,
        },
        volume: -4,
      }).toDestination();
      if (this.analyser) {
        this.synth.connect(this.analyser);
      }
    } catch {
      this.synth = null;
    }

    // Warm Rhodes Electric Piano Synthesizer
    try {
      this.rhodesSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 1.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 1.5,
          sustain: 0.25,
          release: 1.0,
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.8,
          sustain: 0.2,
          release: 0.8,
        },
        volume: -6,
      }).toDestination();
      if (this.analyser) {
        this.rhodesSynth.connect(this.analyser);
      }
    } catch {
      this.rhodesSynth = null;
    }
  }

  public getWaveformData(): Float32Array {
    if (!this.analyser) return new Float32Array(64);
    try {
      const data = this.analyser.getValue();
      if (data instanceof Float32Array) return data;
      return new Float32Array(data as unknown as ArrayLike<number>);
    } catch {
      return new Float32Array(64);
    }
  }

  public setInstrumentTone(toneType: InstrumentToneType) {
    this.currentInstrument = toneType;
  }

  public async playNote(note: string, duration: string = '4n'): Promise<void> {
    try {
      await this.ensureAudioContext();
      const synth = this.getActiveSynth();
      if (synth) {
        synth.triggerAttackRelease(note, duration, Tone.now());
      }
    } catch {
      // Safe fallback for headless environments
    }
  }

  private getActiveSynth(): Tone.PolySynth | null {
    if (!this.synth && !this.rhodesSynth) {
      this.initSynths();
    }
    return this.currentInstrument === 'warm-rhodes' ? (this.rhodesSynth || this.synth) : (this.synth || this.rhodesSynth);
  }

  public async playVoicedChord(chord: VoicedChord, groove: GroovePatternId = 'block'): Promise<void> {
    try {
      await this.ensureAudioContext();
      this.stopPlayback();

      const synth = this.getActiveSynth();
      if (!synth) return;

      const lhNotes = chord.leftHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
      const rhNotes = chord.rightHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
      const allNotes = [...lhNotes, ...rhNotes];

      const now = Tone.now();

      if (groove === 'block') {
        synth.triggerAttackRelease(allNotes, '2n', now);
      } else if (groove === 'ballad-arpeggio') {
        synth.triggerAttackRelease(lhNotes, '1n', now);
        rhNotes.forEach((note, idx) => {
          synth.triggerAttackRelease(note, '4n', now + 0.12 * (idx + 1));
        });
      } else if (groove === 'rnb-pulse') {
        synth.triggerAttackRelease(lhNotes, '2n', now);
        synth.triggerAttackRelease(rhNotes, '8n', now);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.35);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.7);
      } else if (groove === 'bossa-nova') {
        synth.triggerAttackRelease(lhNotes, '4n', now);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.1);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.35);
        synth.triggerAttackRelease(lhNotes, '4n', now + 0.6);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.8);
      } else if (groove === 'dilla-swing') {
        synth.triggerAttackRelease(lhNotes, '2n', now);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.04);
        synth.triggerAttackRelease(rhNotes, '16n', now + 0.36);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.72);
      } else if (groove === 'gospel-walk') {
        synth.triggerAttackRelease(lhNotes, '4n', now);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.05);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.3);
        synth.triggerAttackRelease(lhNotes, '4n', now + 0.5);
        synth.triggerAttackRelease(rhNotes, '8n', now + 0.75);
      } else if (groove === 'cinematic-wave') {
        synth.triggerAttackRelease(lhNotes, '1n', now);
        allNotes.forEach((note, idx) => {
          synth.triggerAttackRelease(note, '2n', now + 0.08 * idx);
        });
      }
    } catch {
      // Safe fallback for headless
    }
  }

  public async playProgression(
    chords: VoicedChord[],
    groove: GroovePatternId,
    bpm: number,
    onChordStep: (index: number) => void,
    onComplete: () => void,
    loop: boolean = false
  ): Promise<void> {
    await this.ensureAudioContext();
    this.stopPlayback();

    const sequenceId = Date.now();
    this.activeSequenceId = sequenceId;

    const synth = this.getActiveSynth();
    if (!synth) return;
    const beatSeconds = 60 / bpm;

    let accumulatedTime = 0;

    for (let i = 0; i < chords.length; i++) {
      if (this.activeSequenceId !== sequenceId) break;

      const chord = chords[i];
      const durationSeconds = chord.beats * beatSeconds;
      const stepIdx = i;

      const timeoutId = window.setTimeout(() => {
        if (this.activeSequenceId === sequenceId) {
          onChordStep(stepIdx);
        }
      }, accumulatedTime * 1000);
      this.activeTimeoutIds.push(timeoutId);

      const lhNotes = chord.leftHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
      const rhNotes = chord.rightHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
      const allNotes = [...lhNotes, ...rhNotes];

      const playTime = Tone.now() + accumulatedTime;

      if (groove === 'block') {
        synth.triggerAttackRelease(allNotes, `${chord.beats}n`, playTime);
      } else if (groove === 'ballad-arpeggio') {
        synth.triggerAttackRelease(lhNotes, `${chord.beats}n`, playTime);
        rhNotes.forEach((n, idx) => {
          synth.triggerAttackRelease(n, '4n', playTime + 0.15 * (idx + 1));
        });
      } else if (groove === 'rnb-pulse') {
        synth.triggerAttackRelease(lhNotes, `${chord.beats}n`, playTime);
        synth.triggerAttackRelease(rhNotes, '8n', playTime);
        if (durationSeconds > 0.8) {
          synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.4);
          synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.75);
        }
      } else if (groove === 'bossa-nova') {
        synth.triggerAttackRelease(lhNotes, '4n', playTime);
        synth.triggerAttackRelease(rhNotes, '8n', playTime + 0.1);
        synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.35);
        if (durationSeconds > 1.0) {
          synth.triggerAttackRelease(lhNotes, '4n', playTime + durationSeconds * 0.5);
          synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.7);
        }
      } else if (groove === 'dilla-swing') {
        synth.triggerAttackRelease(lhNotes, `${chord.beats}n`, playTime);
        synth.triggerAttackRelease(rhNotes, '8n', playTime + 0.04);
        if (durationSeconds > 0.7) {
          synth.triggerAttackRelease(rhNotes, '16n', playTime + durationSeconds * 0.36);
          synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.72);
        }
      } else if (groove === 'gospel-walk') {
        synth.triggerAttackRelease(lhNotes, '4n', playTime);
        synth.triggerAttackRelease(rhNotes, '8n', playTime + 0.05);
        synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.3);
        if (durationSeconds > 0.9) {
          synth.triggerAttackRelease(lhNotes, '4n', playTime + durationSeconds * 0.5);
          synth.triggerAttackRelease(rhNotes, '8n', playTime + durationSeconds * 0.75);
        }
      } else if (groove === 'cinematic-wave') {
        synth.triggerAttackRelease(lhNotes, `${chord.beats}n`, playTime);
        allNotes.forEach((n, idx) => {
          synth.triggerAttackRelease(n, '2n', playTime + 0.09 * (idx + 1));
        });
      }

      accumulatedTime += durationSeconds;
    }

    const completeTimeoutId = window.setTimeout(() => {
      if (this.activeSequenceId === sequenceId) {
        if (loop) {
          this.playProgression(chords, groove, bpm, onChordStep, onComplete, true);
        } else {
          this.activeSequenceId = null;
          onComplete();
        }
      }
    }, accumulatedTime * 1000);
    this.activeTimeoutIds.push(completeTimeoutId);
  }

  public stopPlayback(): void {
    this.activeSequenceId = null;
    this.activeTimeoutIds.forEach((id) => clearTimeout(id));
    this.activeTimeoutIds = [];

    try {
      if (Tone.getTransport) {
        const transport = Tone.getTransport();
        if (transport) {
          transport.stop();
          transport.cancel();
        }
      }
    } catch {
      // Safe fallback for headless
    }

    if (this.synth) {
      try {
        this.synth.releaseAll();
      } catch {
        // Safe fallback
      }
    }
    if (this.rhodesSynth) {
      try {
        this.rhodesSynth.releaseAll();
      } catch {
        // Safe fallback
      }
    }
  }

  public stopProgression(): void {
    this.stopPlayback();
  }
}

export const pianoAudioEngine = new PianoAudioEngine();
