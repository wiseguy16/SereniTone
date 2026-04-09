import React from "react";

import { FEEDBACK_OPTIONS } from "../logic/feedback";

function PlayerGraphic({ isPlaying }) {
  return (
    <svg viewBox="0 0 320 120" className="section-graphic player-graphic" aria-hidden="true">
      <rect x="14" y="20" width="292" height="80" rx="22" className="graphic-chip soft" />
      <path d="M28 70 C54 46, 76 46, 102 70 S154 94, 180 70 232 44, 258 68 292 94, 306 76" className={isPlaying ? "graphic-line strong" : "graphic-line"} />
      <path d="M28 82 C54 66, 76 66, 102 82 S154 98, 180 82 232 62, 258 80 292 96, 306 88" className="graphic-line" />
      <circle cx="84" cy="58" r={isPlaying ? 9 : 6} className="graphic-dot" />
      <circle cx="214" cy="78" r="6" className="graphic-dot soft" />
    </svg>
  );
}

function PlaybackIcon({ isPlaying }) {
  if (isPlaying) {
    return (
      <svg aria-hidden="true" className="playback-icon" viewBox="0 0 24 24">
        <rect x="6" y="5" width="4" height="14" rx="1.2" />
        <rect x="14" y="5" width="4" height="14" rx="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="playback-icon" viewBox="0 0 24 24">
      <path d="M8 5.5 L19 12 L8 18.5 Z" />
    </svg>
  );
}

export default function Player({
  profile,
  params,
  isPlaying,
  onTogglePlayback,
  onFeedback,
}) {
  const motionRatio = Math.min(1, Math.max(0, (params.motionSpeed - 0.03) / (0.8 - 0.03)));
  const pulseDuration = `${(3.2 - motionRatio * 1.25).toFixed(2)}s`;

  return (
    <div className="panel player-panel">
      <div className="panel-heading">
        <p className="eyebrow">Player</p>
        <h2>{profile.goal === "focus" ? "Focus" : profile.goal} soundscape</h2>
      </div>

      <PlayerGraphic isPlaying={isPlaying} />

      <div className="player-summary" aria-label="Current soundscape summary">
        <div>
          <span>Masking level</span>
          <strong>{Math.round(profile.maskingLevel * 100)}%</strong>
        </div>
        <div>
          <span>Brightness</span>
          <strong>{Math.round(params.brightness * 100)}%</strong>
        </div>
        <div>
          <span>Motion</span>
          <strong>{Math.round(params.motionSpeed * 100)}%</strong>
        </div>
      </div>

      <button
        className={isPlaying ? "primary-button soundscape-button is-playing" : "primary-button soundscape-button"}
        onClick={onTogglePlayback}
        style={{
          "--soundscape-pulse-duration": pulseDuration,
        }}
        type="button"
      >
        <PlaybackIcon isPlaying={isPlaying} />
        {isPlaying ? "Pause soundscape" : "Start soundscape"}
      </button>

      <div className="player-tip-card">
        <strong>Listening tip</strong>
        <p>
          Start low and keep the mix gentle. You do not need to cover the sound
          completely for this to feel supportive.
        </p>
      </div>

      <div className="feedback-grid" aria-label="Quick feedback controls">
        {FEEDBACK_OPTIONS.map((option) => (
          <button
            className="feedback-button"
            key={option.key}
            onClick={() => onFeedback(option.key)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="disclaimer">
        SereniTone is a wellness prototype. It does not diagnose hearing loss or
        provide medical treatment.
      </p>
    </div>
  );
}
