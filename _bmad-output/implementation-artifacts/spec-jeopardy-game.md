---
title: 'Web Jeopardy Game (Projected, Config-Driven)'
type: 'feature'
created: '2026-04-20'
status: 'done'
context: []
baseline_commit: 'NO_HEAD'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The host wants to run Jeopardy-style trivia with ~10 colleagues on a single projected screen, with custom categories/clues loaded from a config file.

**Approach:** Build a Next.js (App Router, TypeScript) single-page app that loads a YAML config with categories and clues, renders a classic Jeopardy board, and lets the host drive the game: pick tiles, reveal clues, judge teams, and adjust scores. All game state is in-memory on the client. One round only.

## Boundaries & Constraints

**Always:**
- Single shared screen: UI must be readable when projected (large type, high contrast, dark background).
- Host-driven: one user (the host) controls everything via mouse/keyboard. No multi-device sync, no auth.
- Config-driven: categories, clues, answers, board dimensions, and optional team presets come from a YAML file loaded at runtime (no rebuild to change content).
- One round only. No Double Jeopardy, no Final Jeopardy, no Daily Doubles.
- 2–10 teams, team count and names chosen on a setup screen before the game starts.
- Scoring: host clicks "Correct" for a team (adds clue value) or "Wrong" (subtracts clue value). A clue can be marked wrong for multiple teams before another gets it right, or marked "No one" to close with no score change.
- State resets on page reload. No persistence.

**Ask First:**
- Any additional game modes or rule variants beyond what is specified.
- Any backend, database, or multi-device sync.

**Never:**
- No auth, no accounts, no database, no server-side game state.
- No buzzer/hotkey team input — host arbitrates who answered first verbally.
- No animations or sounds beyond minimal tile-reveal transitions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Load valid config | `config/game.yaml` exists, well-formed | Setup screen renders with game title and team count selector | N/A |
| Load malformed config | YAML parse error or schema mismatch | Error screen with parse/validation message and file path | Block game start until fixed |
| Missing config | File not found at expected path | Error screen explaining where to place the config file | Block game start |
| Start game | Host picks team count (2–10) and names, clicks Start | Board renders with all tiles unrevealed | N/A |
| Pick tile | Host clicks unrevealed tile | Clue view opens full-screen with the clue text and value | N/A |
| Judge team (correct) | Host clicks "✓ TeamX" in clue view | TeamX score += value; tile marked used; return to board | N/A |
| Judge team (wrong) | Host clicks "✗ TeamX" in clue view | TeamX score −= value; team marked wrong for this clue (disabled); other teams still eligible | N/A |
| Close clue (no winner) | Host clicks "No one" | Tile marked used with no score change; return to board | N/A |
| Board complete | All tiles used | Winner screen with final scores sorted desc | N/A |
| New game | Host clicks "New game" on winner screen | Returns to setup screen | N/A |

</frozen-after-approval>

## Code Map

