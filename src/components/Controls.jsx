import React from "react";
import * as Slider from "@radix-ui/react-slider";

const CONTROL_CONFIG = [
  { key: "noiseLevel", label: "Masking", min: 0, max: 1, step: 0.01 },
  { key: "brightness", label: "Brightness", min: 0, max: 1, step: 0.01 },
  { key: "motionSpeed", label: "Motion", min: 0.03, max: 0.8, step: 0.01 },
  { key: "stereoWidth", label: "Spatial", min: 0, max: 1, step: 0.01 },
  { key: "volume", label: "Volume", min: 0.1, max: 1, step: 0.01 },
];

const ADVANCED_CONTROL_CONFIG = [
  {
    key: "toneLevel",
    label: "Tone Layer",
    min: 0,
    max: 0.05,
    step: 0.005,
    help: "Adds back the steady pitched layer. Keep this low unless you want a more tonal soundscape.",
  },
  {
    key: "insectLevel",
    label: "Insects",
    min: 0,
    max: 0.2,
    step: 0.01,
    help: "Adds a light high-frequency summer-night texture.",
  },
  {
    key: "birdLevel",
    label: "Birds",
    min: 0,
    max: 0.2,
    step: 0.01,
    help: "Adds occasional soft chirp-like notes on top of the bed.",
  },
];

function ControlsGraphic() {
  return (
    <svg viewBox="0 0 280 96" className="section-graphic controls-graphic" aria-hidden="true">
      <line x1="18" y1="28" x2="262" y2="28" className="graphic-line" />
      <line x1="18" y1="50" x2="262" y2="50" className="graphic-line" />
      <line x1="18" y1="72" x2="262" y2="72" className="graphic-line" />
      <circle cx="76" cy="28" r="9" className="graphic-dot" />
      <circle cx="190" cy="50" r="9" className="graphic-dot soft" />
      <circle cx="122" cy="72" r="9" className="graphic-dot" />
    </svg>
  );
}

export default function Controls({ params, onChange }) {
  const renderSlider = (control) => (
    <label className="field slider-field" key={control.key}>
      <div className="field-row">
        <span>{control.label}</span>
        <strong>{params[control.key].toFixed(2)}</strong>
      </div>
      <Slider.Root
        aria-label={control.label}
        className="slider-root"
        max={control.max}
        min={control.min}
        onValueChange={([value]) => onChange(control.key, Number(value))}
        step={control.step}
        value={[params[control.key]]}
      >
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" />
      </Slider.Root>
      {control.help ? <small>{control.help}</small> : null}
    </label>
  );

  return (
    <div className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Controls</p>
        <h3>Shape the mix in real time</h3>
      </div>

      <ControlsGraphic />

      <div className="controls-list">
        {CONTROL_CONFIG.map(renderSlider)}
      </div>

      <div className="advanced-controls">
        <div className="panel-heading">
          <p className="eyebrow">Advanced</p>
          <h3>Optional sound layers</h3>
        </div>
        {ADVANCED_CONTROL_CONFIG.map(renderSlider)}
      </div>
    </div>
  );
}
