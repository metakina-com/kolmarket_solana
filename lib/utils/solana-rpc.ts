/**
 * Solana RPC endpoint for client (wallet, Jupiter).
 * Use NEXT_PUBLIC_SOLANA_RPC (e.g. Helius) when set; else public mainnet.
 */

const MAINNET = "https://api.mainnet-beta.solana.com";

export function getRpcEndpoint(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC || MAINNET;
}
