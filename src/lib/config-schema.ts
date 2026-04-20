import { z } from 'zod';

const nonBlank = (field: string) =>
  z.string().refine((s) => s.trim().length > 0, { message: `${field} must not be blank` });

export const zClue = z.object({
  value: z.number().int().positive(),
  clue: nonBlank('clue'),
  answer: nonBlank('answer'),
});

export const zCategory = z.object({
  name: nonBlank('name'),
  clues: z.array(zClue).min(1),
});

export const zGameConfig = z
  .object({
    title: nonBlank('title'),
    categories: z.array(zCategory).min(1),
    teams: z.array(nonBlank('team')).min(2).max(10).optional(),
  })
  .superRefine((cfg, ctx) => {
    const counts = cfg.categories.map((c) => c.clues.length);
    const first = counts[0];
    if (counts.some((n) => n !== first)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'All categories must have the same number of clues',
        path: ['categories'],
      });
    }
    cfg.categories.forEach((cat, ci) => {
      for (let i = 1; i < cat.clues.length; i++) {
        if (cat.clues[i].value <= cat.clues[i - 1].value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Category "${cat.name}" values must be strictly ascending`,
            path: ['categories', ci, 'clues'],
          });
          break;
        }
      }
    });
  });

export type Clue = z.infer<typeof zClue>;
export type Category = z.infer<typeof zCategory>;
export type GameConfig = z.infer<typeof zGameConfig>;

export function validateConfig(
  raw: unknown,
): { ok: true; config: GameConfig } | { ok: false; error: string } {
  const result = zGameConfig.safeParse(raw);
  if (result.success) {
    return { ok: true, config: result.data };
  }
  const error = result.error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
  return { ok: false, error };
}
