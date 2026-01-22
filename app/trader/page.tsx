import { redirect } from "next/navigation";

/**
 * Trader 门户入口：重定向到交易终端 /terminal
 * RolePortals 中 "I am a Trader" 指向 /trader，实际交易功能在 /terminal
 */
export default function TraderPortalPage() {
  redirect("/terminal");
}
