/**
 * NEXUS - Dynamic Web Audio Procedural Soundtrack & SFX Engine
 * Zero external audio files required — all music & SFX synthesized in real-time.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music Layer Gains
  private baseDroneGain: GainNode | null = null;
  private energyLayerGain: GainNode | null = null;
  private waterLayerGain: GainNode | null = null;
  private gravityLayerGain: GainNode | null = null;
  private timeLayerGain: GainNode | null = null;
  private coreLayerGain: GainNode | null = null;

  private isRunning: boolean = false;
  private soundMuted: boolean = false;
  private musicMuted: boolean = false;
  private masterVol: number = 0.8;

  // Active oscillator intervals
  private musicIntervalId: any = null;
  private stepCounter: number = 0;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.setupMusicLayers();
      this.startAmbientMusicLoop();
      this.isRunning = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  private resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private setupMusicLayers() {
    if (!this.ctx || !this.musicGain) return;

    // Base Drone
    this.baseDroneGain = this.ctx.createGain();
    this.baseDroneGain.gain.value = 0.25;
    this.baseDroneGain.connect(this.musicGain);

    // Energy Layer (pulsing synth)
    this.energyLayerGain = this.ctx.createGain();
    this.energyLayerGain.gain.value = 0.0;
    this.energyLayerGain.connect(this.musicGain);

    // Water Layer (fluid organic hum)
    this.waterLayerGain = this.ctx.createGain();
    this.waterLayerGain.gain.value = 0.0;
    this.waterLayerGain.connect(this.musicGain);

    // Gravity Layer (sub pulse)
    this.gravityLayerGain = this.ctx.createGain();
    this.gravityLayerGain.gain.value = 0.0;
    this.gravityLayerGain.connect(this.musicGain);

    // Time Layer (clockwork sync)
    this.timeLayerGain = this.ctx.createGain();
    this.timeLayerGain.gain.value = 0.0;
    this.timeLayerGain.connect(this.musicGain);

    // Core Layer (radiant harmony)
    this.coreLayerGain = this.ctx.createGain();
    this.coreLayerGain.gain.value = 0.0;
    this.coreLayerGain.connect(this.musicGain);

    // Persistent atmospheric base drone oscillators
    const freqs = [55, 110, 164.81]; // A1, A2, E3
    freqs.forEach((f) => {
      if (!this.ctx || !this.baseDroneGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = f;

      filter.type = "lowpass";
      filter.frequency.value = 220;

      osc.connect(filter);
      filter.connect(this.baseDroneGain);
      osc.start();
    });
  }

  /**
   * Updates music layers based on global world restoration percentages
   */
  public updateWorldState(restorations: Record<string, number>) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const smooth = 1.5;

    const s1 = (restorations["awakening"] || 0) / 100;
    const s2 = (restorations["flooded"] || 0) / 100;
    const s3 = (restorations["gravity"] || 0) / 100;
    const s4 = (restorations["clockwork"] || 0) / 100;
    const s5 = (restorations["memory"] || 0) / 100;
    const s6 = (restorations["core"] || 0) / 100;

    if (this.energyLayerGain) {
      this.energyLayerGain.gain.setTargetAtTime(s1 * 0.35, now, smooth);
    }
    if (this.waterLayerGain) {
      this.waterLayerGain.gain.setTargetAtTime(s2 * 0.35, now, smooth);
    }
    if (this.gravityLayerGain) {
      this.gravityLayerGain.gain.setTargetAtTime(s3 * 0.35, now, smooth);
    }
    if (this.timeLayerGain) {
      this.timeLayerGain.gain.setTargetAtTime(s4 * 0.35, now, smooth);
    }
    if (this.coreLayerGain) {
      this.coreLayerGain.gain.setTargetAtTime(Math.max(s5, s6) * 0.4, now, smooth);
    }
  }

  private startAmbientMusicLoop() {
    if (this.musicIntervalId) clearInterval(this.musicIntervalId);

    // BPM: 84 (~178ms per 16th note)
    const intervalMs = 178;
    const scale = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33]; // A minor pentatonic / dorian

    this.musicIntervalId = setInterval(() => {
      if (!this.ctx || !this.isRunning || this.musicMuted || this.soundMuted) return;
      this.stepCounter++;

      const step = this.stepCounter % 16;
      const now = this.ctx.currentTime;

      // Energy layer: Pulse arpeggio on active beats
      if (this.energyLayerGain && this.energyLayerGain.gain.value > 0.05) {
        if (step % 2 === 0) {
          const noteIndex = (step * 3) % scale.length;
          this.playSynthPluck(scale[noteIndex], 0.15, this.energyLayerGain, "triangle");
        }
      }

      // Water layer: Flowing bell drops on quarter notes
      if (this.waterLayerGain && this.waterLayerGain.gain.value > 0.05) {
        if (step === 0 || step === 6 || step === 10) {
          const freq = scale[(step + 2) % scale.length] * 1.5;
          this.playGlassDrop(freq, this.waterLayerGain);
        }
      }

      // Gravity layer: Deep resonant sub-thump on downbeats
      if (this.gravityLayerGain && this.gravityLayerGain.gain.value > 0.05) {
        if (step === 0 || step === 8) {
          this.playSubPulse(55, this.gravityLayerGain);
        }
      }

      // Time layer: Precise tick clock arpeggio
      if (this.timeLayerGain && this.timeLayerGain.gain.value > 0.05) {
        if (step % 4 === 0) {
          this.playClockChime(880, this.timeLayerGain);
        }
      }

      // Core layer: High radiant choral overtone
      if (this.coreLayerGain && this.coreLayerGain.gain.value > 0.05) {
        if (step === 0 || step === 12) {
          this.playChoralPad([440, 554.37, 659.25], this.coreLayerGain);
        }
      }
    }, intervalMs);
  }

  // --- Procedural Synth Voice Helpers ---

  private playSynthPluck(freq: number, dur: number, target: GainNode, type: OscillatorType = "sine") {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + dur);
  }

  private playGlassDrop(freq: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.6);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playSubPulse(freq: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  private playClockChime(freq: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playChoralPad(freqs: number[], target: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    freqs.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(gain);
      gain.connect(target);

      osc.start(now);
      osc.stop(now + 2.0);
    });
  }

  // --- Sound Effects (SFX) ---

  public playClick() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playHover() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playEnergyRotate() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playEnergyPowerPulse() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  }

  public playValveTurn() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWaterFlow() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    // White noise filtered
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.4);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playGravityShift() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playTimeShift() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playGlyphDecode() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + i * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  public playPuzzleSolved() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    // Radiant triumphal fanfare: D4 -> F#4 -> A4 -> D5 -> F#5
    const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx >= 4 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.28, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  }

  public playEchoChime() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    [659.25, 987.77, 1318.51].forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  public playError() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.soundMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- Audio Controls ---

  public toggleSound(): boolean {
    this.soundMuted = !this.soundMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
    return this.soundMuted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.musicMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVol = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.soundMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public isMuted() {
    return this.soundMuted;
  }

  public isMusicMuted() {
    return this.musicMuted;
  }
}

export const soundEngine = new SoundEngine();
