import type { GameConfig } from './config-schema';

export type Phase = 'setup' | 'board' | 'clue' | 'winner';

export type Team = { id: string; name: string; score: number };

export type CurrentClue = {
  cat: number;
  clue: number;
  wrongTeams: string[];
  answerRevealed: boolean;
};

export type GameState = {
  phase: Phase;
  teams: Team[];
  used: boolean[][];
  current?: CurrentClue;
  config: GameConfig;
};

export type Action =
  | { type: 'start'; teams: { name: string }[] }
  | { type: 'pickTile'; cat: number; clue: number }
  | { type: 'judgeCorrect'; teamId: string }
  | { type: 'judgeWrong'; teamId: string }
  | { type: 'closeClue' }
  | { type: 'toggleAnswer' }
  | { type: 'newGame' };

export function initialState(config: GameConfig): GameState {
  const used = config.categories.map((cat) => cat.clues.map(() => false));
  return {
    phase: 'setup',
    teams: [],
    used,
    config,
  };
}

export function valueOf(config: GameConfig, cat: number, clue: number): number {
  return config.categories[cat].clues[clue].value;
}

export function isBoardComplete(used: boolean[][]): boolean {
  return used.every((col) => col.every((v) => v));
}

function cloneUsed(used: boolean[][]): boolean[][] {
  return used.map((col) => col.slice());
}

function markUsed(used: boolean[][], cat: number, clue: number): boolean[][] {
  const next = cloneUsed(used);
  next[cat] = next[cat].slice();
  next[cat][clue] = true;
  return next;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start': {
      if (state.phase !== 'setup') return state;
      if (action.teams.length === 0) return state;
      const teams: Team[] = action.teams.map((t, i) => ({
        id: `t${i + 1}`,
        name: t.name,
        score: 0,
      }));
      return { ...state, phase: 'board', teams };
    }

    case 'pickTile': {
      if (state.phase !== 'board') return state;
      const { cat, clue } = action;
      if (!state.used[cat] || state.used[cat][clue] === undefined) return state;
      if (state.used[cat][clue]) return state;
      const current: CurrentClue = {
        cat,
        clue,
        wrongTeams: [],
        answerRevealed: false,
      };
      return { ...state, phase: 'clue', current };
    }

    case 'judgeCorrect': {
      if (state.phase !== 'clue' || !state.current) return state;
      const { cat, clue } = state.current;
      const value = valueOf(state.config, cat, clue);
      const teams = state.teams.map((t) =>
        t.id === action.teamId ? { ...t, score: t.score + value } : t,
      );
      const used = markUsed(state.used, cat, clue);
      const complete = isBoardComplete(used);
      return {
        ...state,
        teams,
        used,
        phase: complete ? 'winner' : 'board',
        current: undefined,
      };
    }

    case 'judgeWrong': {
      if (state.phase !== 'clue' || !state.current) return state;
      if (state.current.wrongTeams.includes(action.teamId)) return state;
      const { cat, clue, wrongTeams } = state.current;
      const value = valueOf(state.config, cat, clue);
      const teams = state.teams.map((t) =>
        t.id === action.teamId ? { ...t, score: t.score - value } : t,
      );
      const current: CurrentClue = {
        ...state.current,
        wrongTeams: [...wrongTeams, action.teamId],
      };
      return { ...state, teams, current };
    }

    case 'closeClue': {
      if (state.phase !== 'clue' || !state.current) return state;
      const { cat, clue } = state.current;
      const used = markUsed(state.used, cat, clue);
      const complete = isBoardComplete(used);
      return {
        ...state,
        used,
        phase: complete ? 'winner' : 'board',
        current: undefined,
      };
    }

    case 'toggleAnswer': {
      if (state.phase !== 'clue' || !state.current) return state;
      const current: CurrentClue = {
        ...state.current,
        answerRevealed: !state.current.answerRevealed,
      };
      return { ...state, current };
    }

    case 'newGame': {
      return initialState(state.config);
    }

    default:
      return state;
  }
}
