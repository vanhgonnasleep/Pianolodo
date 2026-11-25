import {
  DetectedChordSegment,
  LyricChordToken,
  LyricLineSegment,
  SongAnalysisResult,
} from './audioChordAnalyzer';

const GEMINI_KEY_STORAGE = 'pianolodo_gemini_api_key';

export function getSavedGeminiApiKey(): string {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  return window.localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function saveGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const trimmed = apiKey.trim();
  if (trimmed) {
    window.localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

/**
 * Aligns user-entered or Web-Speech captured lyrics across the detected chord & 3-layer note segments,
 * producing an interactive Chord-over-Lyrics & Melody-Note Lead Sheet.
 */
export function alignCustomLyricsToSegments(
  rawLyricsText: string,
  segments: DetectedChordSegment[]
): LyricLineSegment[] {
  const safeSegments = segments.length > 0 ? segments : [];
  if (safeSegments.length === 0) return [];

  const cleanLines = rawLyricsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (cleanLines.length === 0) {
    return safeSegments.map((seg) => ({
      startTime: seg.startTime,
      endTime: seg.endTime,
      rawText: seg.lyricSnippet || `(${seg.chordSymbol}) ${seg.arpeggioSequence.join(' → ')}`,
      tokens: [
        {
          chordSymbol: seg.chordSymbol,
          melodyNote: seg.vocalMelodyNotes[0] || 'E4',
          arpeggioHint: seg.arpeggioSequence.slice(0, 4).join('→'),
          text: seg.lyricSnippet || 'Giai điệu...',
        },
      ],
    }));
  }

  // Group or distribute segments across lyric lines
  const resultLines: LyricLineSegment[] = [];
  const totalLines = cleanLines.length;
  const totalSegs = safeSegments.length;

  for (let i = 0; i < totalLines; i++) {
    const lineText = cleanLines[i];
    const startSegIdx = Math.min(totalSegs - 1, Math.floor((i * totalSegs) / totalLines));
    const endSegIdx = Math.min(
      totalSegs - 1,
      Math.max(startSegIdx, Math.floor(((i + 1) * totalSegs) / totalLines) - 1)
    );

    const lineSegs = safeSegments.slice(startSegIdx, endSegIdx + 1);
    const activeSegs = lineSegs.length > 0 ? lineSegs : [safeSegments[startSegIdx]];

    const words = lineText.split(/\s+/);
    const tokens: LyricChordToken[] = [];
    const chunkSize = Math.max(1, Math.ceil(words.length / activeSegs.length));

    activeSegs.forEach((seg, sIdx) => {
      const wordSlice = words.slice(sIdx * chunkSize, (sIdx + 1) * chunkSize);
      const phrase = wordSlice.join(' ');
      if (phrase || sIdx === 0) {
        tokens.push({
          chordSymbol: seg.chordSymbol,
          melodyNote: seg.vocalMelodyNotes[0] || seg.rightHandNotes[rightHandIndex(seg)] || 'E4',
          arpeggioHint: seg.arpeggioSequence.slice(0, 4).join('→'),
          text: phrase ? `${phrase} ` : '',
        });
      }
    });

    // Update segment lyricSnippet for timeline sync
    activeSegs.forEach((seg) => {
      seg.lyricSnippet = lineText;
    });

    resultLines.push({
      startTime: activeSegs[0].startTime,
      endTime: activeSegs[activeSegs.length - 1].endTime,
      rawText: lineText,
      tokens,
    });
  }

  return resultLines;
}

function rightHandIndex(seg: DetectedChordSegment): number {
  return Math.max(0, seg.rightHandNotes.length - 1);
}

/**
 * Calls Gemini 2.5 Flash Multimodal Audio API directly from the browser to transcribe
 * singing vocals (Vietnamese/English), chord changes, and melody notes from the extracted WAV audio.
 */
export async function transcribeWithGeminiAudio(
  analysisResult: SongAnalysisResult,
  apiKey: string,
  lang: 'vi' | 'en' = 'vi'
): Promise<{
  lyricLines: LyricLineSegment[];
  refinedFormula?: string;
}> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }
  if (!analysisResult.audioWavBase64) {
    throw new Error('NO_AUDIO_BUFFER_AVAILABLE');
  }

  const segmentContext = analysisResult.segments
    .map(
      (s, idx) =>
        `Segment ${idx + 1} (${s.startTime}s-${s.endTime}s): DSP Chord=${s.chordSymbol}, Bass=${s.bassNote}, Arpeggio=[${s.arpeggioSequence.join(',')}], VocalPitch=[${s.vocalMelodyNotes.join(',')}]`
    )
    .join('\n');

  const prompt = `You are an expert piano & vocal music transcriber. Listen carefully to this audio clip of a singer performing with accompaniment.
Our on-device DSP detected Key=${analysisResult.detectedKey}, BPM=${analysisResult.detectedBpm}, and these time segments:
${segmentContext}

Task:
1. Transcribe the exact sung lyrics (Vietnamese or English) line by line, matching the time segments. If a section is purely instrumental (no singing), write "[Dạo đàn Piano / Instrumental]" for the text.
2. Place the accurate chord symbol and vocal melody note right on the syllable/word where each chord change occurs.
Return ONLY valid JSON matching this schema:
{
  "refinedFormula": "Chord1 - Chord2 - Chord3 - Chord4",
  "lines": [
    {
      "startTime": 0.0,
      "endTime": 1.75,
      "rawText": "full lyric line",
      "tokens": [
        { "chordSymbol": "Cmaj7", "melodyNote": "E4", "arpeggioHint": "C2→G2→E3→B3", "text": "sung words " }
      ]
    }
  ]
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'audio/wav',
                data: analysisResult.audioWavBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GEMINI_API_ERROR: ${response.status} ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  const rawJsonText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(rawJsonText);

  if (!Array.isArray(parsed.lines) || parsed.lines.length === 0) {
    const fallbackText =
      lang === 'vi'
        ? '[Dạo đàn & Giai điệu] Chưa phát hiện lời hát rõ ràng trong đoạn thu'
        : '[Instrumental] No distinct vocal lyrics detected in this clip';
    return {
      lyricLines: alignCustomLyricsToSegments(fallbackText, analysisResult.segments),
    };
  }

  const lyricLines: LyricLineSegment[] = parsed.lines.map(
    (line: LyricLineSegment, idx: number) => {
      const fallbackSeg =
        analysisResult.segments[Math.min(idx, analysisResult.segments.length - 1)];
      return {
        startTime: typeof line.startTime === 'number' ? line.startTime : fallbackSeg?.startTime ?? 0,
        endTime: typeof line.endTime === 'number' ? line.endTime : fallbackSeg?.endTime ?? 2,
        rawText: line.rawText || '',
        tokens: Array.isArray(line.tokens) && line.tokens.length > 0
          ? line.tokens
          : [
              {
                chordSymbol: fallbackSeg?.chordSymbol || 'C',
                melodyNote: fallbackSeg?.vocalMelodyNotes?.[0] || 'E4',
                arpeggioHint: fallbackSeg?.arpeggioSequence?.slice(0, 4).join('→'),
                text: line.rawText || '',
              },
            ],
      };
    }
  );

  return {
    lyricLines,
    refinedFormula: typeof parsed.refinedFormula === 'string' ? parsed.refinedFormula : undefined,
  };
}

/**
 * Starts browser Web Speech API live recognition (for Mic / Live session) if supported
 */
export function startLiveSpeechRecognition(
  lang: 'vi' | 'en',
  onInterimOrFinalText: (transcript: string) => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;
  const SpeechRec =
    (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

  if (typeof SpeechRec !== 'function') return null;

  try {
    const recognition = new (SpeechRec as new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      start: () => void;
      stop: () => void;
    })();

    recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcripts: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item && item[0] && item[0].transcript) {
          transcripts.push(item[0].transcript.trim());
        }
      }
      if (transcripts.length > 0) {
        onInterimOrFinalText(transcripts.join('\n'));
      }
    };

    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch {
    return null;
  }
}
