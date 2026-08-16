/* ==========================================================================
       1. PROCEDURAL AUDIO ENGINE & SOUNDTRACK INTEGRATION
       ========================================================================== */
    class GhibliAudioSystem {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.master = null;
        this.windGain = null;
        this.windFilter = null;
        this.thrustOsc = null;
        this.thrustGain = null;
        this.initialized = false;
      }

      init() {
        if (this.initialized) return;
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();

          this.master = this.ctx.createGain();
          this.master.gain.setValueAtTime(0.65, this.ctx.currentTime);
          this.master.connect(this.ctx.destination);

          const bufferSize = this.ctx.sampleRate * 2;
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          this.windFilter = this.ctx.createBiquadFilter();
          this.windFilter.type = 'lowpass';
          this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
          this.windFilter.Q.setValueAtTime(1.6, this.ctx.currentTime);

          this.windGain = this.ctx.createGain();
          this.windGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

          whiteNoise.connect(this.windFilter);
          this.windFilter.connect(this.windGain);
          this.windGain.connect(this.master);
          whiteNoise.start(0);

          this.thrustOsc = this.ctx.createOscillator();
          this.thrustOsc.type = 'triangle';
          this.thrustOsc.frequency.setValueAtTime(88, this.ctx.currentTime);

          this.thrustGain = this.ctx.createGain();
          this.thrustGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

          this.thrustOsc.connect(this.thrustGain);
          this.thrustGain.connect(this.master);
          this.thrustOsc.start(0);

          this.initialized = true;
        } catch (e) {
          console.warn('Web Audio error:', e);
        }
      }

      updateSpeed(speedRatio) {
        if (!this.initialized || !this.enabled) return;
        const targetFreq = 180 + speedRatio * 1800;
        const targetGain = 0.03 + speedRatio * 0.26;
        this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
        this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
      }

      setThrust(active) {
        if (!this.initialized || !this.enabled) return;
        this.thrustGain.gain.setTargetAtTime(active ? 0.16 : 0.0, this.ctx.currentTime, 0.08);
      }

      playChord(freqs, duration = 1.2, type = 'sine') {
        if (!this.initialized || !this.enabled) return;
        const now = this.ctx.currentTime;
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.28 / freqs.length, now + idx * 0.05 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + duration);

          osc.connect(gain);
          gain.connect(this.master);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + duration);
        });
      }

      playCoin() {
        this.playChord([987.77, 1318.51], 0.35, 'sine');
      }

      playPop() {
        if (!this.initialized || !this.enabled) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      playUpdraft() {
        this.playChord([261.63, 329.63, 392.00, 523.25], 0.9, 'triangle');
      }

      playPickup() {
        this.playChord([392.00, 523.25, 659.25, 783.99], 0.8, 'sine');
      }

      playRingCollect(pitchMult = 1.0) {
        this.playChord([783.99 * pitchMult, 987.77 * pitchMult, 1174.66 * pitchMult], 0.65, 'sine');
      }

      playBarrelRoll() {
        if (!this.initialized || !this.enabled) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.4);
      }

      playSparrowFound() {
        this.playChord([523.25, 659.25, 783.99, 1046.50], 1.8, 'sine');
      }

      playDeliveryFanfare() {
        this.playChord([261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50], 2.4, 'sine');
      }

      playBadgeUnlocked() {
        this.playChord([523.25, 659.25, 783.99, 1046.50, 1318.51], 1.5, 'triangle');
      }

      playBrake() {
        if (!this.initialized || !this.enabled) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      toggleAudio() {
        this.enabled = !this.enabled;
        if (this.master) {
          this.master.gain.setValueAtTime(this.enabled ? 0.65 : 0, this.ctx.currentTime);
        }
        return this.enabled;
      }
    }

    const sound = new GhibliAudioSystem();

    // Background music removed — SFX only
