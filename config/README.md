# Game Config

`game.yaml` defines the board that the app loads at runtime. The file lives at
`config/game.yaml` in the project root and is read by the server on each
request — edit it and reload the browser to see changes (no rebuild needed).

## Schema

```yaml
title: "My Game Title"          # shown on setup + winner screens
teams:                          # optional; 2–10 names to pre-fill the setup screen
  - "Red"
  - "Blue"
  - "Green"
categories:                     # list of categories (columns on the board)
  - name: "HISTORY"             # UPPERCASE display name
    clues:                      # list of clues (rows within the column)
      - value: 100              # point value (strictly ascending in the column)
        clue: "The question shown to players"
        answer: "The expected answer"
      - value: 200
        clue: "..."
        answer: "..."
```

## Rules

- **Teams:** 2–10 teams. Optional `teams` list pre-fills the setup screen; if
  omitted, the host enters names manually. Either way the host can edit
  names and change the count before starting.
- **One round only.** No Double Jeopardy, Final Jeopardy, or Daily Doubles.
- **All categories must have the same number of clues.** (Typical: 5.)
- **Values within a category must be strictly ascending** (e.g., 100, 200, 300,
  400, 500). The numbers themselves are not fixed — any ascending sequence is
  valid.
- Strings that contain a colon (`:`) must be quoted.

If parsing or validation fails, the app renders an error screen with the
failure message and the expected file path; no game can start until the file
is valid.
