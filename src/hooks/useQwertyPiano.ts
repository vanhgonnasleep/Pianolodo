import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '@tonaljs/tonal';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { detectChordFromMidis, DetectedChordResult } from '../engine/reverseChordDetector';

const KEY_TO_BASE_MIDI: Record<string, number> = {
  // White keys (bottom row)
  KeyA: 60, // C4
  KeyS: 62, // D4
  KeyD: 64, // E4
  KeyF: 65, // F4
  KeyG: 67, // G4
  KeyH: 69, // A4
  KeyJ: 71, // B4
  KeyK: 72, // C5
  KeyL: 74, // D5
  Semicolon: 76, // E5
  Quote: 77, // F5

  // Black keys (top row)
  KeyW: 61, // C#4
  KeyE: 63, // D#4
  KeyT: 66, // F#4
  KeyY: 68, // G#4
  KeyU: 70, // A#4
  KeyO: 73, // C#5
  KeyP: 75, // D#5
};

interface UseQwertyPianoOptions {
  enabled?: boolean;
  onActiveMidisChange?: (midis: number[]) => void;
}

export function useQwertyPiano({ enabled = true, onActiveMidisChange }: UseQwertyPianoOptions = {}) {
  const [octaveShift, setOctaveShift] = useState<number>(0); // in octaves (-2..+2)
  const [isSustainActive, setIsSustainActive] = useState<boolean>(false);
  const [activeMidis, setActiveMidis] = useState<number[]>([]);
  const [detectedChord, setDetectedChord] = useState<DetectedChordResult | null>(null);

  const heldKeysRef = useRef<Set<string>>(new Set());
  const activeMidisRef = useRef<Set<number>>(new Set());
  const sustainedMidisRef = useRef<Set<number>>(new Set());
  const isSustainActiveRef = useRef<boolean>(false);
  const octaveShiftRef = useRef<number>(0);

  isSustainActiveRef.current = isSustainActive;
  octaveShiftRef.current = octaveShift;

  const updateActiveMidis = useCallback(() => {
    const combined = new Set([...activeMidisRef.current, ...sustainedMidisRef.current]);
    const arr = Array.from(combined).sort((a, b) => a - b);
    setActiveMidis(arr);
    onActiveMidisChange?.(arr);
    setDetectedChord(detectChordFromMidis(arr));
  }, [onActiveMidisChange]);

  const triggerNoteOn = useCallback((midi: number) => {
    const noteName = Note.fromMidi(midi);
    pianoAudioEngine.playNote(noteName, '2n');
  }, []);

  const triggerKey = useCallback(
    (code: string) => {
      const baseMidi = KEY_TO_BASE_MIDI[code];
      if (baseMidi === undefined) return;

      const effectiveMidi = baseMidi + octaveShiftRef.current * 12;
      if (effectiveMidi < 21 || effectiveMidi > 108) return;

      if (!heldKeysRef.current.has(code)) {
        heldKeysRef.current.add(code);
        activeMidisRef.current.add(effectiveMidi);
        triggerNoteOn(effectiveMidi);
        updateActiveMidis();
      }
    },
    [triggerNoteOn, updateActiveMidis]
  );

  const releaseKey = useCallback(
    (code: string) => {
      const baseMidi = KEY_TO_BASE_MIDI[code];
      if (baseMidi === undefined) return;

      const effectiveMidi = baseMidi + octaveShiftRef.current * 12;
      heldKeysRef.current.delete(code);
      activeMidisRef.current.delete(effectiveMidi);

      if (isSustainActiveRef.current) {
        sustainedMidisRef.current.add(effectiveMidi);
      }

      updateActiveMidis();
    },
    [updateActiveMidis]
  );

  const clearNotes = useCallback(() => {
    heldKeysRef.current.clear();
    activeMidisRef.current.clear();
    sustainedMidisRef.current.clear();
    updateActiveMidis();
  }, [updateActiveMidis]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text input or interactive element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Octave Shift: Z (down), X (up)
      if (e.code === 'KeyZ') {
        e.preventDefault();
        setOctaveShift((prev) => Math.max(-2, prev - 1));
        return;
      }
      if (e.code === 'KeyX') {
        e.preventDefault();
        setOctaveShift((prev) => Math.min(2, prev + 1));
        return;
      }

      // Sustain Pedal: Shift
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsSustainActive(true);
        return;
      }

      // Note keys
      if (KEY_TO_BASE_MIDI[e.code] !== undefined) {
        if (!e.repeat) {
          e.preventDefault();
          triggerKey(e.code);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsSustainActive(false);
        sustainedMidisRef.current.clear();
        updateActiveMidis();
        return;
      }

      if (KEY_TO_BASE_MIDI[e.code] !== undefined) {
        e.preventDefault();
        releaseKey(e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, triggerKey, releaseKey, updateActiveMidis]);

  return {
    octaveShift,
    setOctaveShift,
    isSustainActive,
    activeMidis,
    detectedChord,
    clearNotes,
    triggerKey,
    releaseKey,
  };
}
