const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const FEEDBACK_OPTIONS = [
  { key: "tooSharp", label: "Too sharp" },
  { key: "tooDull", label: "Too dull" },
  { key: "tooBusy", label: "Too busy" },
  { key: "tooEmpty", label: "Too empty" },
  { key: "notMasking", label: "Not masking enough" },
  { key: "distracting", label: "Distracting" },
];

export function applyFeedback(feedbackKey, params) {
  const next = { ...params };

  if (feedbackKey === "tooSharp") {
    next.brightness = clamp(next.brightness - 0.08);
    next.toneFrequency = Math.max(120, next.toneFrequency - 18);
  }

  if (feedbackKey === "tooDull") {
    next.brightness = clamp(next.brightness + 0.08);
    next.toneFrequency = Math.min(540, next.toneFrequency + 16);
  }

  if (feedbackKey === "tooBusy") {
    next.motionSpeed = clamp(next.motionSpeed - 0.08, 0.03, 0.8);
    next.stereoWidth = clamp(next.stereoWidth - 0.04);
  }

  if (feedbackKey === "tooEmpty") {
    next.motionSpeed = clamp(next.motionSpeed + 0.08, 0.03, 0.8);
    next.stereoWidth = clamp(next.stereoWidth + 0.05);
  }

  if (feedbackKey === "notMasking") {
    next.noiseLevel = clamp(next.noiseLevel + 0.09);
    next.volume = clamp(next.volume + 0.04, 0.1, 1);
  }

  if (feedbackKey === "distracting") {
    next.motionSpeed = clamp(next.motionSpeed - 0.06, 0.03, 0.8);
    next.brightness = clamp(next.brightness - 0.05);
    next.volume = clamp(next.volume - 0.03, 0.1, 1);
  }

  return next;
}
