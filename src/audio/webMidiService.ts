export interface WebMidiStatus {
  supported: boolean;
  deviceNames: string[];
}

export type NoteOnCallback = (midi: number) => void;
export type NoteOffCallback = (midi: number) => void;

class WebMidiService {
  private midiAccess: WebMidi.MIDIAccess | null = null;
  private onNoteOn: NoteOnCallback | null = null;
  private onNoteOff: NoteOffCallback | null = null;

  public async init(
    onNoteOn: NoteOnCallback,
    onNoteOff: NoteOffCallback
  ): Promise<WebMidiStatus> {
    this.onNoteOn = onNoteOn;
    this.onNoteOff = onNoteOff;

    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      return { supported: false, deviceNames: [] };
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      const deviceNames: string[] = [];

      for (const input of this.midiAccess.inputs.values()) {
        deviceNames.push(input.name || 'External MIDI Device');
        input.onmidimessage = this.handleMidiMessage.bind(this);
      }

      this.midiAccess.onstatechange = () => {
        if (!this.midiAccess) return;
        for (const input of this.midiAccess.inputs.values()) {
          input.onmidimessage = this.handleMidiMessage.bind(this);
        }
      };

      return {
        supported: true,
        deviceNames,
      };
    } catch {
      return { supported: false, deviceNames: [] };
    }
  }

  private handleMidiMessage(event: WebMidi.MIDIMessageEvent) {
    const data = event.data;
    if (!data || data.length < 3) return;

    const command = data[0] >> 4;
    const note = data[1];
    const velocity = data[2];

    // Command 9 = Note On, Command 8 = Note Off
    if (command === 9) {
      if (velocity > 0) {
        if (this.onNoteOn) this.onNoteOn(note);
      } else {
        if (this.onNoteOff) this.onNoteOff(note);
      }
    } else if (command === 8) {
      if (this.onNoteOff) this.onNoteOff(note);
    }
  }
}

export const webMidiService = new WebMidiService();

export async function initWebMidi(
  onNoteOn: NoteOnCallback,
  onNoteOff: NoteOffCallback
): Promise<WebMidiStatus> {
  return webMidiService.init(onNoteOn, onNoteOff);
}
