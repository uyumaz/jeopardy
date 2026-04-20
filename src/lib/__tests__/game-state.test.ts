import { describe, expect, it } from 'vitest';
import type { GameConfig } from '../config-schema';
import {
  initialState,
  isBoardComplete,
  reducer,
  valueOf,
  type GameState,
} from '../game-state';

const fixture: GameConfig = {
  title: 'Test',
  categories: [
    {
      name: 'CAT A',
      clues: [
        { value: 100, clue: 'A1 clue', answer: 'A1 answer' },
        { value: 200, clue: 'A2 clue', answer: 'A2 answer' },
      ],
    },
    {
      name: 'CAT B',
      clues: [
        { value: 100, clue: 'B1 clue', answer: 'B1 answer' },
        { value: 200, clue: 'B2 clue', answer: 'B2 answer' },
      ],
    },
  ],
};

function started(teams = ['Alpha', 'Beta', 'Gamma']): GameState {
  return reducer(initialState(fixture), {
    type: 'start',
    teams: teams.map((name) => ({ name })),
  });
}

describe('reducer', () => {
  it('valueOf helper returns the configured value', () => {
    expect(valueOf(fixture, 1, 1)).toBe(200);
  });

  it('isBoardComplete detects completion', () => {
    expect(isBoardComplete([[false, true], [true, true]])).toBe(false);
    expect(isBoardComplete([[true, true], [true, true]])).toBe(true);
  });

  it('start with 3 teams transitions to board and assigns ids t1..t3', () => {
    const s = started();
    expect(s.phase).toBe('board');
    expect(s.teams.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
    expect(s.teams.map((t) => t.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(s.teams.every((t) => t.score === 0)).toBe(true);
  });

  it('start with empty teams array returns state unchanged', () => {
    const init = initialState(fixture);
    const next = reducer(init, { type: 'start', teams: [] });
    expect(next).toBe(init);
  });

  it('pickTile opens clue view', () => {
    const s = reducer(started(), { type: 'pickTile', cat: 0, clue: 0 });
    expect(s.phase).toBe('clue');
    expect(s.current).toEqual({
      cat: 0,
      clue: 0,
      wrongTeams: [],
      answerRevealed: false,
    });
  });

  it('pickTile on a used tile is a no-op', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    const attempt = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    expect(attempt).toBe(s);
  });

  it('judgeCorrect adds value, marks tile used, returns to board when tiles remain', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 1 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't2' });
    expect(s.phase).toBe('board');
    expect(s.current).toBeUndefined();
    expect(s.used[0][1]).toBe(true);
    expect(s.teams.find((t) => t.id === 't2')!.score).toBe(200);
    expect(s.teams.find((t) => t.id === 't1')!.score).toBe(0);
  });

  it('judgeWrong subtracts value, adds to wrongTeams, stays in clue phase', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    s = reducer(s, { type: 'judgeWrong', teamId: 't1' });
    expect(s.phase).toBe('clue');
    expect(s.current!.wrongTeams).toEqual(['t1']);
    expect(s.teams.find((t) => t.id === 't1')!.score).toBe(-100);
    expect(s.used[0][0]).toBe(false);

    // duplicate judgeWrong on same team is a no-op: no second deduction, same reference.
    const s2 = reducer(s, { type: 'judgeWrong', teamId: 't1' });
    expect(s2).toBe(s);
    expect(s2.current!.wrongTeams).toEqual(['t1']);
    expect(s2.teams.find((t) => t.id === 't1')!.score).toBe(-100);
  });

  it('judgeWrong then judgeCorrect: first deducted, second awarded, tile used, back to board', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 1, clue: 0 });
    s = reducer(s, { type: 'judgeWrong', teamId: 't1' });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't2' });
    expect(s.phase).toBe('board');
    expect(s.teams.find((t) => t.id === 't1')!.score).toBe(-100);
    expect(s.teams.find((t) => t.id === 't2')!.score).toBe(100);
    expect(s.used[1][0]).toBe(true);
    expect(s.current).toBeUndefined();
  });

  it('closeClue marks used with no score change', () => {
    let s = started();
    const initialScores = s.teams.map((t) => t.score);
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    s = reducer(s, { type: 'closeClue' });
    expect(s.phase).toBe('board');
    expect(s.used[0][0]).toBe(true);
    expect(s.teams.map((t) => t.score)).toEqual(initialScores);
    expect(s.current).toBeUndefined();
  });

  it('last tile resolved transitions to winner phase', () => {
    let s = started();
    // Resolve all 4 tiles.
    const picks: Array<[number, number]> = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ];
    for (const [cat, clue] of picks) {
      s = reducer(s, { type: 'pickTile', cat, clue });
      s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    }
    expect(s.phase).toBe('winner');
    expect(s.current).toBeUndefined();
    expect(s.teams.find((t) => t.id === 't1')!.score).toBe(600);
    expect(isBoardComplete(s.used)).toBe(true);
  });

  it('closeClue on the last remaining tile also transitions to winner', () => {
    let s = started();
    // Burn 3 tiles correct, close the last.
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 1 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    s = reducer(s, { type: 'pickTile', cat: 1, clue: 0 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    s = reducer(s, { type: 'pickTile', cat: 1, clue: 1 });
    s = reducer(s, { type: 'closeClue' });
    expect(s.phase).toBe('winner');
  });

  it('newGame resets teams and used', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    s = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    const fresh = reducer(s, { type: 'newGame' });
    expect(fresh.phase).toBe('setup');
    expect(fresh.teams).toEqual([]);
    expect(fresh.used.flat().every((v) => v === false)).toBe(true);
    expect(fresh.current).toBeUndefined();
    expect(fresh.config).toBe(s.config);
  });

  it('toggleAnswer flips reveal', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    expect(s.current!.answerRevealed).toBe(false);
    s = reducer(s, { type: 'toggleAnswer' });
    expect(s.current!.answerRevealed).toBe(true);
    s = reducer(s, { type: 'toggleAnswer' });
    expect(s.current!.answerRevealed).toBe(false);
  });

  it('does not mutate input state on pickTile', () => {
    const s = started();
    const before = JSON.stringify(s);
    reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    expect(JSON.stringify(s)).toBe(before);
  });

  it('does not mutate used array on judgeCorrect', () => {
    let s = started();
    s = reducer(s, { type: 'pickTile', cat: 0, clue: 0 });
    const usedRef = s.used;
    const innerRef = s.used[0];
    const next = reducer(s, { type: 'judgeCorrect', teamId: 't1' });
    expect(s.used).toBe(usedRef);
    expect(s.used[0]).toBe(innerRef);
    expect(next.used).not.toBe(usedRef);
    expect(s.used[0][0]).toBe(false);
    expect(next.used[0][0]).toBe(true);
  });
});
