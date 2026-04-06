const GOAL_BY_ENVIRONMENT = {
  concentrate: "focus",
  relax: "calm",
  sleep: "rest",
  lessAware: "focus",
  lessOnEdge: "calm",
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const TIMING_EXPLANATIONS = {
  quiet: "You mostly notice it in quiet spaces, which often means external sound is no longer competing with the internal sound.",
  focus: "You notice it most when trying to concentrate, so the soundscape should stay steady and low-distraction.",
  sleep: "You notice it most at bedtime, so the soundscape should feel soft, stable, and easy to leave running.",
  afterNoise: "You notice it more after noise exposure or long listening sessions, which can point toward sound sensitivity or temporary aggravation.",
  stress: "It seems to flare more during stress or fatigue, which often makes the sound feel more intrusive even if the volume has not changed much.",
};

const CHARACTER_EXPLANATIONS = {
  ring: "A ring or high tone often feels sharp and attention-grabbing, so softer masking and lower brightness can help.",
  hiss: "A hiss or airy sound is often better matched with gentle broadband noise than with a strong pure tone.",
  hum: "A hum or low drone can blend better with soft low-mid texture and restrained movement.",
  buzz: "A buzz can feel dense or electrical, so smoother masking textures can reduce contrast and fatigue.",
  whoosh: "A whoosh or pulsing sound deserves extra caution, especially if it feels heartbeat-like or new.",
};

const CHALLENGE_EXPLANATIONS = {
  concentrate: "The soundscape will prioritize steadiness and reduced distraction so your task can stay in the foreground.",
  relax: "The soundscape will lean toward softer edges and gentler motion to lower sensory load.",
  sleep: "The soundscape will favor low-intensity continuity so the room feels less silent without demanding attention.",
  lessAware: "The soundscape will aim to reduce the contrast between silence and the sound you notice.",
  lessOnEdge: "The soundscape will stay smoother and less sharp so it feels less activating.",
};

export const SOUND_MODELS = {
  airplane: {
    name: "Airplane",
    description: "Low-brightness cabin-style masking with a steady, unobtrusive bed.",
    params: {
      noiseLevel: 0.18,
      brightness: 0.1,
      motionSpeed: 0.2,
      stereoWidth: 0.11,
      volume: 0.14,
      toneLevel: 0,
      insectLevel: 0,
      birdLevel: 0,
    },
  },
  ocean: {
    name: "Ocean",
    description: "Brighter surf-like texture with a softer center and low spatial spread.",
    params: {
      noiseLevel: 0.33,
      brightness: 0.96,
      motionSpeed: 0.2,
      stereoWidth: 0.02,
      volume: 0.1,
      toneLevel: 0,
      insectLevel: 0,
      birdLevel: 0,
    },
  },
};

export const DEFAULT_PARAMS = {
  volume: 0.65,
  noiseLevel: 0.35,
  toneLevel: 0,
  insectLevel: 0,
  birdLevel: 0,
  toneFrequency: 220,
  brightness: 0.38,
  motionSpeed: 0.22,
  stereoWidth: 0.25,
};

export function buildProfile(form) {
  const environmentGoal = GOAL_BY_ENVIRONMENT[form.mainChallenge] ?? "focus";
  const soundSensitivity = Number(form.sensitivity) / 100;
  const tinnitusWeight = form.hasTinnitus ? 0.12 : 0;
  const intermittentWeight = form.tinnitusType === "intermittent" ? -0.04 : 0;
  const pulsatileWeight = form.tinnitusType === "pulsatile" ? -0.08 : 0;

  const maskingLevel = clamp(0.34 + soundSensitivity * 0.28 + tinnitusWeight);
  const brightness = clamp(
    0.58 - soundSensitivity * 0.3 + intermittentWeight + pulsatileWeight,
  );
  const motion = clamp(
    form.mainChallenge === "concentrate" || form.mainChallenge === "lessAware"
      ? 0.18
      : form.mainChallenge === "relax" || form.mainChallenge === "lessOnEdge"
        ? 0.24
        : 0.1,
  );

  const speechPreference = 0;

  const triage = buildTriage(form);

  return {
    goal: environmentGoal,
    maskingLevel,
    brightness,
    motion,
    speechPreference,
    triage,
    tinnitus: {
      hasTinnitus: form.hasTinnitus,
      type: form.tinnitusType,
    },
  };
}

export function profileToParams(profile, form) {
  const tonalBoost = 0;
  const mixedBoost = 0;
  const modelParams = SOUND_MODELS[profile.triage?.recommendedModel]?.params;

  if (modelParams) {
    return {
      ...modelParams,
      toneFrequency: 180 + tonalBoost + mixedBoost + profile.brightness * 170,
    };
  }

  return {
    volume: clamp(0.56 + profile.maskingLevel * 0.2, 0.2, 0.9),
    noiseLevel: clamp(profile.maskingLevel),
    toneLevel: 0,
    toneFrequency: 180 + tonalBoost + mixedBoost + profile.brightness * 170,
    brightness: clamp(profile.brightness),
    motionSpeed: clamp(profile.motion, 0.05, 0.6),
    stereoWidth: clamp(form.noticeTiming === "sleep" ? 0.12 : 0.22 + profile.motion * 0.4),
  };
}

export function buildTriage(form) {
  const modelChoice = chooseSoundModel(form);
  const urgency =
    form.tinnitusType === "pulsatile"
      ? "If a sound feels heartbeat-like, new, or clearly rhythmic, it is worth getting medical evaluation rather than relying only on masking."
      : form.mainChallenge === "sleep" && form.noticeTiming === "sleep"
        ? "Because this pattern is affecting both day and night, it may be worth discussing with a clinician or audiologist if it is persistent."
        : "This looks appropriate for a non-diagnostic sound support workflow, with the reminder that ongoing or worsening symptoms still deserve professional evaluation.";

  const headline = !form.hasTinnitus
    ? "Sound sensitivity support"
    : form.tinnitusType === "pulsatile"
      ? "Rhythmic sound pattern"
      : form.tinnitusType === "intermittent"
        ? "Intermittent sound pattern"
        : "Steady sound pattern";

  const explanation = [
    TIMING_EXPLANATIONS[form.noticeTiming],
    CHARACTER_EXPLANATIONS[form.soundCharacter],
    CHALLENGE_EXPLANATIONS[form.mainChallenge],
  ].filter(Boolean);

  const soundStrategy = !form.hasTinnitus
    ? "Use the soundscape as a stable background texture that reduces harsh contrast from the room rather than trying to cover an internal tone."
    : form.soundCharacter === "hiss" || form.soundCharacter === "buzz"
      ? "Start with soft masking noise, low tone layer, and moderate brightness so the internal sound feels less exposed."
      : form.soundCharacter === "ring"
        ? "Start with lower brightness and a softer masking bed so sharp tones feel less dominant."
        : form.soundCharacter === "hum"
          ? "Use low-motion, low-to-mid masking texture so the soundscape blends with the lower drone instead of competing with it."
          : "Use gentle masking and keep the tonal layer off unless it clearly helps.";

  const careNotes = [
    "This tool does not diagnose hearing loss, tinnitus causes, or vascular conditions.",
    urgency,
  ];

  return {
    headline,
    explanation,
    soundStrategy: `${soundStrategy} Recommended starting model: ${SOUND_MODELS[modelChoice.key].name}.`,
    careNotes,
    recommendedModel: modelChoice.key,
    recommendedModelName: SOUND_MODELS[modelChoice.key].name,
    recommendedModelReason: modelChoice.reason,
  };
}

function chooseSoundModel(form) {
  if (form.soundStyle === "cabin") {
    return {
      key: "airplane",
      reason: "you chose a steady cabin-like starting atmosphere",
    };
  }

  if (form.soundStyle === "ocean") {
    return {
      key: "ocean",
      reason: "you chose a softer ocean-like starting atmosphere",
    };
  }

  if (form.soundStyle === "neutral") {
    return {
      key: "airplane",
      reason: "you chose a more neutral and steady starting atmosphere",
    };
  }

  let airplaneScore = 0;
  let oceanScore = 0;
  const airplaneReasons = [];
  const oceanReasons = [];

  if (form.mainChallenge === "concentrate" || form.mainChallenge === "lessAware") {
    airplaneScore += 3;
    airplaneReasons.push("you want a steadier background for focus or reduced awareness");
  }

  if (form.mainChallenge === "sleep" || form.mainChallenge === "relax") {
    oceanScore += 3;
    oceanReasons.push("your use case leans more toward rest or sleep");
  }

  if (form.mainChallenge === "lessOnEdge") {
    oceanScore += 2;
    oceanReasons.push("a softer surf-like texture often suits decompression better");
  }

  if (form.soundCharacter === "hiss" || form.soundCharacter === "whoosh") {
    oceanScore += 2;
    oceanReasons.push("your sound description is closer to airy or surf-like masking");
  }

  if (form.soundCharacter === "hum" || form.soundCharacter === "buzz") {
    airplaneScore += 2;
    airplaneReasons.push("your sound description is closer to a steady low background texture");
  }

  if (form.noticeTiming === "quiet" || form.noticeTiming === "stress" || form.noticeTiming === "sleep") {
    oceanScore += 1;
    oceanReasons.push("a gentler bedtime-style texture may reduce contrast in quiet moments");
  }

  if (form.noticeTiming === "focus" || form.noticeTiming === "afterNoise") {
    airplaneScore += 1;
    airplaneReasons.push("a more neutral everyday masking profile may be easier to tolerate longer");
  }

  if (airplaneScore >= oceanScore) {
    return {
      key: "airplane",
      reason:
        airplaneReasons[0] ??
        "your answers point toward a steadier low-contrast masking profile",
    };
  }

  return {
    key: "ocean",
    reason:
      oceanReasons[0] ??
      "your answers point toward a softer surf-like soothing profile",
  };
}
