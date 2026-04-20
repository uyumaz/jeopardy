import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { validateConfig } from '@/lib/config-schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configPath = path.join(process.cwd(), 'config', 'game.yaml');
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const parsed = YAML.parse(raw);
    const result = validateConfig(parsed);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, path: configPath },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: true, config: result.config });
  } catch (e: any) {
    const msg =
      e?.code === 'ENOENT'
        ? `Config file not found at ${configPath}`
        : `Failed to read config: ${e?.message ?? e}`;
    return NextResponse.json(
      { ok: false, error: msg, path: configPath },
      { status: e?.code === 'ENOENT' ? 404 : 500 },
    );
  }
}
