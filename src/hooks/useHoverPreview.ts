import { useState, useRef, useCallback } from 'react';
import { HoverPreviewState, VoicedChord } from '../types/harmony';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';

export function useHoverPreview() {
  const [previewState, setPreviewState] = useState<HoverPreviewState | null>(null);
  const [hoverScrubEnabled, setHoverScrubEnabled] = useState<boolean>(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnyPopoverOpenRef = useRef<boolean>(false);

  const startHover = useCallback(
    (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      const execute = () => {
        isAnyPopoverOpenRef.current = true;
        setPreviewState({
          chord,
          multiChords,
          source: 'hover',
          label,
        });

        if (hoverScrubEnabled) {
          pianoAudioEngine.playVoicedChord(chord, 'block');
        }
      };

      // Emil Kowalski Instant Subsequent Tooltip Rule:
      // If a popover is already visible, switch instantly (0ms).
      // Otherwise, delay 120ms to avoid flashing during quick mouse transit.
      if (isAnyPopoverOpenRef.current) {
        execute();
      } else {
        hoverTimerRef.current = setTimeout(execute, 120);
      }
    },
    [hoverScrubEnabled]
  );

  const endHover = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Give a short grace period (150ms) before declaring popovers closed
    hoverTimerRef.current = setTimeout(() => {
      isAnyPopoverOpenRef.current = false;
      setPreviewState(null);
    }, 150);
  }, []);

  const setAuditionPreview = useCallback((chord: VoicedChord | null, multiChords?: VoicedChord[]) => {
    if (!chord) {
      setPreviewState(null);
    } else {
      setPreviewState({
        chord,
        multiChords,
        source: 'audition',
      });
    }
  }, []);

  const toggleHoverScrub = useCallback(() => {
    setHoverScrubEnabled((prev) => !prev);
  }, []);

  return {
    previewState,
    hoverScrubEnabled,
    startHover,
    endHover,
    setAuditionPreview,
    toggleHoverScrub,
  };
}
