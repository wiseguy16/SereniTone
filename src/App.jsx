import React, { useEffect, useMemo, useRef, useState } from "react";
import IntakeForm from "./components/IntakeForm";
import Player from "./components/Player";
import Controls from "./components/Controls";
import IntroCards from "./components/IntroCards";
import { createSoundscapeEngine } from "./audio/engine";
import { applyFeedback } from "./logic/feedback";
import { buildProfile, DEFAULT_PARAMS, profileToParams } from "./logic/profile";

const PRESET_STORAGE_KEY = "serenitone-presets";
const PRESET_STORAGE_VERSION = 2;
const TINNITUS_GUIDE_URL = "https://wiseguy16.github.io/TinnitusGuide/";

const INITIAL_FORM = {
  hasTinnitus: true,
  tinnitusType: "constant",
  sensitivity: 55,
  environment: "work",
  audioType: "auto",
  soundCharacter: "ring",
  noticeTiming: "quiet",
  mainChallenge: "concentrate",
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const PARAM_LIMITS = {
  noiseLevel: [0, 1],
  brightness: [0, 1],
  motionSpeed: [0.03, 0.8],
  stereoWidth: [0, 1],
  volume: [0.1, 1],
  toneLevel: [0, 0.05],
  insectLevel: [0, 0.2],
  birdLevel: [0, 0.2],
  toneFrequency: [120, 540],
};

function readStoredPresets() {
  try {
    const stored = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.version === PRESET_STORAGE_VERSION &&
      Array.isArray(parsed.presets)
    ) {
      return parsed.presets;
    }

    // Drop legacy or incompatible preset shapes so outdated mixes do not linger.
    window.localStorage.setItem(
      PRESET_STORAGE_KEY,
      JSON.stringify({ version: PRESET_STORAGE_VERSION, presets: [] }),
    );
    return [];
  } catch (storageError) {
    console.error(storageError);
    return [];
  }
}

function writeStoredPresets(presets) {
  window.localStorage.setItem(
    PRESET_STORAGE_KEY,
    JSON.stringify({
      version: PRESET_STORAGE_VERSION,
      presets,
    }),
  );
}

