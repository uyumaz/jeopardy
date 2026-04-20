# Deferred Work

Findings surfaced during review that are real but out of scope for the current spec. Revisit if they become painful.

## From spec-jeopardy-game.md review (2026-04-20)

- **Duplicate YAML keys silently accepted** — `YAML.parse` defaults allow duplicate mapping keys; the later wins and earlier data is lost with no warning. A config author duplicating a category name loses content silently. Fix: enable `yaml`'s `uniqueKeys: true` parse option or run a pre-validation pass.
- **No persistence / no `beforeunload` warning mid-game** — state lives only in `useReducer`; an accidental reload discards scores with no prompt. Product decision: acceptable for a one-shot projected game; revisit if users lose games to accidental refreshes.
