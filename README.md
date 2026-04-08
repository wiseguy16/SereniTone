# SereniTone

SereniTone is a browser-based sound support prototype for people who notice tinnitus-like ringing, hissing, humming, sound sensitivity, or focus disruption when quiet makes internal sound feel more obvious.

It is not a diagnosis tool. It is a guided soundscape tool designed to help users move from anxiety and guesswork toward a gentler, more supportive listening environment.

## Who It's For

SereniTone is for people who:

- notice tinnitus-like internal sound in quiet settings
- feel more distracted, tense, or overstimulated because of that sound
- want a controllable background sound instead of static playlists or random ambient videos
- want something supportive and practical without having to enter a full medical workflow first

The current product is especially oriented toward desk-based users, students, and knowledge workers, but the interaction model also fits people looking for relief during relaxation or bedtime.

## Problem

Many people do not need a complex clinical product as their first step. They need a way to:

- understand that sound support can be helpful
- get to a usable starting mix quickly
- reduce the contrast between silence and the sound they notice
- adjust the environment in real time based on what feels better or worse

Existing alternatives often fall into one of three categories:

- too medical and intimidating
- too generic and static
- too entertainment-oriented to be useful as a relief tool

There is an opportunity to build something more focused: a calm, browser-based sound environment that explains itself, adapts live, and stays simple.

## Solution

SereniTone uses a guided onboarding flow, a short intake, and a procedural browser audio engine to create a gentle starting soundscape that the user can refine.

Current prototype behavior:

- explains tinnitus and sound therapy in plain language before showing controls
- asks a short intake about sound character, timing, sensitivity, environment, and goals
- generates a non-diagnostic triage summary and a starter recommendation
- maps the user into one of two current starter models:
  - `Airplane`
  - `Ocean`
- creates a live soundscape with controllable masking, brightness, motion, spatial width, and volume
- supports optional layers like tone, insects, and chirp-like accents
- lets the user give quick feedback such as `Too sharp` or `Not masking enough`
- saves presets locally in the browser
- links to `TinnitusGuide` when the user needs help describing the sound they hear, rather than shaping the relief sound itself

Why this solution:

- it addresses the actual user need better than “AI-generated music”
- it keeps the product fully client-side and low-cost
- it allows real-time control without backend complexity
- it reinforces an important mental model: the sound that helps is not always the same as the sound the user hears internally

## Key Decisions & Tradeoffs

### 1. Procedural audio instead of AI music generation

Decision:

- build with Tone.js and the Web Audio API instead of backend generation or music APIs

Why:

- no server required
- no licensing issues
- low deployment cost
- immediate live control

Tradeoff:

- the output is synthetic rather than photorealistic audio
- some optional nature-like layers are stylized approximations

### 2. Guided wellness framing instead of clinical framing

Decision:

- make SereniTone a non-diagnostic support tool, not a medical assessment

Why:

- better aligned with the current scope
- less intimidating for first-time users
- safer and more feasible for a browser-only prototype

Tradeoff:

- the product can orient and support, but not diagnose

### 3. Named starter models instead of fully open-ended generation

Decision:

- use understandable starter models like `Airplane` and `Ocean`

Why:

- easier for users to interpret
- better starting point than raw parameter math
- creates a stronger sense of intentionality

Tradeoff:

- the recommendation logic is heuristic
- the preset family is still small

### 4. Companion-site split between understanding and relief

Decision:

- separate `TinnitusGuide` from `SereniTone`

Why:

- SereniTone works better when it focuses on soothing sound support
- users often need help describing tinnitus, but that is a different problem

Tradeoff:

- there are now two related products to maintain
- some users will move between sites instead of staying in one flow

## Scope Decisions

### Built in this version

- onboarding with educational context
- intake and non-diagnostic triage
- starter model selection
- live procedural audio playback
- quick feedback loop
- local preset saving
- mobile-improved sliders
- companion links to `TinnitusGuide`
- GitHub Pages deployment

### Chose not to build

- medical diagnosis
- clinical hearing testing
- user accounts
- backend persistence
- clinician dashboard
- realistic sample libraries
- machine learning inference
- streaming catalog features

These choices kept the project focused on one clear job: help the user reach a gentler sound environment quickly.

## What I Would Do Next With More Time

- add a stronger `Understand Your Sound` bridge between onboarding and setup
- improve the difference between `Masking` and `Volume` so the controls feel more semantically distinct
- add more nuanced starter models beyond `Airplane` and `Ocean`
- improve the realism of optional layers or replace them with licensed/sample-based audio
- track listening history and adjustment patterns over time
- test the onboarding and sound tuning flow with more real users on mobile and desktop

## Current Progress

The current prototype is live and working. It includes:

- a context-first onboarding flow
- intake language designed for non-experts
- educational visuals that explain the relief model
- a functioning browser sound engine
- stable live controls and feedback buttons
- preset save/load/delete behavior using local storage
- iPhone-friendly slider improvements
- cross-linking with `TinnitusGuide`

## Running Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL, usually `http://127.0.0.1:5173/`.

## Deploying To GitHub Pages

This repo is set up to deploy to GitHub Pages through GitHub Actions.

### One-time GitHub setup

1. Push the project to a GitHub repository.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Make sure the default branch is `main`.

### Deploy flow

Every push to `main` triggers the workflow in [`.github/workflows/deploy.yml`](/Users/gwe48a/Documents/CodexCode/SereniTone/.github/workflows/deploy.yml) and publishes the contents of `dist/` to GitHub Pages.

The Vite base path is configured in [`vite.config.js`](/Users/gwe48a/Documents/CodexCode/SereniTone/vite.config.js).

## Tech Stack

- React
- Vite
- Tone.js
- Web Audio API
