import type { Metadata } from "next";
import { getKOLPersona } from "@/lib/agents/kol-personas";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const persona = getKOLPersona(handle);
  const name = persona?.name ?? handle;
  return {
    title: `${name} (@${handle}) | KOLMarket.ai`,
    description: persona
      ? `${persona.personality} Digital twin and Agent Suite on KOLMarket.ai.`
      : `KOL @${handle} on KOLMarket.ai — Price the Human, Empower the Agent.`,
  };
}

export default function KOLHandleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
