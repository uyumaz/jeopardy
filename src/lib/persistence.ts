import type { GameConfig } from './config-schema';
import type { GameState } from './game-state';

const KEY = 'jeopardy.state.v1';

type StoredPayload = {
  configKey: string;
  state: GameState;
};

export function configKeyOf(config: GameConfig): string {
  return JSON.stringify(config);
}

export function loadState(configKey: string): GameState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed?.configKey !== configKey) return undefined;
    return parsed.state;
  } catch {
    return undefined;
  }
}

export function saveState(state: GameState, configKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredPayload = { configKey, state };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable or quota exceeded — silently skip
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
