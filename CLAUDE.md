# AEA Member Shop Tycoon

A mobile-first, single-file pixel game where the player runs a Business and General Aviation avionics shop. This folder is a build handoff for Claude Code.

## Start here (read in this order)

1. This file.
2. `spec/Build Spec and Storyboard.md`. The source of truth. Build from this.
3. `prototype/AEA Member Shop Tycoon.html`. A working prototype, reference only. It has the mechanics but the wrong packaging, and it still contains the patterns under "Do not build" below. Mine it for the quote math, the dealer kickback, the 91.411 and 91.413 inspection definitions, the customer personalities, the credential and dealer ladders, and the pixel art. Do not copy its structure.
4. `reference/`. Earlier design docs for background and canon (cast, OEM names, numbers). Subordinate to the spec. Where any of it conflicts with this file or the spec, the spec wins.

## Precedence

The spec is the single source of truth. This file's "Do not build" list overrides everything, including the prototype and the reference docs.

## Do not build (explicitly rejected)

1. No periodic or quarterly financial statements. None. Money settles once per job at Collect Payment as a single invoice. That invoice is the only finance moment in the loop.
2. No random human-factors popups. Safety and quality are consequences of player choices (rushing, overtime, cutting corners) with real rewards and punishments. Cut any safety beat that cannot carry stakes.
3. The AEA Show is never a passive screen. It is an interactive popup the player clicks through each spring, one product reveal per tap with pixel art.

Also avoid: wordy copy, tiny or cramped controls, and screens that feel like a different app.

## What to build

The player runs the day in the life of an avionics shop owner. Go find the work (an inbound board of prospects and an outbound hustle), win the customer with a charisma pitch, price the job with a simple line-item quote (labor, consumables, dealer fee, and a Budget, Standard, or Premium avionics tier where premium pays a dealer kickback), schedule crew, run shifts, then collect payment on one invoice. Grow from one bay to AEA Shop of the Year. Sega-Genesis pixel look, bright arcade-pop palette, plays on a phone.

The full build brief and a paste-ready kickoff are in the spec under "Handoff to Claude Code."

## First action

Read the spec end to end. Then propose the file structure and the core-loop screen list before writing code. Build the loop spine first (Floor, Get Work, Meet, Quote, Schedule, Run Shift, Collect Payment) and confirm it feels like one game on a phone. Then layer the rest.

## Build order

1. The frame: one consistent shell, HUD, button and card kit, palette, two fonts. Cohesion before content.
2. The loop spine (above).
3. Work systems: inspections, fit, quality bars, on-the-job training.
4. Business systems: dealers and kickback, labor rate, Drum Up Business, formal training and credentials.
5. Beats: the AEA Show popup, mid-job customer calls, safety-as-consequence choices, New Era and Shop of the Year milestones.
6. Polish: copy for brevity, touch for comfort, motion for smoothness on a phone.

## Tech constraints

- One self-contained HTML file. Vanilla HTML, CSS, JS. No build step.
- Mobile-first. Must play well on an iPhone in portrait.
- No localStorage or sessionStorage. Session memory only.
- Flexbox with min-height. Never cap content with a fixed viewport height. The page must scroll.
- Touch targets at least 44 pixels. No hover-only controls.
- Test at 1366x768 and at a narrow phone width.
- No em-dashes anywhere in copy. No version numbers in file names or content.

## Folder map

- `spec/Build Spec and Storyboard.md`. Source of truth.
- `prototype/AEA Member Shop Tycoon.html`. Working reference.
- `reference/`. Legacy design docs, background only, subordinate to the spec.
