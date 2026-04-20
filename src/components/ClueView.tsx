'use client';

import { useEffect } from 'react';
import type { GameConfig } from '@/lib/config-schema';
import type { CurrentClue, Team } from '@/lib/game-state';

type Props = {
  config: GameConfig;
  current: CurrentClue;
  teams: Team[];
  onCorrect: (teamId: string) => void;
  onWrong: (teamId: string) => void;
  onClose: () => void;
  onToggleAnswer: () => void;
};

export function ClueView({
  config,
  current,
  teams,
  onCorrect,
  onWrong,
  onClose,
  onToggleAnswer,
}: Props) {
  const category = config.categories[current.cat];
  const clue = category.clues[current.clue];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const isFormControl =
        tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === 'Escape') onClose();
      if ((e.key === ' ' || e.key === 'Enter') && !isFormControl) {
        e.preventDefault();
        onToggleAnswer();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onToggleAnswer]);

  return (
    <div className="fixed inset-0 bg-jeopardy-blue flex flex-col p-6 md:p-10 z-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <p className="text-lg md:text-2xl uppercase tracking-widest text-white/80">
            {category.name}
          </p>
          <p className="text-3xl md:text-5xl font-black text-jeopardy-gold-bright jeopardy-shadow">
            ${clue.value}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white uppercase tracking-wider text-sm md:text-base border border-white/30 px-3 py-1 rounded"
          title="No one got it — close clue (Esc)"
        >
          No one · Esc
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 text-center overflow-y-auto py-4">
        <p className="text-[4vh] md:text-[6vh] leading-tight font-black uppercase text-white jeopardy-shadow max-w-[90vw] break-words">
          {clue.clue}
        </p>

        <button
          type="button"
          onClick={onToggleAnswer}
          className="text-[3vh] md:text-[4vh] font-black uppercase tracking-widest px-8 py-3 rounded bg-jeopardy-blue-dark border-2 border-jeopardy-gold-bright text-jeopardy-gold-bright hover:bg-jeopardy-gold-bright hover:text-black transition"
        >
          {current.answerRevealed ? 'Hide answer' : 'Reveal answer · Space'}
        </button>

        {current.answerRevealed && (
          <p className="text-[4vh] md:text-[5vh] leading-tight font-black uppercase text-jeopardy-gold-bright jeopardy-shadow max-w-[90vw]">
            {clue.answer}
          </p>
        )}
      </div>

      <div
        className="grid gap-2 md:gap-3 mt-4 shrink-0"
        style={{
          gridTemplateColumns: `repeat(${Math.min(teams.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {teams.map((t) => {
          const disabled = current.wrongTeams.includes(t.id);
          return (
            <div
              key={t.id}
              className={`flex flex-col gap-1 p-2 rounded border-2 ${
                disabled
                  ? 'border-red-500/40 opacity-50'
                  : 'border-jeopardy-gold/40'
              }`}
            >
              <span className="text-center text-sm md:text-base uppercase tracking-wider truncate">
                {t.name} · ${t.score}
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onCorrect(t.id)}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed rounded py-2 font-black text-white text-lg"
                >
                  ✓
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onWrong(t.id)}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded py-2 font-black text-white text-lg"
                >
                  ✗
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
