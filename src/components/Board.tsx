'use client';

import type { GameConfig } from '@/lib/config-schema';
import type { Team } from '@/lib/game-state';
import { Tile } from './Tile';

type Props = {
  config: GameConfig;
  used: boolean[][];
  teams: Team[];
  onPick: (cat: number, clue: number) => void;
};

export function Board({ config, used, teams, onPick }: Props) {
  const clueCount = config.categories[0]?.clues.length ?? 0;
  const catCount = config.categories.length;

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 gap-4">
      <div
        className="grid gap-1 flex-1"
        style={{
          gridTemplateColumns: `repeat(${catCount}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${clueCount}, minmax(0, 1fr))`,
        }}
      >
        {config.categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-jeopardy-blue border border-black/40 rounded-sm flex items-center justify-center p-2 min-h-[4.5rem]"
          >
            <span className="text-center text-lg md:text-2xl font-black uppercase tracking-wide text-white jeopardy-shadow leading-tight">
              {cat.name}
            </span>
          </div>
        ))}

        {Array.from({ length: clueCount }).map((_, clueIdx) =>
          config.categories.map((cat, catIdx) => (
            <Tile
              key={`${catIdx}-${clueIdx}`}
              value={cat.clues[clueIdx].value}
              used={used[catIdx][clueIdx]}
              onClick={() => onPick(catIdx, clueIdx)}
            />
          )),
        )}
      </div>

      <Scoreboard teams={teams} />
    </main>
  );
}

function Scoreboard({ teams }: { teams: Team[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))` }}>
      {teams.map((t) => (
        <div
          key={t.id}
          className="bg-jeopardy-blue border-2 border-jeopardy-gold/50 rounded px-3 py-2 flex flex-col items-center"
        >
          <span className="text-sm md:text-base uppercase tracking-wider text-white/80 truncate max-w-full">
            {t.name}
          </span>
          <span
            className={`text-2xl md:text-3xl font-black jeopardy-shadow ${
              t.score < 0 ? 'text-red-400' : 'text-jeopardy-gold-bright'
            }`}
          >
            €{t.score}
          </span>
        </div>
      ))}
    </div>
  );
}
