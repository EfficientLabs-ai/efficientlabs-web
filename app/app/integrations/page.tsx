"use client";
import { useState } from "react";
import {
  Mail,
  GitBranch,
  FileText,
  MessageSquare,
  HardDrive,
  Calendar,
  CreditCard,
  ShoppingBag,
  Plug,
} from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import ConnectRow from "@/components/os/ConnectRow";
import ComingSoon from "@/components/os/ComingSoon";
import StatusChip from "@/components/os/StatusChip";

// Real connect targets. The OAuth broker behind these is operator-configured and
// never named in the UI by design. lucide-react v1 has no GitHub glyph → GitBranch.
const PROVIDERS = [
  { icon: Mail, name: "Gmail", detail: "Email — read, draft, send" },
  { icon: GitBranch, name: "GitHub", detail: "Repos, issues, pull requests" },
  { icon: FileText, name: "Notion", detail: "Pages and databases" },
  { icon: MessageSquare, name: "Slack", detail: "Channels and direct messages" },
  { icon: HardDrive, name: "Google Drive", detail: "Files and folders" },
  { icon: Calendar, name: "Google Calendar", detail: "Events and scheduling" },
  { icon: CreditCard, name: "Stripe", detail: "Payments and invoices" },
  { icon: ShoppingBag, name: "Shopify", detail: "Orders, products, customers" },
];

export default function IntegrationsPage() {
  const { signedIn } = useOs();
  const [pendingFor, setPendingFor] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Integrations"
        title={
          <>
            Connect your <span className="aurora-text">tools</span>
          </>
        }
        statusLevel="standalone"
        statusLabel="Available at launch"
        description="Connect the apps you already use to StratosAgent so it can act across them — read, draft, and take approved actions on your behalf. OAuth connections become available at launch; nothing is connected yet."
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Available connections
          </h2>
          <StatusChip tone="coming" label="Available at launch" size="sm" />
        </div>

        <div className="grid gap-2.5">
          {PROVIDERS.map((p) => (
            <ConnectRow
              key={p.name}
              icon={p.icon}
              name={`Connect ${p.name} to StratosAgent`}
              detail={p.detail}
              state={signedIn ? "available" : "preview"}
              cta="Connect"
              onConnect={() => setPendingFor(p.name)}
            />
          ))}
        </div>
      </section>

      {pendingFor && signedIn && (
        <ComingSoon
          title={`Connecting ${pendingFor} is available at launch`}
          description="OAuth connections turn on at launch, once the connection broker is configured for your workspace. This is a preview of which tools StratosAgent will reach — nothing is connected yet, and no fake connection is shown."
        />
      )}

      {!signedIn && (
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="preview" />
          <span className="text-[13px] text-[color:var(--color-ink-dim)]">
            Sign in to set up your connections.
          </span>
        </div>
      )}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
        <Plug size={14} className="mt-0.5 shrink-0" />
        These are real connection targets. Each one runs through a secret-guarded,
        write-approval-gated broker — StratosAgent never holds a raw token in the open,
        and every outbound action passes the cost handshake first.
      </p>
    </div>
  );
}
