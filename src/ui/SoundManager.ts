export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private bgTimeout: ReturnType<typeof setTimeout> | null = null;
  private bgPlaying = false;
  private _muted = false;
  private static readonly STORAGE_KEY = 'marble-shooter-muted';

  constructor() {
    this._muted = localStorage.getItem(SoundManager.STORAGE_KEY) === '1';
    const btn = document.getElementById('mute-btn');
    if (btn) {
      btn.textContent = this._muted ? '\u{1F507}' : '\u{1F50A}';
      btn.addEventListener('click', () => this.toggleMute());
    }
  }

  get muted() { return this._muted; }

  toggleMute() {
    this._muted = !this._muted;
    localStorage.setItem(SoundManager.STORAGE_KEY, this._muted ? '1' : '0');
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : 1;
    }
    const btn = document.getElementById('mute-btn');
    if (btn) {
      btn.textContent = this._muted ? '\u{1F507}' : '\u{1F50A}';
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private get dest(): AudioNode {
    return this.masterGain || this.getCtx().destination;
  }

  // --- Sound Effects ---

  playShoot() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.dest);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // Add a subtle "whoosh" noise layer
    const noise = this.createNoise(ctx, 0.15);
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.5;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.dest);
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  }

  playHit() {
    const ctx = this.getCtx();

    // Sharp impact click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.dest);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);

    // Glass-like ping
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.connect(pingGain);
    pingGain.connect(this.dest);

    ping.type = 'sine';
    ping.frequency.setValueAtTime(1400, ctx.currentTime);
    ping.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);

    pingGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    ping.start(ctx.currentTime + 0.02);
    ping.stop(ctx.currentTime + 0.3);
  }

  playExplosion() {
    const ctx = this.getCtx();

    // Low boom
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.dest);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    // Noise burst (crackle)
    const noise = this.createNoise(ctx, 0.4);
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(3000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.dest);
    noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    // High shatter
    const shatter = ctx.createOscillator();
    const shatterGain = ctx.createGain();
    shatter.connect(shatterGain);
    shatterGain.connect(this.dest);
    shatter.type = 'square';
    shatter.frequency.setValueAtTime(2000, ctx.currentTime);
    shatter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    shatterGain.gain.setValueAtTime(0.15, ctx.currentTime);
    shatterGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    shatter.start(ctx.currentTime);
    shatter.stop(ctx.currentTime + 0.2);
  }

  playWin() {
    const ctx = this.getCtx();
    // Triumphant ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.dest);

      osc.type = 'sine';
      const startTime = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      osc.start(startTime);
      osc.stop(startTime + 0.5);

      // Add harmonic
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.connect(harmGain);
      harmGain.connect(ctx.destination);
      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 2, startTime);
      harmGain.gain.setValueAtTime(0, startTime);
      harmGain.gain.linearRampToValueAtTime(0.1, startTime + 0.03);
      harmGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      harm.start(startTime);
      harm.stop(startTime + 0.4);
    });

    // Final chord
    const chordTime = ctx.currentTime + notes.length * 0.12;
    [523, 659, 784, 1047].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.dest);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordTime);
      gain.gain.setValueAtTime(0, chordTime);
      gain.gain.linearRampToValueAtTime(0.2, chordTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, chordTime + 1.5);
      osc.start(chordTime);
      osc.stop(chordTime + 1.5);
    });
  }

  playGameOver() {
    const ctx = this.getCtx();
    // Sad descending tones
    const notes = [440, 370, 311, 247]; // A4, F#4, D#4, B3
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.dest);

      osc.type = 'triangle';
      const startTime = ctx.currentTime + i * 0.25;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + 0.4);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });

    // Low final thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.connect(thudGain);
    thudGain.connect(this.dest);
    thud.type = 'sine';
    const thudTime = ctx.currentTime + 1.1;
    thud.frequency.setValueAtTime(80, thudTime);
    thud.frequency.exponentialRampToValueAtTime(40, thudTime + 0.5);
    thudGain.gain.setValueAtTime(0.4, thudTime);
    thudGain.gain.exponentialRampToValueAtTime(0.01, thudTime + 0.5);
    thud.start(thudTime);
    thud.stop(thudTime + 0.5);
  }

  playMiss() {
    const ctx = this.getCtx();
    // Quick descending "wah wah"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.dest);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  // --- Background Music ---

  startBgMusic() {
    if (this.bgPlaying) return;
    this.bgPlaying = true;
    this.playBgLoop();
  }

  stopBgMusic() {
    this.bgPlaying = false;
    if (this.bgTimeout) {
      clearTimeout(this.bgTimeout);
      this.bgTimeout = null;
    }
  }

  private playBgLoop() {
    if (!this.bgPlaying) return;
    const ctx = this.getCtx();

    if (!this.bgGain) {
      this.bgGain = ctx.createGain();
      this.bgGain.gain.value = 0.08;
      this.bgGain.connect(this.dest);
    }

    // Chill looping ambient melody — pentatonic notes
    const scale = [262, 294, 330, 392, 440, 524, 588, 660]; // C pentatonic-ish
    const beatDuration = 0.35;
    const barLength = 16;

    // Generate a mellow pattern
    const pattern = [0, -1, 2, -1, 4, -1, 3, 1, 5, -1, 4, -1, 2, 3, 1, -1];

    for (let i = 0; i < barLength; i++) {
      const noteIdx = pattern[i];
      if (noteIdx < 0) continue;

      const freq = scale[noteIdx];
      const startTime = ctx.currentTime + i * beatDuration;

      // Soft pad tone
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(this.bgGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + beatDuration * 1.8);

      osc.start(startTime);
      osc.stop(startTime + beatDuration * 2);

      // Subtle octave-up harmonic
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.connect(harmGain);
      harmGain.connect(this.bgGain!);
      harm.type = 'sine';
      harm.frequency.setValueAtTime(freq * 2, startTime);
      harmGain.gain.setValueAtTime(0, startTime);
      harmGain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      harmGain.gain.exponentialRampToValueAtTime(0.01, startTime + beatDuration * 1.5);
      harm.start(startTime);
      harm.stop(startTime + beatDuration * 2);
    }

    // Schedule next loop
    const loopDuration = barLength * beatDuration * 1000;
    this.bgTimeout = setTimeout(() => this.playBgLoop(), loopDuration);
  }

  // --- Utility ---

  private createNoise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.start();
    return source;
  }
}
