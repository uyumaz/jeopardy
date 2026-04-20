# Jeopardy

A projected, host-driven Jeopardy-style trivia game for team events. One round,
2–10 teams, categories and clues loaded from a YAML config at runtime.

## Quickstart

```bash
npm install
cp config/game.yaml.example config/game.yaml   # first time only
# edit config/game.yaml to customize categories, clues, and answers
npm run dev
```

Your local `config/game.yaml` is gitignored so each machine can hold its own
questions without conflicts.

Then open <http://localhost:3000> and press **F11** to go fullscreen for
projection.

## How it runs

One person (the host) drives everything from the keyboard and mouse. Teams
answer out loud; the host arbitrates who spoke first and judges each response
by clicking **Correct** or **Wrong** buttons for the relevant team. The app
adds or subtracts the clue's value from that team's score accordingly. A clue
can be marked wrong for multiple teams before another gets it right, or closed
with **No one** if no team answers correctly.

State is persisted in `localStorage` so an accidental reload doesn't wipe
scores. The top-right **Reset** button clears the game (takes two clicks to
confirm), and the **Undo** button reverses the last action.

## Customizing the game

See [`config/README.md`](./config/README.md) for the YAML schema. Edit
`config/game.yaml` and reload the page to pick up changes.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm test` — run unit tests
