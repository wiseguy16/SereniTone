# SereniTone

SereniTone is a browser-based guided sound support tool for people who notice tinnitus-like internal sound, sound sensitivity, or focus disruption when quiet makes that sound feel more obvious.

It is intentionally non-diagnostic. The product is designed to help users understand the role sound can play, start from a calmer baseline, and adjust a supportive soundscape in real time.

## Who It's For

SereniTone is for people who:

- notice ringing, hissing, humming, or other internal sound in quiet settings
- feel more distracted, tense, or overstimulated because of that sound
- want a controllable relief tool instead of generic ambient playlists
- want something supportive and approachable before entering a full clinical workflow

The current prototype is especially well suited to desk-based users, students, and knowledge workers, but the interaction model also supports people looking for relief during rest, reading, or bedtime wind-down.

## Problem

Many people do not need a clinical product as their first step. They need a way to:

- understand why supportive sound may help
- reach a usable starting mix quickly
- reduce the contrast between silence and the sound they notice
- adjust the environment in real time based on what feels better or worse

The gap in the current landscape is that available options are often:

- too medical and intimidating
- too generic and static
- too entertainment-oriented to feel purposeful

That creates an opportunity for a calmer browser-based tool that guides the user into a helpful starting point and then lets them refine it live.

## Solution

SereniTone uses a guided onboarding flow, a short intake, and a procedural browser audio engine to create a gentle starting soundscape that the user can refine.

Current prototype behavior:

- introduces tinnitus and sound therapy in plain language before showing controls
- uses a four-step understanding flow so the experience feels guided rather than abrupt
- asks a short intake about sound character, timing, sensitivity, environment, and goals
- generates a non-diagnostic triage summary and a recommended starting profile
- maps users into current starter models such as `Airplane` and `Ocean`
- creates a live browser soundscape with controls for masking, brightness, motion, spatial width, and volume
- supports optional accent layers such as tone, insects, and chirp-like textures
- includes quick feedback buttons like `Too sharp` and `Not masking enough`
- saves presets locally in the browser
- links to `TinnitusGuide` when the user needs help describing what they hear, not just shaping what feels soothing

Why this solution:

- it addresses the real user need better than a playlist or passive ambient loop
- it stays fully client-side and low-cost to host
- it allows instant adjustment with no backend complexity
- it reinforces an important mental model: the sound that helps is not always the same as the sound the user hears internally

## Key Decisions & Tradeoffs

### 1. Procedural browser audio instead of generated music or sample streaming

Decision:

- build with Tone.js and the Web Audio API rather than backend audio generation or streaming catalogs

Why:

- no server or API dependency
- immediate response to user controls
- low infrastructure cost
- strong fit for a prototype that needs live adjustment

Tradeoff:

- the output is synthetic rather than photorealistic
- some optional layers are intentionally stylized approximations

### 2. Guided wellness framing instead of diagnostic framing

Decision:

- keep SereniTone as a support tool, not a medical assessment

Why:

- more approachable for first-time users
- better aligned with the actual scope of the prototype
- safer for a browser-only product

Tradeoff:

- the product can orient and support, but not diagnose

### 3. Simple starter models instead of unlimited generative complexity

Decision:

- use understandable starting models like `Airplane` and `Ocean`

Why:

- gives the user a more legible starting point
- makes the recommendation feel intentional
- reduces overwhelm

Tradeoff:

- the current recommendation logic is heuristic
- the model library is still small

### 4. Separate understanding from relief

Decision:

- split `TinnitusGuide` and `SereniTone` into two companion products

Why:

- identifying what the user hears is a different problem from building a soothing soundscape
- SereniTone becomes clearer when it focuses on support and adjustment

Tradeoff:

- there are now two related sites to maintain
- some users move between products instead of staying in one flow

### 5. Mobile-first control improvements over default browser inputs

Decision:

- move key sliders to a custom implementation that is more workable on iPhone Safari

Why:

- the original controls were too finicky on touch devices
- the project needed to feel demo-ready across desktop and mobile

Tradeoff:

- more custom interaction tuning was required
- slider behavior now needs more ongoing QA than native defaults

## Scope Decisions

### Built in this version

- onboarding with educational context
- intake and non-diagnostic triage
- starter model selection
- live procedural audio playback
- quick feedback loop
- local preset save/load/delete
- mobile-improved sliders and playback controls
- companion links to `TinnitusGuide`
- GitHub Pages deployment

### Chose not to build

- medical diagnosis
- hearing testing
- user accounts
- backend persistence
- clinician dashboard
- licensed sample libraries
- machine learning inference
- streaming or content-catalog features

These choices kept the project focused on one job: help the user reach a gentler sound environment quickly and understand what to do next.

## What I Would Do Next With More Time

- add a stronger `Understand Your Sound` bridge between onboarding and setup
- make `Masking` and `Volume` feel more semantically distinct
- expand the starter-model system beyond `Airplane` and `Ocean`
- improve realism of optional layers or replace them with licensed/sample-based assets
- track listening history and adjustment patterns over time
- run more real-user testing on mobile and desktop
- continue tuning the hero so it communicates “guided sound tool” even faster

## Current Progress

The current prototype is live and includes:

- a context-first onboarding flow
- intake language designed for non-experts
- educational visuals that explain the relief model
- a functioning browser sound engine
- stable live controls and feedback buttons
- local preset versioning and management
- improved iPhone-friendly slider behavior
- animated playback button treatment tied to motion
- cross-linking with `TinnitusGuide`

## Running Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

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
- Radix Slider

## Copyright & License

Copyright (c) 2026 Greg Weiss. All rights reserved.

This repository is proprietary. No copying, modification, distribution, sublicensing, sale,
or creation of derivative works is permitted without prior written permission from Greg Weiss.

See [LICENSE](/Users/gwe48a/Documents/CodexCode/SereniTone/LICENSE).
