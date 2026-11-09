import { GroovePatternId, SpiceLevel, VibeId, VoicingTopology } from '../types/harmony';

export interface StudioSerializedState {
  key: string;
  input: string;
  vibe: VibeId;
  spice: SpiceLevel;
  bpm: number;
  groove: GroovePatternId;
  voicing?: VoicingTopology;
}

export function serializeStudioStateToUrl(state: StudioSerializedState): string {
  const params = new URLSearchParams();
  if (state.key) params.set('k', state.key);
  if (state.input) params.set('i', state.input.replace(/\s+/g, ''));
  if (state.vibe) params.set('v', state.vibe);
  if (state.spice) params.set('s', state.spice.toString());
  if (state.bpm) params.set('bpm', state.bpm.toString());
  if (state.groove) params.set('g', state.groove);
  if (state.voicing) params.set('topo', state.voicing);

  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${base}?${params.toString()}`;
}

export function parseStudioStateFromUrl(
  searchParams: URLSearchParams
): Partial<StudioSerializedState> {
  const state: Partial<StudioSerializedState> = {};

  const k = searchParams.get('k');
  if (k) state.key = k;

  const i = searchParams.get('i');
  if (i) {
    // Format "1-6-2-5" or "2-5-1" back to spaced tokens "1 - 6 - 2 - 5"
    state.input = i.split(/[-–,]/).filter(Boolean).join(' - ');
  }

  const v = searchParams.get('v') as VibeId | null;
  if (v && ['pop-ballad', 'rnb-neosoul', 'jazz-bossa', 'cinematic-sad'].includes(v)) {
    state.vibe = v;
  }

  const s = searchParams.get('s');
  if (s && ['1', '2', '3'].includes(s)) {
    state.spice = parseInt(s, 10) as SpiceLevel;
  }

  const bpm = searchParams.get('bpm');
  if (bpm) {
    const parsedBpm = parseInt(bpm, 10);
    if (!isNaN(parsedBpm) && parsedBpm >= 40 && parsedBpm <= 240) {
      state.bpm = parsedBpm;
    }
  }

  const g = searchParams.get('g') as GroovePatternId | null;
  if (
    g &&
    [
      'block',
      'ballad-arpeggio',
      'rnb-pulse',
      'bossa-nova',
      'dilla-swing',
      'gospel-walk',
      'cinematic-wave',
    ].includes(g)
  ) {
    state.groove = g;
  }

  const topo = searchParams.get('topo') as VoicingTopology | null;
  if (
    topo &&
    ['ergonomic-split', 'rootless-a', 'rootless-b', 'drop-2', 'quartal'].includes(topo)
  ) {
    state.voicing = topo;
  }

  return state;
}
