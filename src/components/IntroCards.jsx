import React, { useMemo, useState } from "react";

const INTRO_STEPS = [
  {
    eyebrow: "Understanding",
    title: "What you are hearing",
    body:
      "Tinnitus is usually created by the brain, not the ear. When hearing changes, the brain can turn up its own sensitivity like a volume knob searching for missing sound.",
    note:
      "SereniTone provides gentle sound to help the brain relax that response instead of staying locked onto the internal signal.",
  },
  {
    eyebrow: "Why Sound Helps",
    title: "Why listening can feel easier",
    body:
      "Sound therapy gives your brain real sound to notice, reduces the contrast between silence and tinnitus, and helps the auditory system stop treating the sound as important.",
    note:
      "This is why soft background sound often feels more helpful than complete silence.",
  },
  {
    eyebrow: "What To Expect",
    title: "What improvement usually feels like",
    body:
      "Most people notice change gradually: first moments of relief, then less emotional reaction, then easier focus or background awareness.",
    note: "The goal is comfort and control, not forced silence.",
  },
  {
    eyebrow: "How To Start",
    title: "The golden rule",
    body:
      "Set the sound slightly below your tinnitus, not louder. If you can still notice the internal sound a little, you are usually doing it correctly.",
    note: "We will start you with a gentle profile and you can fine-tune it anytime.",
  },
];

const SOUND_CHOICES = [
  { value: "ring", label: "High-pitched ringing" },
  { value: "hiss", label: "Hissing / static" },
  { value: "hum", label: "Low hum" },
  { value: "whoosh", label: "Pulsing" },
  { value: "buzz", label: "Not sure" },
];

function IntroGraphic() {
  return (
    <svg viewBox="0 0 320 180" className="section-graphic intro-graphic" aria-hidden="true">
      <circle cx="82" cy="92" r="52" className="graphic-ring soft-ring" />
      <circle cx="82" cy="92" r="28" className="graphic-ring" />
      <path d="M124 106 C156 76, 188 74, 220 104 S274 138, 302 114" className="graphic-line strong" />
      <path d="M124 124 C156 102, 188 100, 220 124 S274 148, 302 134" className="graphic-line" />
      <rect x="164" y="36" width="82" height="18" rx="9" className="graphic-chip" />
      <rect x="254" y="36" width="36" height="18" rx="9" className="graphic-chip soft" />
    </svg>
  );
}

export default function IntroCards({ selectedCharacter, onSelectCharacter, onContinue }) {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = INTRO_STEPS[activeStep];
  const selectedLabel = useMemo(
    () => SOUND_CHOICES.find((choice) => choice.value === selectedCharacter)?.label,
    [selectedCharacter],
  );

  return (
    <section className="intro-flow">
      <div className="panel intro-lead">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2>Start with understanding, not guesswork.</h2>
          <p>
            Not everybody hears the exact same way. Some people notice an extra
            layer of sound that can make quiet feel uncomfortable or make it
            harder to focus. The scientific word for that extra sound is
            tinnitus. It can show up as ringing, hissing, buzzing, or humming.
          </p>
          <p>
            SereniTone helps you understand that experience and use gentle
            background sound to make it feel less intense and less central.
          </p>
          <p className="muted-text">
            You are not trying to fight the sound. You are creating a softer,
            safer listening environment so the brain can stop monitoring it so
            aggressively.
          </p>
        </div>
        <IntroGraphic />
      </div>

      <div className="panel intro-card-panel">
        <div className="intro-step-dots" role="tablist" aria-label="SereniTone introduction">
          {INTRO_STEPS.map((step, index) => (
            <button
              key={step.title}
              className={index === activeStep ? "intro-step-dot active" : "intro-step-dot"}
              onClick={() => setActiveStep(index)}
              title={step.eyebrow}
              type="button"
            >
              <span className="intro-step-number">{index + 1}</span>
              <span className="intro-step-label">{step.eyebrow}</span>
            </button>
          ))}
        </div>

        <div className="intro-card">
          <p className="eyebrow">{currentStep.eyebrow}</p>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.body}</p>
          <p className="muted-text">{currentStep.note}</p>
        </div>

        <div className="intro-nav">
          <button
            className="ghost-button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
            type="button"
          >
            Back
          </button>
          <button
            className="secondary-button"
            onClick={() =>
              setActiveStep((current) => Math.min(INTRO_STEPS.length - 1, current + 1))
            }
            type="button"
          >
            {activeStep === INTRO_STEPS.length - 1 ? "Review again" : "Next"}
          </button>
        </div>
      </div>

      <div className="panel intro-question-panel">
        <div className="panel-heading">
          <p className="eyebrow">Your Sound Today</p>
          <h3>What best describes the sound you are noticing today?</h3>
          <p className="muted-text">
            People often call this tinnitus. This helps us start from a sound
            profile that feels closer to what you are already noticing.
          </p>
        </div>

        <div className="choice-grid">
          {SOUND_CHOICES.map((choice) => (
            <button
              key={choice.value}
              className={
                selectedCharacter === choice.value ? "choice-card active" : "choice-card"
              }
              onClick={() => onSelectCharacter(choice.value)}
              type="button"
            >
              {choice.label}
            </button>
          ))}
        </div>

        <div className="intro-transition">
          <div>
            <strong>{selectedLabel ? `Starting from: ${selectedLabel}` : "Choose a starting description"}</strong>
            <p className="muted-text">
              Based on your selection, we will start with a gentle sound profile
              and then help you tailor it.
            </p>
          </div>
          <button className="primary-button" onClick={onContinue} type="button">
            Continue to gentle setup
          </button>
        </div>
      </div>
    </section>
  );
}