- `package.json` -- Next.js 15 + TypeScript + YAML parser (`yaml`) + Tailwind for styling
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts` -- standard Next.js/Tailwind setup
- `config/game.yaml` -- sample game config checked in, loaded at runtime
- `config/README.md` -- config schema documentation with example
- `src/app/layout.tsx` -- root layout, dark theme, fullscreen-friendly
- `src/app/page.tsx` -- main page; orchestrates Setup → Board → Clue → Winner views based on game state
- `src/app/api/config/route.ts` -- GET endpoint that reads `config/game.yaml` from disk, parses, validates, returns JSON (or 4xx with error)
- `src/lib/config-schema.ts` -- TypeScript types + Zod schema for config validation
- `src/lib/game-state.ts` -- pure reducer for game state (teams, scores, tiles, current clue, phase)
- `src/components/Setup.tsx` -- setup screen: team count + names
- `src/components/Board.tsx` -- grid of categories × clue-value tiles
- `src/components/Tile.tsx` -- single tile (shows value or "used")
- `src/components/ClueView.tsx` -- full-screen clue overlay with Correct/Wrong buttons per team and "No one" / "Reveal answer"
- `src/components/Winner.tsx` -- final scores, New Game button
- `src/components/ConfigError.tsx` -- friendly error screen
- `src/lib/__tests__/game-state.test.ts` -- unit tests for reducer edge cases

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx` -- scaffold Next.js 15 App Router + TypeScript + Tailwind; dark theme globals
- [x] `config/game.yaml` -- provide a sample 6×5 board with placeholder clues so the app runs out-of-the-box
- [x] `config/README.md` -- document the YAML schema with a minimal example
- [x] `src/lib/config-schema.ts` -- define `GameConfig`, `Category`, `Clue` types + Zod schema; validate that every category has the same number of clues and values are ascending
- [x] `src/app/api/config/route.ts` -- read `config/game.yaml` with `fs`, parse with `yaml`, validate with Zod; return `{ok:true, config}` or `{ok:false, error}`
- [x] `src/lib/game-state.ts` -- define `GameState` + `Action` types + `reducer`; phases: `setup` | `board` | `clue` | `winner`; actions: start, pickTile, judgeCorrect, judgeWrong, closeClue, newGame
- [x] `src/lib/__tests__/game-state.test.ts` -- cover: start transitions to board; pickTile opens clue; judgeCorrect awards value and closes; judgeWrong deducts and keeps clue open; all-tiles-used triggers winner phase; newGame resets to setup
- [x] `src/components/Setup.tsx` -- team count stepper (2–10), editable team names, Start button disabled until names non-empty
- [x] `src/components/Board.tsx`, `src/components/Tile.tsx` -- CSS grid; category headers row; used tiles visually dimmed and unclickable
- [x] `src/components/ClueView.tsx` -- full-screen overlay; show clue, "Reveal answer" toggles answer text; per-team ✓/✗ buttons; "No one" button; Esc returns to board
- [x] `src/components/Winner.tsx` -- sorted scoreboard, New Game button
- [x] `src/components/ConfigError.tsx` -- show message + expected path
- [x] `src/app/page.tsx` -- `'use client'`; fetch `/api/config` on mount; render phase-appropriate component via reducer dispatch
- [x] `README.md` -- quickstart: `npm install`, edit `config/game.yaml`, `npm run dev`, open `http://localhost:3000`, go fullscreen with `F11`

**Acceptance Criteria:**
- Given a valid `config/game.yaml`, when the host runs `npm run dev` and opens the app, then the setup screen appears within 2s.
- Given the setup screen with 3 team names entered, when the host clicks Start, then the board renders with categories across the top and ascending point values down each column, all tiles unrevealed.
- Given a clue is open, when the host clicks "✓ Team A", then Team A's score increases by the clue's value and the board returns with that tile dimmed.
- Given a clue is open, when the host clicks "✗ Team B", then Team B's score decreases by the clue's value, Team B's ✗/✓ buttons for this clue disable, and the clue stays open for other teams.
- Given all tiles are used, when the last tile is resolved, then the app transitions to the winner screen showing team scores sorted descending.
- Given a malformed YAML file, when the app loads, then a readable error screen shows the parse/validation message and the expected file path, and no game can be started.

## Design Notes

**Config schema (YAML):**

```yaml
title: "Team Offsite Jeopardy"
categories:
  - name: "HISTORY"
    clues:
      - value: 100
        clue: "Year the Berlin Wall fell"
        answer: "1989"
      - value: 200
        clue: "..."
        answer: "..."
      # ...5 total per category
  # ...6 categories total (configurable count)
```

Schema validator enforces: all categories share the same number of clues; values are strictly ascending within a category (usually 100/200/300/400/500 but not hard-coded — any ascending values allowed).

**State shape:**

```ts
type Phase = 'setup' | 'board' | 'clue' | 'winner';
type GameState = {
  phase: Phase;
  teams: { id: string; name: string; score: number }[];
  used: boolean[][];                 // [category][clueIdx]
  current?: { cat: number; clue: number; wrongTeams: string[]; answerRevealed: boolean };
  config: GameConfig;
};
```

**Why a reducer, not hooks scattered across components:** single source of truth, trivially unit-testable without mounting React, and every state change is one named action.

