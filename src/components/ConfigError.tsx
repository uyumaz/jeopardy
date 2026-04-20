'use client';

type Props = {
  error: string;
  path?: string;
  onRetry: () => void;
};

export function ConfigError({ error, path, onRetry }: Props) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-black uppercase tracking-wide text-red-400 jeopardy-shadow mb-6">
        Config Error
      </h1>
      <p className="text-xl text-white/90 max-w-3xl mb-4 whitespace-pre-wrap break-words">
        {error}
      </p>
      {path && (
        <p className="text-sm text-white/60 mb-8 font-mono break-all">
          Expected at: {path}
        </p>
      )}
      <p className="text-base text-white/70 mb-8 max-w-2xl">
        Edit <code className="text-jeopardy-gold-bright">config/game.yaml</code>, then click
        Retry. See{' '}
        <code className="text-jeopardy-gold-bright">config/README.md</code> for the schema.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-jeopardy-gold-bright text-black text-xl font-black uppercase tracking-widest px-8 py-3 rounded hover:brightness-110 jeopardy-shadow"
      >
        Retry
      </button>
    </main>
  );
}
