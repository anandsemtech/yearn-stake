import { Address, getAddress } from 'viem';

export type TokenKey = 'YY' | 'SY' | 'PY';
export type TokenMeta = {
  key: TokenKey;
  address: Address;
  symbol: string;
  decimals: number;
  name?: string;
};

function envAddr(key: string): Address | null {
  const v = (import.meta as any).env?.[key] as string | undefined;
  if (!v) return null;
  try {
    return getAddress(v) as Address; // checksums & validates
  } catch {
    console.warn(`[tokens] Invalid address in ${key}:`, v);
    return null;
  }
}

function envInt(key: string, fallback: number) {
  const raw = (import.meta as any).env?.[key] as string | undefined;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Pulls token metadata from .env (no RPC). */
export function getTokensFromEnv(): TokenMeta[] {
  const YY = envAddr('VITE_YYEARN_ADDRESS');
  const SY = envAddr('VITE_SYEARN_ADDRESS');
  const PY = envAddr('VITE_PYEARN_ADDRESS');

  const YY_DEC = envInt('VITE_YY_DECIMALS', 18);
  const SY_DEC = envInt('VITE_SY_DECIMALS', 18);
  const PY_DEC = envInt('VITE_PY_DECIMALS', 18);

  const out: TokenMeta[] = [];
  if (YY) out.push({ key: 'YY', address: YY, symbol: 'YY', decimals: YY_DEC, name: 'yYearn' });
  if (SY) out.push({ key: 'SY', address: SY, symbol: 'SY', decimals: SY_DEC, name: 'sYearn' });
  if (PY) out.push({ key: 'PY', address: PY, symbol: 'PY', decimals: PY_DEC, name: 'pYearn' });
  return out;
}
