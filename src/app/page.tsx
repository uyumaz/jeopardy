'use client';

import { useEffect, useReducer, useState } from 'react';
import type { GameConfig } from '@/lib/config-schema';
import { initialState, reducer } from '@/lib/game-state';
import { Setup } from '@/components/Setup';
import { Board } from '@/components/Board';
import { ClueView } from '@/components/ClueView';
import { Winner } from '@/components/Winner';
import { ConfigError } from '@/components/ConfigError';

type ConfigLoad =
  | { status: 'loading' }
  | { status: 'ok'; config: GameConfig }
  | { status: 'error'; error: string; path?: string };

export default function Page() {
  const [load, setLoad] = useState<ConfigLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: 'loading' });
    fetch('/api/config', { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (body.ok) setLoad({ status: 'ok', config: body.config });
        else setLoad({ status: 'error', error: body.error ?? 'Unknown error', path: body.path });
      })
      .catch((e) => {
        if (cancelled) return;
        setLoad({ status: 'error', error: e?.message ?? String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (load.status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-2xl uppercase tracking-widest text-jeopardy-gold-bright jeopardy-shadow">
          Loading…
        </p>
      </main>
    );
  }

  if (load.status === 'error') {
    return (
      <ConfigError
        error={load.error}
        path={load.path}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  return <Game config={load.config} />;
}

function Game({ config }: { config: GameConfig }) {
  const [state, dispatch] = useReducer(reducer, config, initialState);

  if (state.phase === 'setup') {
    return (
      <Setup
        title={config.title}
        onStart={(teams) => dispatch({ type: 'start', teams })}
      />
    );
  }

  if (state.phase === 'winner') {
    return (
      <Winner teams={state.teams} onNewGame={() => dispatch({ type: 'newGame' })} />
    );
  }

  return (
    <>
      <Board
        config={config}
        used={state.used}
        teams={state.teams}
        onPick={(cat, clue) => dispatch({ type: 'pickTile', cat, clue })}
      />
      {state.phase === 'clue' && state.current && (
        <ClueView
          config={config}
          current={state.current}
          teams={state.teams}
          onCorrect={(teamId) => dispatch({ type: 'judgeCorrect', teamId })}
          onWrong={(teamId) => dispatch({ type: 'judgeWrong', teamId })}
          onClose={() => dispatch({ type: 'closeClue' })}
          onToggleAnswer={() => dispatch({ type: 'toggleAnswer' })}
        />
      )}
    </>
  );
}
