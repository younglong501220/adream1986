/**
 * 8-Bit Web Audio Synthesizer for 1986 Famicom Doraemon Homage
 * Simulates Ricoh 2A03 NES sound chip (2 Pulse/Square channels, 1 Triangle channel, 1 Noise channel)
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  public sfxMuted: boolean = false;
  public bgmMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private currentStageBgm: number = 0;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // Lazy initialized on user action
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public setBgmMuted(muted: boolean) {
    this.bgmMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  // --- Retro Sound Effects ---

  public playShoot() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);

    // Air Cannon (空氣砲): snappy downward square frequency chirp
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playJump() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);

    // Classic NES upward jump chirp
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.16);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playItem() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Dorayaki pickup: sparkling triangle arpeggio (C6, E6, G6, C7)
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'triangle';
      const t = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.14);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  public playPowerup() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Take-copter whistle / propeller powerup
    const notes = [440, 554, 659, 880, 1108, 1318];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'square';
      const t = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.1);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  public playHit() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playExplosion() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // White noise explosion burst for monsters & boss hits
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(120, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.25);
  }

  public playFriendSaved() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Joyful rescue fanfarette: G5, C6, E6, G6 (triad sparkle)
    const notes = [783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.type = 'square';
      const t = now + idx * 0.08;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playClear() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    this.stopBGM();
    const now = this.ctx.currentTime;
    // 1986 Stage Clear fanfare: G4 -> C5 -> E5 -> G5 -> E5 -> G5 -> C6!
    const melody = [
      { f: 392.0, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.2 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.45 },
    ];

    let cursor = now;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, cursor);
      gain.gain.setValueAtTime(0.3, cursor);
      gain.gain.linearRampToValueAtTime(0.001, cursor + note.d);

      osc.start(cursor);
      osc.stop(cursor + note.d);
      cursor += note.d * 1.05;
    });
  }

  public playGameOver() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    this.stopBGM();
    const now = this.ctx.currentTime;
    const notes = [
      { f: 587.33, d: 0.2 }, // D5
      { f: 554.37, d: 0.2 }, // C#5
      { f: 523.25, d: 0.2 }, // C5
      { f: 493.88, d: 0.45 }, // B4
    ];

    let cursor = now;
    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, cursor);
      gain.gain.setValueAtTime(0.3, cursor);
      gain.gain.linearRampToValueAtTime(0.001, cursor + note.d);

      osc.start(cursor);
      osc.stop(cursor + note.d);
      cursor += note.d;
    });
  }

  public playVictory() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    this.stopBGM();
    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.28 },
      { f: 783.99, d: 0.28 },
      { f: 1046.5, d: 0.5 },
      { f: 880.0, d: 0.2 },
      { f: 1046.5, d: 0.7 },
    ];
    let cursor = now;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, cursor);
      gain.gain.setValueAtTime(0.35, cursor);
      gain.gain.linearRampToValueAtTime(0.001, cursor + n.d);
      osc.start(cursor);
      osc.stop(cursor + n.d);
      cursor += n.d * 1.05;
    });
  }

  public playSelect() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- BGM Sequencer ---

  public startStageBGM(stage: number) {
    this.init();
    this.stopBGM();
    this.currentStageBgm = stage;
    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleBgmTick();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleBgmTick() {
    if (!this.isBgmPlaying) return;

    const tempo = this.currentStageBgm === 3 ? 160 : (this.currentStageBgm === 4 ? 130 : 140); // ms per 16th note
    this.playBgmStep(this.currentStageBgm, this.bgmStep);
    this.bgmStep = (this.bgmStep + 1) % 32;

    this.bgmTimer = window.setTimeout(() => {
      this.scheduleBgmTick();
    }, tempo);
  }

  private playBgmStep(stage: number, step: number) {
    if (this.bgmMuted || !this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;

    // Melody patterns inspired by 1986 FC Doraemon & Hudson chip anthems
    let leadFreq = 0;
    let bassFreq = 0;

    if (stage === 1) {
      // Stage 1 (開拓篇): Bright bouncy march in C Major / G Major
      const leadScale = [
        523, 0, 659, 0, 784, 0, 1046, 0,
        880, 0, 784, 0, 659, 587, 523, 0,
        587, 0, 659, 0, 698, 0, 784, 0,
        880, 784, 698, 659, 587, 0, 523, 0
      ];
      const bassScale = [
        261, 261, 330, 261, 392, 392, 330, 261,
        220, 220, 261, 220, 261, 261, 261, 330,
        293, 293, 349, 293, 392, 392, 349, 293,
        392, 349, 330, 293, 261, 392, 261, 0
      ];
      leadFreq = leadScale[step];
      bassFreq = bassScale[step];
    } else if (stage === 2) {
      // Stage 2 (魔境篇): Mysterious adventure ruins in A minor
      const leadScale = [
        440, 0, 523, 0, 659, 0, 523, 0,
        493, 0, 587, 0, 659, 0, 493, 0,
        440, 440, 523, 0, 659, 659, 784, 0,
        659, 0, 587, 523, 493, 0, 440, 0
      ];
      const bassScale = [
        110, 0, 110, 165, 110, 0, 110, 165,
        123, 0, 123, 165, 123, 0, 123, 165,
        110, 110, 130, 147, 165, 165, 196, 165,
        165, 147, 130, 123, 110, 165, 110, 0
      ];
      leadFreq = leadScale[step];
      bassFreq = bassScale[step];
    } else if (stage === 3) {
      // Stage 3 (海底篇): Deep subsea waltz / echo in D minor
      const leadScale = [
        587, 0, 0, 698, 0, 0, 880, 0,
        784, 0, 0, 698, 0, 0, 659, 0,
        587, 0, 0, 659, 0, 0, 698, 0,
        880, 0, 1046, 0, 880, 784, 698, 0
      ];
      const bassScale = [
        146, 0, 220, 146, 0, 220, 174, 0,
        196, 0, 261, 196, 0, 261, 164, 0,
        146, 0, 220, 164, 0, 246, 174, 0,
        220, 0, 261, 0, 220, 196, 174, 0
      ];
      leadFreq = leadScale[step];
      bassFreq = bassScale[step];
    } else if (stage === 4) {
      // Boss Battle (Poseidon Warship): Fast driving battle pulse
      const leadScale = [
        587, 587, 880, 880, 830, 830, 784, 784,
        698, 698, 587, 587, 698, 784, 880, 0,
        880, 880, 1174, 1174, 1046, 1046, 880, 880,
        784, 698, 659, 587, 659, 698, 784, 0
      ];
      const bassScale = [
        146, 146, 146, 146, 138, 138, 138, 138,
        130, 130, 146, 146, 174, 196, 220, 146,
        220, 220, 220, 220, 196, 196, 174, 174,
        196, 174, 164, 146, 164, 174, 196, 146
      ];
      leadFreq = leadScale[step];
      bassFreq = bassScale[step];
    }

    // Play Lead Melody Note
    if (leadFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.type = 'square';
      osc.frequency.setValueAtTime(leadFreq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Play Bass Note
    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bassFreq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.13);

      osc.start(now);
      osc.stop(now + 0.13);
    }
  }
}

export const retroAudio = new RetroAudioEngine();
