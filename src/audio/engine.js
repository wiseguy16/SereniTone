import * as Tone from "tone";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const positiveFloor = (value, floor = 0.0001) => Math.max(floor, value);
const BIRD_NOTES = ["C5", "E5", "G5", "A5", "C6", "D6"];

class SoundscapeEngine {
  constructor() {
    this.isReady = false;
    this.isPlaying = false;
    this.nodes = null;
    this.toneEnabled = true;
    this.birdLoop = null;
  }

  async ensureReady() {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }

    if (!this.nodes) {
      this.nodes = this.createNodes();
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }
      this.isReady = true;
    }
  }

  createNodes() {
    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 950,
      rolloff: -24,
      Q: 0.2,
    });

    const masterGain = new Tone.Gain(0.6).toDestination();
    const baseGain = new Tone.Gain(0.28);
    const noiseGain = new Tone.Gain(0.22);
    const speechGain = new Tone.Gain(0.04);
    const insectGain = new Tone.Gain(0);
    const birdGain = new Tone.Gain(0);
    const insectPanner = new Tone.Panner(-0.35);
    const birdPanner = new Tone.Panner(0.28);
    const centerGain = new Tone.Gain(1);
    const leftGain = new Tone.Gain(0);
    const rightGain = new Tone.Gain(0);
    const leftDelay = new Tone.Delay(0.004);
    const rightDelay = new Tone.Delay(0.009);
    const leftPanner = new Tone.Panner(-1);
    const rightPanner = new Tone.Panner(1);

    const oscillator = new Tone.Oscillator({
      frequency: 220,
      type: "sine",
      volume: -14,
    });

    const drift = new Tone.LFO({
      min: 210,
      max: 230,
      frequency: 0.03,
      type: "sine",
    });

    const motion = new Tone.LFO({
      min: 0.03,
      max: 0.18,
      frequency: 0.08,
      type: "triangle",
    });

    const brightnessMotion = new Tone.LFO({
      min: 800,
      max: 1300,
      frequency: 0.05,
      type: "sine",
    });

    const noise = new Tone.Noise("pink");
    const speechBand = new Tone.Noise("white");
    const speechFilter = new Tone.Filter({
      type: "bandpass",
      frequency: 1400,
      Q: 1.8,
    });
    const speechEnvelope = new Tone.AutoFilter({
      frequency: 0.6,
      depth: 0.7,
      baseFrequency: 700,
      octaves: 2.2,
    });
    const insectNoise = new Tone.Noise("pink");
    const insectFilter = new Tone.Filter({
      type: "bandpass",
      frequency: 5200,
      Q: 2.4,
    });
    const insectMotion = new Tone.LFO({
      min: 0.004,
      max: 0.08,
      frequency: 0.22,
      type: "triangle",
    });
    const birdSynth = new Tone.FMSynth({
      harmonicity: 5,
      modulationIndex: 8,
      oscillator: { type: "sine" },
      modulation: { type: "triangle" },
      envelope: {
        attack: 0.002,
        decay: 0.08,
        sustain: 0,
        release: 0.08,
      },
      modulationEnvelope: {
        attack: 0.001,
        decay: 0.06,
        sustain: 0,
        release: 0.05,
      },
      volume: -18,
    });
    const birdFilter = new Tone.Filter({
      type: "bandpass",
      frequency: 2600,
      Q: 1.2,
    });

    oscillator.connect(baseGain);
    noise.connect(noiseGain);
    speechBand.connect(speechFilter);
    speechFilter.connect(speechEnvelope);
    speechEnvelope.connect(speechGain);
    insectNoise.connect(insectFilter);
    insectFilter.connect(insectGain);
    insectGain.connect(insectPanner);
    insectPanner.connect(masterGain);
    birdSynth.connect(birdFilter);
    birdFilter.connect(birdGain);
    birdGain.connect(birdPanner);
    birdPanner.connect(masterGain);

    baseGain.connect(filter);
    noiseGain.connect(filter);
    speechGain.connect(filter);
    filter.connect(centerGain);
    centerGain.connect(masterGain);
    filter.connect(leftDelay);
    filter.connect(rightDelay);
    leftDelay.connect(leftGain);
    rightDelay.connect(rightGain);
    leftGain.connect(leftPanner);
    rightGain.connect(rightPanner);
    leftPanner.connect(masterGain);
    rightPanner.connect(masterGain);

    drift.connect(oscillator.frequency);
    motion.connect(baseGain.gain);
    motion.connect(noiseGain.gain);
    brightnessMotion.connect(filter.frequency);
    insectMotion.connect(insectGain.gain);

    oscillator.start();
    noise.start();
    speechBand.start();
    insectNoise.start();
    drift.start();
    motion.start();
    brightnessMotion.start();
    insectMotion.start();
    speechEnvelope.start();

    this.birdLoop = new Tone.Loop((time) => {
      if (!this.isPlaying || !this.nodes || this.nodes.birdGain.gain.value <= 0.0001) {
        return;
      }

      const note = BIRD_NOTES[Math.floor(Math.random() * BIRD_NOTES.length)];
      birdSynth.triggerAttackRelease(note, "32n", time, 1);
      birdSynth.triggerAttackRelease(note, "32n", time + 0.08, 0.8);
      if (Math.random() > 0.35) {
        const secondNote = BIRD_NOTES[Math.floor(Math.random() * BIRD_NOTES.length)];
        birdSynth.triggerAttackRelease(secondNote, "32n", time + 0.18, 0.75);
      }
    }, "2n");
    this.birdLoop.humanize = true;
    this.birdLoop.probability = 0.55;
    this.birdLoop.start(0);

    masterGain.gain.value = 0;

    return {
      oscillator,
      noise,
      speechBand,
      insectNoise,
      filter,
      masterGain,
      baseGain,
      noiseGain,
      speechGain,
      insectGain,
      birdGain,
      insectPanner,
      birdPanner,
      centerGain,
      leftGain,
      rightGain,
      leftDelay,
      rightDelay,
      leftPanner,
      rightPanner,
      drift,
      motion,
      brightnessMotion,
      insectMotion,
      speechFilter,
      speechEnvelope,
      insectFilter,
      birdSynth,
      birdFilter,
    };
  }

  update(params, speechPreference = 0) {
    if (!this.nodes) {
      return;
    }

    const brightnessFrequency = 500 + params.brightness * 2600;
    const motionRate = 0.02 + params.motionSpeed * 1.2;
    const spatial = clamp(params.stereoWidth, 0, 1);
    const centerLevel = 1 - spatial;
    const sideLevel = spatial * 0.5;
    const toneLevel = params.toneLevel ?? 0;
    const insectLevel = params.insectLevel ?? 0;
    const birdLevel = params.birdLevel ?? 0;

    if (toneLevel <= 0.0001 && this.toneEnabled) {
      this.nodes.oscillator.volume.value = -120;
      this.nodes.baseGain.gain.value = 0;
      this.toneEnabled = false;
    } else if (toneLevel > 0.0001 && !this.toneEnabled) {
      this.nodes.oscillator.volume.value = -14;
      this.toneEnabled = true;
    }

    this.nodes.masterGain.gain.value = positiveFloor(params.volume);
    this.nodes.oscillator.frequency.value = params.toneFrequency;
    this.nodes.baseGain.gain.value = this.toneEnabled ? Math.max(0, toneLevel) : 0;
    this.nodes.noiseGain.gain.value = positiveFloor(0.06 + params.noiseLevel * 0.34);
    this.nodes.speechGain.gain.value = positiveFloor(0.015 + speechPreference * 0.09);
    this.nodes.insectFilter.frequency.value = 4500 + params.brightness * 2600;
    this.nodes.insectGain.gain.value = insectLevel <= 0.0001 ? 0 : insectLevel * 0.16;
    this.nodes.birdGain.gain.value = birdLevel <= 0.0001 ? 0 : birdLevel * 0.24;
    this.nodes.birdFilter.frequency.value = 2600 + params.brightness * 1800;
    this.nodes.insectPanner.pan.value = -0.15 - spatial * 0.55;
    this.nodes.birdPanner.pan.value = 0.12 + spatial * 0.5;
    this.nodes.filter.frequency.value = positiveFloor(brightnessFrequency);
    this.nodes.centerGain.gain.value = centerLevel;
    this.nodes.leftGain.gain.value = sideLevel;
    this.nodes.rightGain.gain.value = sideLevel;
    this.nodes.leftPanner.pan.value = -spatial;
    this.nodes.rightPanner.pan.value = spatial;
    this.nodes.motion.frequency.value = motionRate;
    this.nodes.brightnessMotion.frequency.value = 0.01 + params.motionSpeed * 0.3;
    this.nodes.brightnessMotion.min = brightnessFrequency * 0.82;
    this.nodes.brightnessMotion.max = brightnessFrequency * 1.12;
    this.nodes.drift.min = params.toneFrequency * 0.95;
    this.nodes.drift.max = params.toneFrequency * 1.05;
    this.nodes.motion.min = 0.025;
    this.nodes.motion.max = 0.08 + params.motionSpeed * 0.24;
    this.nodes.insectMotion.frequency.value = 0.08 + params.motionSpeed * 0.35;
    this.nodes.insectMotion.min = insectLevel <= 0.0001 ? 0 : 0.004;
    this.nodes.insectMotion.max = insectLevel <= 0.0001 ? 0 : 0.03 + insectLevel * 0.12;
  }

  async start(params, speechPreference = 0) {
    await this.ensureReady();
    this.isPlaying = true;
    this.update(params, speechPreference);
    this.nodes.masterGain.gain.value = positiveFloor(params.volume);
  }

  stop() {
    if (!this.nodes) {
      return;
    }

    this.isPlaying = false;
    this.nodes.masterGain.gain.rampTo(0, 0.4);
  }

  dispose() {
    if (!this.nodes) {
      return;
    }

    if (this.birdLoop) {
      this.birdLoop.dispose();
      this.birdLoop = null;
    }

    Object.values(this.nodes).forEach((node) => {
      if (node && typeof node.dispose === "function") {
        node.dispose();
      }
    });

    this.nodes = null;
    this.isReady = false;
    this.isPlaying = false;
    this.toneEnabled = true;
  }
}

export function createSoundscapeEngine() {
  return new SoundscapeEngine();
}
