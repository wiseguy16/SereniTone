import React from "react";
import { buildTriage } from "../logic/profile";

const OPTIONS = {
  tinnitusType: [
    { value: "constant", label: "Constant" },
    { value: "intermittent", label: "Intermittent" },
    { value: "pulsatile", label: "Pulsatile-like" },
  ],
  environment: [
    { value: "work", label: "Work" },
    { value: "relax", label: "Relax" },
    { value: "sleep", label: "Sleep" },
  ],
  audioType: [
    { value: "auto", label: "Choose for me" },
    { value: "cabin", label: "Steady cabin-like hush" },
    { value: "ocean", label: "Soft ocean wash" },
    { value: "neutral", label: "Soft neutral masking" },
  ],
  soundCharacter: [
    { value: "ring", label: "Ring / high tone" },
    { value: "hiss", label: "Hiss / airy noise" },
    { value: "hum", label: "Hum / low drone" },
    { value: "buzz", label: "Buzz / electric" },
    { value: "whoosh", label: "Whoosh / pulse" },
  ],
  noticeTiming: [
    { value: "quiet", label: "Mostly in quiet" },
    { value: "focus", label: "When trying to focus" },
    { value: "sleep", label: "When falling asleep" },
    { value: "afterNoise", label: "More after noise exposure" },
    { value: "stress", label: "More during stress or fatigue" },
  ],
  mainChallenge: [
    { value: "concentrate", label: "Concentrating" },
    { value: "relax", label: "Relaxing" },
    { value: "sleep", label: "Sleeping" },
    { value: "lessAware", label: "Being less aware of it" },
    { value: "lessOnEdge", label: "Feeling less on edge" },
  ],
};

function Field({ label, children, help }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function sensitivityLabel(value) {
  if (value <= 20) return "Not much";
  if (value <= 40) return "A little";
  if (value <= 60) return "Moderately";
  if (value <= 80) return "Quite a bit";
  return "Very easily";
}

function IntakeGraphic() {
  return (
    <svg viewBox="0 0 260 110" className="section-graphic intake" aria-hidden="true">
      <path d="M16 70 C38 46, 58 46, 80 70 S124 94, 146 70 190 46, 214 70 238 90, 244 82" className="graphic-line strong" />
      <path d="M16 84 C38 66, 58 66, 80 84 S124 100, 146 84 190 66, 214 84 238 96, 244 92" className="graphic-line" />
      <rect x="18" y="18" width="58" height="18" rx="9" className="graphic-chip" />
      <rect x="90" y="18" width="72" height="18" rx="9" className="graphic-chip soft" />
      <rect x="176" y="18" width="48" height="18" rx="9" className="graphic-chip" />
    </svg>
  );
}

export default function IntakeForm({ values, onChange, onSubmit }) {
  const triage = buildTriage(values);

  return (
    <form className="panel intake-panel" onSubmit={onSubmit}>
      <div className="panel-heading">
        <p className="eyebrow">Gentle Setup</p>
        <h2>Tell us a little more about what you&apos;re noticing</h2>
        <p className="muted-text">
          This takes about a minute. We use it to choose a calmer starting sound
          and explain why it may help.
        </p>
        <IntakeGraphic />
      </div>

      <div className="intake-section">
        <p className="eyebrow">About The Sound</p>
        <h3>What are you noticing?</h3>
      </div>
      <div className="grid two-col">
        <Field label="Do you notice ringing or internal sound?">
          <div className="toggle-row">
            <button
              className={values.hasTinnitus ? "toggle active" : "toggle"}
              onClick={() => onChange("hasTinnitus", true)}
              type="button"
            >
              Yes
            </button>
            <button
              className={!values.hasTinnitus ? "toggle active" : "toggle"}
              onClick={() => onChange("hasTinnitus", false)}
              type="button"
            >
              No
            </button>
          </div>
        </Field>

        <Field label="Does it feel steady, on-and-off, or rhythmic?">
          <select
            value={values.tinnitusType}
            onChange={(event) => onChange("tinnitusType", event.target.value)}
          >
            {OPTIONS.tinnitusType.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="How easily do everyday sounds start to feel like too much?"
          help="This helps us decide whether to start with a softer, gentler soundscape."
        >
          <input
            type="range"
            min="0"
            max="100"
            value={values.sensitivity}
            onChange={(event) => onChange("sensitivity", Number(event.target.value))}
          />
          <strong>{sensitivityLabel(values.sensitivity)}</strong>
        </Field>

        <Field label="Which of these sounds closest to what you hear?">
          <select
            value={values.soundCharacter}
            onChange={(event) => onChange("soundCharacter", event.target.value)}
          >
            {OPTIONS.soundCharacter.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="intake-section">
        <p className="eyebrow">When It Shows Up</p>
        <h3>When does it bother you most?</h3>
      </div>
      <div className="grid two-col">
        <Field label="When do you notice it most?">
          <select
            value={values.noticeTiming}
            onChange={(event) => onChange("noticeTiming", event.target.value)}
          >
            {OPTIONS.noticeTiming.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="What feels hardest right now?">
          <select
            value={values.mainChallenge}
            onChange={(event) => onChange("mainChallenge", event.target.value)}
          >
            {OPTIONS.mainChallenge.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="intake-section">
        <p className="eyebrow">Starting Atmosphere</p>
        <h3>Pick a place to begin</h3>
      </div>
      <div className="grid two-col">
        <Field label="Which type of background sound would you like to start with?">
          <select
            value={values.audioType}
            onChange={(event) => onChange("audioType", event.target.value)}
          >
            {OPTIONS.audioType.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="triage-card">
        <p className="eyebrow">What We Hear</p>
        <h3>{triage.headline}</h3>
        {triage.explanation.map((item) => (
          <p key={item} className="muted-text">
            {item}
          </p>
        ))}
        <p className="triage-strategy">{triage.soundStrategy}</p>
        <p className="disclaimer">{triage.careNotes[1]}</p>
      </div>

      <button className="primary-button" type="submit">
        See my starting soundscape
      </button>
    </form>
  );
}
