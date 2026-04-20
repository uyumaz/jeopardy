'use client';

import { useState } from 'react';

type Props = {
  title: string;
  defaultTeams?: string[];
  onStart: (teams: { name: string }[]) => void;
};

const MIN_TEAMS = 2;
const MAX_TEAMS = 10;

export function Setup({ title, defaultTeams, onStart }: Props) {
  const [count, setCount] = useState(() =>
    defaultTeams && defaultTeams.length >= MIN_TEAMS ? defaultTeams.length : 3,
  );
  const [names, setNames] = useState<string[]>(() => {
    const fallback = Array.from({ length: MAX_TEAMS }, (_, i) => `Team ${i + 1}`);
    if (!defaultTeams) return fallback;
    return fallback.map((f, i) => defaultTeams[i] ?? f);
  });

  const active = names.slice(0, count);
  const canStart = active.every((n) => n.trim().length > 0);

  const setName = (i: number, v: string) => {
    setNames((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl md:text-7xl font-black uppercase tracking-wide text-jeopardy-gold-bright jeopardy-shadow mb-4">
        {title}
      </h1>
      <p className="text-xl text-white/80 mb-10 uppercase tracking-wider">
        Set up your teams
      </p>

      <div className="flex items-center gap-6 mb-8">
        <span className="text-xl uppercase tracking-wider">Teams:</span>
        <button
          type="button"
          onClick={() => setCount((c) => Math.max(MIN_TEAMS, c - 1))}
          disabled={count <= MIN_TEAMS}
          className="w-12 h-12 rounded bg-jeopardy-blue text-jeopardy-gold-bright text-3xl font-black disabled:opacity-40 hover:brightness-125"
        >
          −
        </button>
        <span className="text-4xl font-black text-jeopardy-gold w-12 text-center jeopardy-shadow">
          {count}
        </span>
        <button
          type="button"
          onClick={() => setCount((c) => Math.min(MAX_TEAMS, c + 1))}
          disabled={count >= MAX_TEAMS}
          className="w-12 h-12 rounded bg-jeopardy-blue text-jeopardy-gold-bright text-3xl font-black disabled:opacity-40 hover:brightness-125"
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-10">
        {active.map((n, i) => (
          <input
            key={i}
            value={n}
            onChange={(e) => setName(i, e.target.value)}
            placeholder={`Team ${i + 1}`}
            className="bg-jeopardy-blue text-white text-lg px-4 py-3 rounded border-2 border-jeopardy-gold/40 focus:border-jeopardy-gold-bright focus:outline-none uppercase tracking-wide"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onStart(active.map((name) => ({ name: name.trim() })))}
        disabled={!canStart}
        className="bg-jeopardy-gold-bright text-black text-3xl font-black uppercase tracking-widest px-12 py-5 rounded disabled:opacity-40 hover:brightness-110 jeopardy-shadow"
      >
        Start Game
      </button>
    </main>
  );
}