**Projection UX:** base font scale ~1.25rem at viewport width 1920px; clue view uses `vh`-sized text (~8vh) so it fills the room. Tailwind handles the rest.

**Visual theme — classic Jeopardy palette:**

| Token | Hex | Use |
|-------|-----|-----|
| `jeopardy-blue` | `#060CE9` | Board tiles background, main brand color |
| `jeopardy-blue-dark` | `#0B1E7C` | Page background, board gridlines |
| `jeopardy-gold` | `#D69F4C` | Dollar values on tiles, team score highlights |
| `jeopardy-gold-bright` | `#FFCC00` | Active/selected tile, winner accents |
| `white` | `#FFFFFF` | Clue text, category headers |
| `black` | `#000000` | Text shadow on gold, used-tile state |

Typography: use "Swiss 911" / "ITC Korinna" feel — fall back to a bold condensed sans (e.g., Tailwind's `font-sans` with `font-black tracking-wide uppercase`). Category headers and dollar values are always UPPERCASE with strong text-shadow (`0 2px 0 #000`). Used tiles render as solid `jeopardy-blue-dark` with no text. Expose these colors as Tailwind theme tokens in `tailwind.config.ts` so components reference `bg-jeopardy-blue` / `text-jeopardy-gold` rather than raw hex.

## Verification

**Commands:**
- `npm run build` -- expected: type-check and production build succeed with no errors
- `npm run lint` -- expected: no lint errors
- `npm test` -- expected: all `game-state` reducer tests pass
- `npm run dev` then load `http://localhost:3000` -- expected: setup screen renders from sample config

**Manual checks:**
- Projecting to a TV/monitor: board tiles readable from across the room; clue text fills most of the screen.
- Play through a full game with 3 teams: scores update correctly, winner screen shows after last tile.
- Edit `config/game.yaml` to an invalid value (e.g., remove a clue from one category), reload, confirm error screen.

## Suggested Review Order

**Core state machine**

- Pure reducer; every phase transition and scoring rule lives here.
  [`game-state.ts:60`](../../src/lib/game-state.ts#L60)

- `judgeWrong` early-returns if team already wrong — blocks rapid-click double-deduction.
  [`game-state.ts:105`](../../src/lib/game-state.ts#L105)

**Config boundary**

- Runtime GET reads YAML on every request; force-dynamic so edits are picked up without rebuild.
  [`route.ts:10`](../../src/app/api/config/route.ts#L10)

- Zod schema with non-blank refinement, equal-clue-count, and strictly-ascending-values checks.
  [`config-schema.ts:14`](../../src/lib/config-schema.ts#L14)

**UI orchestration**

- Single client page fetches config, branches on phase, renders Setup/Board/Clue/Winner.
  [`page.tsx:20`](../../src/app/page.tsx#L20)

- Keyboard handler ignores Space/Enter when focus is on a button — keeps ✓/✗ activatable.
  [`ClueView.tsx:29`](../../src/components/ClueView.tsx#L29)

- Projection-sized clue text with overflow-auto for long content; ✓/✗ grid shrinks to fit.
  [`ClueView.tsx:62`](../../src/components/ClueView.tsx#L62)

**Supporting UI**

- Team-count stepper (2–10), editable names, Start disabled until filled.
  [`Setup.tsx:10`](../../src/components/Setup.tsx#L10)

- Grid built from category × clue dimensions; scoreboard at bottom, red for negative.
  [`Board.tsx:15`](../../src/components/Board.tsx#L15)

- Winner highlights all top-score teams; no crown unless someone is positive.
  [`Winner.tsx:11`](../../src/components/Winner.tsx#L11)

**Theme & scaffolding**

- Classic Jeopardy palette as Tailwind tokens — components never hardcode hex.
  [`tailwind.config.ts:7`](../../tailwind.config.ts#L7)

- Sample 6×5 board runs the app out-of-the-box.
  [`game.yaml:1`](../../config/game.yaml#L1)

**Tests**

- Reducer covers start/pick/judge/close/newGame plus immutability and duplicate-wrong no-op.
  [`game-state.test.ts:92`](../../src/lib/__tests__/game-state.test.ts#L92)

