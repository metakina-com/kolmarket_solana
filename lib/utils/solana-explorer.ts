/**
 * Explorer URLs for addresses and transactions.
 * Use NEXT_PUBLIC_EXPLORER_URL (e.g. https://solscan.io) as base when set.
 */

const DEFAULT_BASE = "https://solscan.io";

function getBase(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_EXPLORER_URL || DEFAULT_BASE;
  }
  return process.env.NEXT_PUBLIC_EXPLORER_URL || DEFAULT_BASE;
}

export function getExplorerAddressUrl(address: string): string {
  const base = getBase().replace(/\/$/, "");
  if (base.includes("solscan.io")) return `${base}/account/${address}`;
  if (base.includes("solana.fm")) return `${base}/address/${address}`;
  return `${base}/account/${address}`;
}

export function getExplorerTxUrl(signature: string): string {
  const base = getBase().replace(/\/$/, "");
  if (base.includes("solscan.io")) return `${base}/tx/${signature}`;
  if (base.includes("solana.fm")) return `${base}/tx/${signature}`;
  return `${base}/tx/${signature}`;
}
