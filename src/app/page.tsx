'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { GameConfig } from '@/lib/config-schema';
import type { Action, GameState } from '@/lib/game-state';
import { UNDOABLE_ACTIONS, initialState, reducer } from '@/lib/game-state';
import { configKeyOf, loadState, saveState } from '@/lib/persistence';
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

const UNDOABLE = new Set<Action['type']>(UNDOABLE_ACTIONS);

function Game({ config }: { config: GameConfig }) {
  const configKey = useMemo(() => configKeyOf(config), [config]);
  const [state, dispatch] = useReducer(reducer, config, (c) => {
    const restored = loadState(configKey);
    return restored ?? initialState(c);
  });

  useEffect(() => {
    saveState(state, configKey);
  }, [state, configKey]);

  const historyRef = useRef<GameState[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const act = useCallback((action: Action) => {
    if (UNDOABLE.has(action.type)) {
      historyRef.current.push(stateRef.current);
      if (historyRef.current.length > 100) historyRef.current.shift();
      setUndoCount(historyRef.current.length);
    } else if (action.type === 'start' || action.type === 'newGame') {
      historyRef.current = [];
      setUndoCount(0);
    }
    dispatch(action);
  }, []);

  const onUndo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setUndoCount(historyRef.current.length);
    dispatch({ type: 'restore', state: prev });
  }, []);

  const onReset = () => act({ type: 'newGame' });
  const canUndo = undoCount > 0;

  if (state.phase === 'setup') {
    return (
      <Setup
        title={config.title}
        defaultTeams={config.teams}
        onStart={(teams) => act({ type: 'start', teams })}
      />
    );
  }

  if (state.phase === 'winner') {
    return (
      <Winner
        teams={state.teams}
        onNewGame={onReset}
        onUndo={canUndo ? onUndo : undefined}
      />
    );
  }

  return (
    <>
      <Board
        config={config}
        used={state.used}
        teams={state.teams}
        onPick={(cat, clue) => act({ type: 'pickTile', cat, clue })}
        onReset={onReset}
        onUndo={canUndo ? onUndo : undefined}
      />
      {state.phase === 'clue' && state.current && (
        <ClueView
          config={config}
          current={state.current}
          teams={state.teams}
          onCorrect={(teamId) => act({ type: 'judgeCorrect', teamId })}
          onWrong={(teamId) => act({ type: 'judgeWrong', teamId })}
          onClose={() => act({ type: 'closeClue' })}
          onToggleAnswer={() => act({ type: 'toggleAnswer' })}
          onUndo={canUndo ? onUndo : undefined}
        />
      )}
    </>
  );
}
