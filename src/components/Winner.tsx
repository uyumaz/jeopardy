'use client';

import type { Team } from '@/lib/game-state';

type Props = {
  teams: Team[];
  onNewGame: () => void;
};

export function Winner({ teams, onNewGame }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score;
  const hasWinner = sorted.length > 0 && topScore! > 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-wide text-jeopardy-gold-bright jeopardy-shadow mb-10">
        Final Scores
      </h1>

      <ol className="w-full max-w-2xl flex flex-col gap-3 mb-12">
        {sorted.map((t, i) => {
          const winner = hasWinner && t.score === topScore;
          return (
            <li
              key={t.id}
              className={`flex items-center justify-between px-6 py-4 rounded border-2 ${
                winner
                  ? 'bg-jeopardy-gold-bright text-black border-jeopardy-gold-bright'
                  : 'bg-jeopardy-blue border-jeopardy-gold/40'
              }`}
            >
              <span className="text-2xl md:text-3xl font-black uppercase tracking-wide">
                {i + 1}. {t.name} {winner ? '👑' : ''}
              </span>
              <span
                className={`text-3xl md:text-4xl font-black jeopardy-shadow ${
                  winner ? 'text-black' : t.score < 0 ? 'text-red-400' : 'text-jeopardy-gold-bright'
                }`}
              >
                ${t.score}
              </span>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onNewGame}
        className="bg-jeopardy-gold-bright text-black text-2xl font-black uppercase tracking-widest px-10 py-4 rounded hover:brightness-110 jeopardy-shadow"
      >
        New Game
      </button>
    </main>
  );
}
