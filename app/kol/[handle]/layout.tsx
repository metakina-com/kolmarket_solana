import type { Metadata } from "next";
import { getKOLPersona, getAvailableKOLs } from "@/lib/agents/kol-personas";

type Props = { params: Promise<{ handle: string }> };

// 生成静态参数，使所有已知 KOL 页面在构建时预生成
// 这样它们就是静态页面，不需要 Edge Runtime
export function generateStaticParams() {
  const kols = getAvailableKOLs();
  return kols.map((kol) => ({
    handle: kol.handle,
  }));
}

// 对于未知的 KOL，返回 404（不动态生成）
export const dynamicParams = false;

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
