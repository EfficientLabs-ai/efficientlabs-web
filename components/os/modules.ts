import type { LucideIcon } from "lucide-react";
import type { PlanSlug } from "@/lib/plans";
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

/** The 11 OS modules, in sidebar order. Shared by sidebar + drawer.
 *  `requiredPlan` (optional) gates the whole module behind a plan — the shell
 *  renders an upgrade wall and the sidebar shows a lock for users below it. */
export type OsModule = { label: string; href: string; icon: LucideIcon; requiredPlan?: PlanSlug };

export const OS_MODULES: OsModule[] = [
  { label: "Home", href: "/app", icon: LayoutDashboard },
  { label: "Agents", href: "/app/agents", icon: Cpu },
  { label: "Workflows", href: "/app/workflows", icon: Workflow },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Skills", href: "/app/skills", icon: Sparkles },
  { label: "Integrations", href: "/app/integrations", icon: Plug, requiredPlan: "exos_pro" },
  { label: "Memory", href: "/app/memory", icon: Brain },
  { label: "Atmosphere", href: "/app/atmosphere", icon: Boxes },
  { label: "Wallet", href: "/app/wallet", icon: Wallet },
  { label: "Rewards", href: "/app/rewards", icon: Gift },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

/**
 * Grouped sidebar layout (Attio pattern): uppercase mono section labels over
 * dense 32px items. Same modules as OS_MODULES, partitioned by domain. Home sits
 * ungrouped at the top (group: null), everything else slots under a section.
 */
export type OsNavGroup = { label: string | null; items: OsModule[] };

export const OS_NAV_GROUPS: OsNavGroup[] = [
  { label: null, items: [OS_MODULES[0]] }, // Home
  {
    label: "Workspace",
    items: [OS_MODULES[1], OS_MODULES[2], OS_MODULES[3]], // Agents, Workflows, Projects
  },
  {
    label: "Mesh",
    items: [OS_MODULES[7], OS_MODULES[6]], // Atmosphere, Memory
  },
  {
    label: "Skills",
    items: [OS_MODULES[4], OS_MODULES[5]], // Skills, Integrations
  },
  {
    label: "Account",
    items: [OS_MODULES[8], OS_MODULES[9], OS_MODULES[10]], // Wallet, Rewards, Settings
  },
];

/** Active-route test: exact for /app (Home), prefix for the rest. */
export function isActiveModule(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

/** The module owning the current path (most specific match wins). */
export function moduleForPath(pathname: string | null): OsModule | undefined {
  const matches = OS_MODULES.filter((m) => isActiveModule(pathname, m.href));
  return matches.sort((a, b) => b.href.length - a.href.length)[0];
}

/** The plan a route requires, if any (module-level gate). */
export function requiredPlanForPath(pathname: string | null): PlanSlug | undefined {
  return moduleForPath(pathname)?.requiredPlan;
}
