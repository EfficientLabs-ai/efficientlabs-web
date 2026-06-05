import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Cpu,
  Workflow,
  FolderKanban,
  Sparkles,
  Plug,
  Brain,
  Boxes,
  Wallet,
  Gift,
  Settings,
} from "lucide-react";

/** The 11 OS modules, in sidebar order. Shared by sidebar + drawer. */
export type OsModule = { label: string; href: string; icon: LucideIcon };

export const OS_MODULES: OsModule[] = [
  { label: "Home", href: "/app", icon: LayoutDashboard },
  { label: "Agents", href: "/app/agents", icon: Cpu },
  { label: "Workflows", href: "/app/workflows", icon: Workflow },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Skills", href: "/app/skills", icon: Sparkles },
  { label: "Integrations", href: "/app/integrations", icon: Plug },
  { label: "Memory", href: "/app/memory", icon: Brain },
  { label: "Atmosphere", href: "/app/atmosphere", icon: Boxes },
  { label: "Wallet", href: "/app/wallet", icon: Wallet },
  { label: "Rewards", href: "/app/rewards", icon: Gift },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

/** Active-route test: exact for /app (Home), prefix for the rest. */
export function isActiveModule(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}
