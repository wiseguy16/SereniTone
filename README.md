# SereniTone

SereniTone is a browser-based sound support prototype for people who experience tinnitus-like ringing, sound sensitivity, or focus disruption from quiet or inconsistent background noise. It generates a non-diagnostic personalized soundscape in the browser, lets the user adjust it live, and explains why a certain starting mix was chosen.

## Who It's For

SereniTone is designed for knowledge workers, students, and other desk-based users who:

- notice ringing, hissing, buzzing, humming, or sound sensitivity in quiet environments
- have trouble focusing because silence makes internal sound more obvious
- want a controllable background sound instead of looping playlists or random ambient videos
- want something soothing and practical, but not framed as a medical diagnosis tool

## Problem

Many users with tinnitus-like symptoms or noise sensitivity do not need a full clinical workflow first. They need a way to quickly:

- describe what they are experiencing in plain language
- understand whether the pattern sounds more steady, intermittent, or rhythmic
- reduce the contrast between silence and the sound they notice
- find a background sound that is calming enough to keep using

The problem with existing options is that they are often either:

- too medical and intimidating
- too generic and static
- too entertainment-oriented to be useful for steady relief or focus

## Solution

SereniTone uses a short intake flow to triage the user's experience, choose a starting soothing model, and generate a procedural soundscape entirely in the browser.

Current prototype behavior:

- collects intake information about tinnitus pattern, sound sensitivity, sound character, timing, main challenge, listening environment, and preferred audio type
- generates a non-diagnostic triage summary explaining what the reported pattern may resemble
- recommends one of two soothing starter models:
  - `Airplane`: low-brightness, steady cabin-style masking
  - `Ocean`: brighter, softer surf-like masking
- turns that recommendation into live control values for:
  - masking
  - brightness
  - motion
  - spatial width
  - volume
  - tone layer
- lets the user start playback, adjust the sound live, and apply feedback like `Too sharp`, `Too busy`, or `Not masking enough`
- supports advanced optional layers including:
  - tone layer
  - insects
  - birds/chirp accents
- saves presets locally in the browser

Why this approach:

- it keeps the product interactive and personalized
- it avoids the complexity, cost, and risk of backend AI music generation
- it matches the real user need better: a tunable supportive sound environment, not a streaming catalog

## Key Decisions and Tradeoffs

### 1. Procedural audio instead of AI-generated music

Decision:
- build with Tone.js and Web Audio instead of model-generated audio or music APIs

Why:
- no backend required
- no licensing complexity
- lower technical risk for a prototype
- real-time adjustment is easier

Tradeoff:
- the output is less realistic than true recorded ambience or produced music
- some optional layers, especially bird-like sounds, are necessarily synthetic

### 2. Non-diagnostic triage instead of clinical assessment

Decision:
- the intake explains patterns and flags caution cases, but does not diagnose

Why:
- that keeps the project safe, feasible, and aligned with browser-only scope
- it still gives the user enough context to feel guided

Tradeoff:
- the triage can only support orientation, not medical certainty

### 3. Named soothing models instead of fully freeform generation

Decision:
- use reference models like `Airplane` and `Ocean` to guide starting settings

Why:
- they are easier for users to understand and compare
- they provide a stronger starting point than raw slider math alone

Tradeoff:
- the recommendation logic is heuristic
- it currently uses a small preset family instead of a large taxonomy

### 4. Optional texture layers instead of realistic nature recordings

Decision:
- add optional synthetic layers such as insects and chirp-like bird accents

Why:
- keeps everything client-side and editable
- makes the product more exploratory without requiring samples or licensing

Tradeoff:
- these layers are texture approximations, not field recordings

## Scope Decisions

### Built in this version

- browser-based React app
- Tone.js / Web Audio sound engine
- intake and triage flow
- model-driven starting presets
- live sound controls
- feedback loop
- local preset saving

### Chose not to build

- medical diagnosis or hearing testing
- user accounts
- backend services or APIs
- streaming audio libraries
- realistic sample libraries
- machine learning inference
- clinician dashboard or patient records

These choices kept the project focused on one strong idea: help a user quickly get to a soothing and adjustable background sound environment.

## Current Progress

The current prototype is working and includes:

- intake form with richer triage questions
- explanatory guidance on what the reported pattern may mean
- recommended soothing model selection using `Airplane` and `Ocean`
- live browser audio playback
- stable controls for masking, brightness, motion, spatial width, volume, and tone layer
- advanced optional layers for insects and bird/chirp accents
- feedback buttons that update parameters in session
- local preset saving and reload

Known limitations:

- the generated audio is intentionally synthetic
- optional nature layers are stylized, not realistic recordings
- the triage language is informational and non-diagnostic
- model selection is rule-based, not personalized over long-term usage yet

## Running Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL, usually `http://127.0.0.1:5173/`.

## Deploying to GitHub Pages

This repo is now set up to deploy to GitHub Pages through GitHub Actions.

### One-time GitHub setup

1. Push this project to a GitHub repository.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Make sure your default branch is `main`.

### Deploy flow

After that, every push to `main` will trigger the workflow in [`.github/workflows/deploy.yml`](/Users/gwe48a/Documents/CodexCode/SereniTone/.github/workflows/deploy.yml) and publish the contents of `dist/` to GitHub Pages.

The Vite config in [`vite.config.js`](/Users/gwe48a/Documents/CodexCode/SereniTone/vite.config.js) automatically sets the correct base path for:

- a project site such as `https://username.github.io/serenitone/`
- or a user/org root site such as `https://username.github.io/`

### Notes

- Audio still requires a user gesture after the page loads, which is expected for Web Audio in browsers.
- Presets are stored in each browser's local storage, so they do not sync across devices.
- If you rename the GitHub repository later, the published base path will also change.

## Tech Stack

- React
- Vite
- Tone.js
- Web Audio API
