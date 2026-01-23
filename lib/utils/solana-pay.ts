/**
 * Solana Pay transfer URL (solana: scheme).
 * @see https://docs.solanapay.com/spec
 */

export function buildTipUrl(
  recipient: string,
  amountSol: number,
  label?: string,
  message?: string
): string {
  const params = new URLSearchParams();
  params.set("amount", amountSol.toFixed(9));
  if (label) params.set("label", label);
  if (message) params.set("message", message);
  const qs = params.toString();
  return `solana:${recipient}${qs ? `?${qs}` : ""}`;
}
