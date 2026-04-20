'use client';

type Props = {
  value: number;
  used: boolean;
  onClick: () => void;
};

export function Tile({ value, used, onClick }: Props) {
  if (used) {
    return (
      <div className="aspect-[4/3] bg-jeopardy-blue-dark border border-black/40 rounded-sm" />
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="aspect-[4/3] bg-jeopardy-blue border border-black/40 rounded-sm flex items-center justify-center hover:brightness-125 active:brightness-90 transition"
    >
      <span className="text-3xl md:text-5xl font-black text-jeopardy-gold-bright jeopardy-shadow">
        €{value}
      </span>
    </button>
  );
}
