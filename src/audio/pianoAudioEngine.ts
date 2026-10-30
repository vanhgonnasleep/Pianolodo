import * as Tone from 'tone';
import { GroovePatternId, VoicedChord } from '../types/harmony';

export type InstrumentToneType = 'grand-piano' | 'warm-rhodes';

class PianoAudioEngine {
  private synth: Tone.PolySynth | null = null;
  private rhodesSynth: Tone.PolySynth | null = null;
  private currentInstrument: InstrumentToneType = 'grand-piano';
  private isInitialized = false;
  private activeSequenceId: number | null = null;

  private async ensureAudioContext() {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    if (!this.isInitialized) {
      this.initSynths();
      this.isInitialized = true;
    }
  }

  private initSynths() {
    // Grand Piano Polyphonic Synthesizer
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

    // Warm Rhodes Electric Piano Synthesizer
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
  }

  public setInstrumentTone(toneType: InstrumentToneType) {
    this.currentInstrument = toneType;
  }

  public async playNote(note: string, duration: string = '4n'): Promise<void> {
    await this.ensureAudioContext();
    const synth = this.getActiveSynth();
    synth.triggerAttackRelease(note, duration, Tone.now());
  }

  private getActiveSynth(): Tone.PolySynth {
    if (!this.synth || !this.rhodesSynth) {
      this.initSynths();
    }
    return this.currentInstrument === 'warm-rhodes' ? this.rhodesSynth! : this.synth!;
  }

  public async playVoicedChord(chord: VoicedChord, groove: GroovePatternId = 'block'): Promise<void> {
    await this.ensureAudioContext();
    this.stopPlayback();

    const synth = this.getActiveSynth();
    const lhNotes = chord.leftHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
    const rhNotes = chord.rightHand.map((n) => Tone.Frequency(n.midi, 'midi').toNote());
    const allNotes = [...lhNotes, ...rhNotes];

    const now = Tone.now();

    if (groove === 'block') {
      synth.triggerAttackRelease(allNotes, '2n', now);
    } else if (groove === 'ballad-arpeggio') {
      // Bass first
      synth.triggerAttackRelease(lhNotes, '1n', now);
      // Arpeggiate right hand notes smoothly
      rhNotes.forEach((note, idx) => {
        synth.triggerAttackRelease(note, '4n', now + 0.12 * (idx + 1));
      });
    } else if (groove === 'rnb-pulse') {
      // LH sustain
      synth.triggerAttackRelease(lhNotes, '2n', now);
      // RH pulses
      synth.triggerAttackRelease(rhNotes, '8n', now);
      synth.triggerAttackRelease(rhNotes, '8n', now + 0.35);
      synth.triggerAttackRelease(rhNotes, '8n', now + 0.7);
    } else if (groove === 'bossa-nova') {
      // Bossa pattern
      synth.triggerAttackRelease(lhNotes, '4n', now);
      synth.triggerAttackRelease(rhNotes, '8n', now + 0.1);
      synth.triggerAttackRelease(rhNotes, '8n', now + 0.35);
      synth.triggerAttackRelease(lhNotes, '4n', now + 0.6);
      synth.triggerAttackRelease(rhNotes, '8n', now + 0.8);
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
    const beatSeconds = 60 / bpm;

    let accumulatedTime = 0;

    for (let i = 0; i < chords.length; i++) {
      if (this.activeSequenceId !== sequenceId) break;

      const chord = chords[i];
      const durationSeconds = chord.beats * beatSeconds;
      const stepIdx = i;

      setTimeout(() => {
        if (this.activeSequenceId === sequenceId) {
          onChordStep(stepIdx);
        }
      }, accumulatedTime * 1000);

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
      }

      accumulatedTime += durationSeconds;
    }

    setTimeout(() => {
      if (this.activeSequenceId === sequenceId) {
        if (loop) {
          this.playProgression(chords, groove, bpm, onChordStep, onComplete, true);
        } else {
          this.activeSequenceId = null;
          onComplete();
        }
      }
    }, accumulatedTime * 1000);
  }

  public stopPlayback(): void {
    this.activeSequenceId = null;
    if (this.synth) {
      this.synth.releaseAll();
    }
    if (this.rhodesSynth) {
      this.rhodesSynth.releaseAll();
    }
  }
}

export const pianoAudioEngine = new PianoAudioEngine();