function WelcomeGraphic() {
  return (
    <svg viewBox="0 0 320 180" className="section-graphic" aria-hidden="true">
      <defs>
        <linearGradient id="welcomeGlow" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(240,154,75,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect x="10" y="18" width="300" height="144" rx="24" fill="url(#welcomeGlow)" />
      <path d="M26 112 C58 74, 92 74, 124 112 S190 150, 222 112 286 74, 308 96" className="graphic-line strong" />
      <path d="M26 126 C58 102, 92 102, 124 126 S190 150, 222 126 286 102, 308 112" className="graphic-line" />
      <circle cx="92" cy="86" r="9" className="graphic-dot" />
      <circle cx="194" cy="126" r="7" className="graphic-dot soft" />
      <circle cx="252" cy="90" r="12" className="graphic-ring" />
    </svg>
  );
}

function HeroGraphic() {
  return (
    <svg viewBox="0 0 360 220" className="section-graphic hero-graphic" aria-hidden="true">
      <defs>
        <linearGradient id="heroWave" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(240,154,75,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>
      </defs>
      <circle cx="278" cy="70" r="48" className="graphic-ring" />
      <circle cx="278" cy="70" r="26" className="graphic-ring soft-ring" />
      <path d="M18 136 C54 94, 88 94, 124 136 S196 178, 232 136 304 94, 342 124" className="hero-wave strong-wave" />
      <path d="M18 154 C54 124, 88 122, 124 154 S196 186, 232 154 304 126, 342 146" className="hero-wave" />
      <path d="M18 172 C54 150, 88 148, 124 172 S196 194, 232 172 304 148, 342 164" className="hero-wave faint-wave" />
      <rect x="22" y="26" width="76" height="20" rx="10" className="graphic-chip" />
      <rect x="108" y="26" width="100" height="20" rx="10" className="graphic-chip soft" />
    </svg>
  );
}

function DashboardGraphic({ isPlaying }) {
  return (
    <svg viewBox="0 0 260 220" className="section-graphic dashboard" aria-hidden="true">
      <circle cx="130" cy="110" r="72" className="dashboard-ring outer" />
      <circle cx="130" cy="110" r="48" className="dashboard-ring inner" />
      <circle cx="130" cy="110" r={isPlaying ? 20 : 14} className="dashboard-core" />
      <path d="M54 166 C88 142, 112 142, 146 166 S214 190, 226 172" className="graphic-line" />
      <path d="M38 58 C74 36, 108 34, 138 58 S198 86, 222 62" className="graphic-line strong" />
    </svg>
  );
}

function SupportGraphic() {
  return (
    <svg viewBox="0 0 300 120" className="section-graphic support-graphic" aria-hidden="true">
      <rect x="18" y="22" width="264" height="76" rx="20" className="graphic-chip soft" />
      <path d="M34 54 C58 32, 82 32, 106 54 S154 78, 178 54 226 32, 250 54 274 74, 282 64" className="graphic-line strong" />
      <path d="M34 72 C58 60, 82 60, 106 72 S154 84, 178 72 226 58, 250 70 274 80, 282 76" className="graphic-line" />
      <circle cx="92" cy="54" r="8" className="graphic-dot" />
      <circle cx="206" cy="72" r="8" className="graphic-dot soft" />
      <text x="34" y="40" className="info-label">Internal sound</text>
      <text x="166" y="96" className="info-label">Supportive background sound</text>
    </svg>
  );
}

export default function App() {
  const engineRef = useRef(null);
  const setupRef = useRef(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [profile, setProfile] = useState(null);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  if (!engineRef.current) {
    engineRef.current = createSoundscapeEngine();
  }

  useEffect(() => {
    setSavedPresets(readStoredPresets());

    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (profile) {
      engineRef.current?.update(params, profile.speechPreference);
    }
  }, [params, profile]);

  const profileSummary = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [
      `Goal: ${profile.goal}`,
      `Model: ${profile.triage?.recommendedModelName}`,
      `Masking ${Math.round(profile.maskingLevel * 100)}%`,
      `Brightness ${Math.round(profile.brightness * 100)}%`,
      profile.triage?.headline,
      profile.speechPreference > 0 ? "Speech texture enabled" : "Speech texture off",
    ];
  }, [profile]);

  const handleFormChange = (key, value) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const handleIntroSoundChoice = (value) => {
    setFormValues((current) => ({
      ...current,
      hasTinnitus: true,
      soundCharacter: value,
      tinnitusType: value === "whoosh" ? "pulsatile" : current.tinnitusType,
    }));
  };

  const handleContinueToSetup = () => {
    setShowSetup(true);

    window.setTimeout(() => {
      setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleGenerate = (event) => {
    event.preventDefault();
    const nextProfile = buildProfile(formValues);
    const nextParams = profileToParams(nextProfile, formValues);

    setProfile(nextProfile);
    setParams(nextParams);
    setError("");
  };

  const handleTogglePlayback = async () => {
    if (!profile) {
      setError("Create a soundscape before starting playback.");
      return;
    }

    try {
      if (isPlaying) {
        engineRef.current.stop();
        setIsPlaying(false);
        return;
      }

      await engineRef.current.start(params, profile.speechPreference);
      setIsPlaying(true);
      setError("");
    } catch (audioError) {
      console.error(audioError);
      setError("Audio could not start. Try again after interacting with the page.");
    }
  };

  const handleControlChange = (key, value) => {
    const [min, max] = PARAM_LIMITS[key] ?? [0, 1];
    setParams((current) => ({ ...current, [key]: clamp(value, min, max) }));
  };

  const handleFeedback = (feedbackKey) => {
    setParams((current) => applyFeedback(feedbackKey, current));
  };

  const handleSavePreset = () => {
    if (!profile || !presetName.trim()) {
      return;
    }

    const nextPresets = [
      {
        id: `${Date.now()}`,
        name: presetName.trim(),
        schemaVersion: PRESET_STORAGE_VERSION,
        profile,
        params,
      },
      ...savedPresets,
    ].slice(0, 6);

    setSavedPresets(nextPresets);
    setPresetName("");
    writeStoredPresets(nextPresets);
  };

  const handleLoadPreset = async (preset) => {
    setProfile(preset.profile);
    setParams(preset.params);
    setError("");

    if (isPlaying) {
      await engineRef.current.start(preset.params, preset.profile.speechPreference);
    }
  };

  const handleDeletePreset = (presetId) => {
    const nextPresets = savedPresets.filter((preset) => preset.id !== presetId);
    setSavedPresets(nextPresets);
    writeStoredPresets(nextPresets);
  };

  const handleClearPresets = () => {
    setSavedPresets([]);
    writeStoredPresets([]);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">SereniTone</p>
        <h1>A soft place to begin when silence feels loud.</h1>
        <p className="hero-copy">
          SereniTone is here to help when hearing feels different, silence feels
          loud, or internal sound is hard to ignore. It helps you make sense of
          ringing, hissing, or sound sensitivity and guides you into a gentle
          sound mix you can fine-tune.
        </p>
        <div className="hero-badges">
          <span>Sound therapy principles</span>
          <span>Non-diagnostic</span>
          <span>Gentle setup first</span>
        </div>
        <HeroGraphic />
      </section>

      <IntroCards
        selectedCharacter={formValues.soundCharacter}
        onSelectCharacter={handleIntroSoundChoice}
        onContinue={handleContinueToSetup}
      />

      <section className="companion-callout">
        <div className="panel companion-callout-panel">
          <p className="eyebrow">Need Help Describing The Sound Itself?</p>
          <h2>TinnitusGuide helps you identify what you hear. SereniTone helps you find what may feel soothing.</h2>
          <p className="muted-text">
            The sound you notice and the sound that helps are not always the same.
            TinnitusGuide can help you put words to ringing, hiss, buzz, hum, or pulse,
            especially if you want to explain it clearly to an ENT or audiologist.
          </p>
          <a
            className="companion-link"
            href={TINNITUS_GUIDE_URL}
            rel="noreferrer"
            target="_blank"
          >
            Explore TinnitusGuide
          </a>
        </div>
      </section>

      {showSetup || profile ? (
        <>
          <section className="setup-bridge" ref={setupRef}>
            <div className="panel setup-bridge-panel">
              <p className="eyebrow">Gentle Setup</p>
              <h2>Now let&apos;s tailor a starting sound for you.</h2>
              <p className="muted-text">
                We&apos;ll use a few simple questions to choose a calmer starting point,
                then you can listen and adjust in real time.
              </p>
              <WelcomeGraphic />
            </div>
          </section>

          <section className="workspace">
            <div className="stack">
              <div className="panel companion-inline-card">
                <p className="eyebrow">Helpful To Know</p>
                <p>
                  You do not need to recreate your tinnitus exactly in SereniTone.
                  The goal here is to create a gentle background sound that may help
                  the brain focus on what is important and let tinnitus fade into the background.
                </p>
                <p className="muted-text">
                  If you want help identifying the sound itself before continuing,
                  TinnitusGuide can help you compare ring, hiss, buzz, hum, and pulse.
                </p>
                <a
                  className="companion-link"
                  href={TINNITUS_GUIDE_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  Use TinnitusGuide to describe what you hear
                </a>
              </div>

              <IntakeForm values={formValues} onChange={handleFormChange} onSubmit={handleGenerate} />
            </div>

            <div className="stack">
              {profile ? (
                <>
                  <Player
                    profile={profile}
                    params={params}
                    isPlaying={isPlaying}
                    onTogglePlayback={handleTogglePlayback}
                    onFeedback={handleFeedback}
                  />
                  <div className="panel companion-inline-card">
                    <p className="eyebrow">Sound Match Vs Relief</p>
                    <p>
                      The best soothing sound is not always a copy of what you hear.
                      SereniTone is meant to give your brain a steadier, supportive sound to follow,
                      so the tinnitus can feel less important over time.
                    </p>
                    <p className="muted-text">
                      If you want a clearer description of the tinnitus itself to share with a professional,
                      TinnitusGuide can help with that.
                    </p>
                    <a
                      className="companion-link"
                      href={TINNITUS_GUIDE_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open TinnitusGuide
                    </a>
                  </div>
                  <Controls params={params} onChange={handleControlChange} />
                </>
              ) : (
                <div className="panel empty-state">
                  <p className="eyebrow">Next step</p>
                  <h2>Your player will appear here</h2>
                  <p>
                    Finish the gentle setup, then click <strong>See my starting soundscape</strong>{" "}
                    to generate your first mix and open the player.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}

      {profile ? (
        <>
          <section className="dashboard-grid">
            <div className="panel dashboard-hero">
              <div className="dashboard-hero-copy">
                <p className="eyebrow">Dashboard</p>
                <h2>Current SereniTone</h2>
                <p>
                  <strong>{profile.triage?.recommendedModelName}</strong>
                  {profile.triage?.recommendedModelReason
                    ? ` was chosen because ${profile.triage.recommendedModelReason}.`
                    : null}
                </p>
                <div className="hero-badges">
                  <span>Goal: {profile.goal}</span>
                  <span>Pattern: {profile.triage?.headline}</span>
                  {savedPresets.length > 0 ? (
                    <span>Presets: {savedPresets.length}</span>
                  ) : (
                    <span>No presets saved</span>
                  )}
                </div>
              </div>
              <div className="dashboard-hero-actions">
                <DashboardGraphic isPlaying={isPlaying} />
                <button className="primary-button" onClick={handleTogglePlayback} type="button">
                  {isPlaying ? "Pause soundscape" : "Start soundscape"}
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <p className="eyebrow">Starting Point</p>
                <h3>What we set up for you</h3>
              </div>
              <div className="tag-list">
                {profileSummary.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </div>

            <div className="panel">
              <div className="panel-heading">
                <p className="eyebrow">How This Helps</p>
                <h3>Why we suggested this</h3>
              </div>
              <SupportGraphic />
              <p>{profile.triage?.soundStrategy}</p>
              {profile.triage?.explanation?.map((item) => (
                <p className="muted-text" key={item}>
                  {item}
                </p>
              ))}
              {profile.triage?.careNotes?.map((item) => (
                <p className="disclaimer" key={item}>
                  {item}
                </p>
              ))}
              <a
                className="companion-link"
                href={TINNITUS_GUIDE_URL}
                rel="noreferrer"
                target="_blank"
              >
                Want a clearer way to describe the sound itself? Visit TinnitusGuide.
              </a>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel">
              <div className="panel-heading">
                <p className="eyebrow">Live Mix</p>
                <h3>Current settings snapshot</h3>
              </div>
              <div className="steps-list">
                <div className="step-card">
                  <strong>Masking</strong>
                  <span>{params.noiseLevel.toFixed(2)}</span>
                </div>
                <div className="step-card">
                  <strong>Brightness</strong>
                  <span>{params.brightness.toFixed(2)}</span>
                </div>
                <div className="step-card">
                  <strong>Spatial</strong>
                  <span>{params.stereoWidth.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <p className="eyebrow">Next Actions</p>
                <h3>Where to go from here</h3>
              </div>
              <div className="steps-list">
                <div className="step-card">
                  <strong>Listen now</strong>
                  <span>Start playback and test the mix before changing anything.</span>
                </div>
                <div className="step-card">
                  <strong>Refine gently</strong>
                  <span>Use the studio controls to soften, widen, or simplify the sound.</span>
                </div>
                <div className="step-card">
                  <strong>Save what works</strong>
                  <span>Keep supportive variations as reusable presets.</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <p className="eyebrow">Presets</p>
                <h3>Save what works</h3>
              </div>
              <div className="preset-save">
                <input
                  type="text"
                  placeholder="Morning focus"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                />
                <button className="secondary-button" onClick={handleSavePreset} type="button">
                  Save
                </button>
              </div>
              <div className="preset-list">
                {savedPresets.length === 0 ? (
                  <p className="muted-text">No saved presets yet.</p>
                ) : (
                  savedPresets.map((preset) => (
                    <div className="preset-card" key={preset.id}>
                      <div className="preset-card-copy">
                        <strong>{preset.name}</strong>
                        <span>{preset.profile.goal}</span>
                      </div>
                      <div className="preset-card-actions">
                        <button
                          className="secondary-button"
                          onClick={() => handleLoadPreset(preset)}
                          type="button"
                        >
                          Load
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => handleDeletePreset(preset.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {savedPresets.length > 0 ? (
                <div className="preset-footer">
                  <button className="text-button" onClick={handleClearPresets} type="button">
                    Clear all presets
                  </button>
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
