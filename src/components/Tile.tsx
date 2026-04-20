'use client';

type Props = {
  value: number;
  used: boolean;
  onClick: () => void;
};

export function Tile({ value, used, onClick }: Props) {
  if (used) {
    return (
      <div className="bg-jeopardy-blue-dark border border-black/40 rounded-sm min-h-0" />
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-jeopardy-blue border border-black/40 rounded-sm flex items-center justify-center hover:brightness-125 active:brightness-90 transition min-h-0"
    >
      <span className="text-[min(5vw,5vh)] font-black text-jeopardy-gold-bright jeopardy-shadow">
        €{value}
      </span>
    </button>
  );
}
