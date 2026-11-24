"use client";

import { AlertTriangle, ArrowUpRight, Copy, Layers, ScanLine } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/features/app/app-context";
import { EmptyNote, Section } from "@/features/app/blocks";
import { cn } from "@/shared/cn";
import { formatDay } from "@/shared/format";
import type { AnomalyScan, Segments } from "./types";

/** K-Means merchant segments: where the monthly spend actually goes. */
export function SegmentsPanel({ data }: { data: Segments }) {
  const { money } = useApp();
  if (!data.segments.length) {
    return (
      <Section title="How you spend" hint={`Merchants over the last ${data.windowDays} days`}>
        <EmptyNote>{data.note}</EmptyNote>
      </Section>
    );
  }
  const total = data.segments.reduce((sum, segment) => sum + segment.monthlyTotal, 0);
  return (
    <Section title="How you spend" hint={data.note} href="/transactions" linkLabel="All spending">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {data.segments.map((segment) => (
          <span
            key={segment.key}
            className="h-full first:rounded-s-full last:rounded-e-full"
            style={{ backgroundColor: segment.color, width: `${Math.max(2, (segment.monthlyTotal / Math.max(1, total)) * 100)}%` }}
            title={`${segment.label}: ${money(segment.monthlyTotal)}/mo`}
          />
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.segments.map((segment) => (
          <li key={segment.key} className="rounded-lg border border-white/50 bg-card/40 p-3 backdrop-blur-sm dark:border-white/10">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
              <span className="shrink-0 text-sm tabular-nums">{money(segment.monthlyTotal)}<span className="text-xs text-muted-foreground">/mo</span></span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {segment.share}% of spend · {segment.merchants} merchant{segment.merchants === 1 ? "" : "s"} · {money(segment.averageTicket)} avg
            </p>
            {segment.top.length > 0 && (
              <p className="mt-1.5 flex flex-wrap gap-1">
                {segment.top.slice(0, 3).map((merchant) => (
                  <Link
                    key={merchant.name}
                    href={merchant.href}
                    className="max-w-full truncate rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {merchant.name}
                  </Link>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The nightly anomaly scan, on screen: outliers, category spikes, duplicate charges. */
export function AnomalyScanPanels({ scan }: { scan: AnomalyScan }) {
  const { money } = useApp();
  const { counts } = scan;
  if (counts.transactions + counts.spikes + counts.duplicates === 0) {
    return (
      <Section title="Anomaly scan" hint={`${scan.scanned} payments checked over the last ${scan.windowDays} days`}>
        <EmptyNote>Nothing unusual. Each night spending is compared with its own recent pattern.</EmptyNote>
      </Section>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Section
        title="Unusual payments"
        hint={`${scan.scanned} payments scanned · ${counts.transactions} flagged`}
        actions={<ScanLine className="size-4 text-muted-foreground" />}
      >
        {scan.transactions.length ? (
          <ul className="divide-y divide-border">
            {scan.transactions.map((tx) => (
              <li key={tx.id}>
                <Link href={tx.href} className="flex items-center gap-3 py-2 hover:opacity-80">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{tx.merchant}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatDay(tx.date, "short")} · {tx.reason}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-amber-600 tabular-nums dark:text-amber-400">{money(tx.amount, tx.currency)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>No single payment stands out.</EmptyNote>
        )}
      </Section>

      <Section title="Category spikes" hint="Above their own recent average" actions={<Layers className="size-4 text-muted-foreground" />}>
        {scan.spikes.length ? (
          <ul className="divide-y divide-border">
            {scan.spikes.map((spike) => (
              <li key={spike.key} className="space-y-0.5 py-2">
                <p className="flex items-start gap-2 text-sm font-medium">
                  <AlertTriangle className={cn("mt-0.5 size-3.5 shrink-0", spike.severity === "warning" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                  {spike.title}
                </p>
                <p className="ps-5 text-xs text-muted-foreground">{spike.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>Every category is in line with the last few months.</EmptyNote>
        )}
      </Section>

      <Section title="Possible duplicates" hint="Same amount within a week" actions={<Copy className="size-4 text-muted-foreground" />}>
        {scan.duplicates.length ? (
          <ul className="divide-y divide-border">
            {scan.duplicates.map((duplicate) => (
              <li key={`${duplicate.a.id}-${duplicate.b.id}`} className="space-y-0.5 py-2">
                <p className="flex items-center justify-between gap-2 text-sm font-medium">
                  <span className="truncate">{duplicate.a.merchant ?? "Unknown"}</span>
                  <span className="shrink-0 tabular-nums">{money(duplicate.a.amount, duplicate.currency)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDay(duplicate.a.date, "short")} and {formatDay(duplicate.b.date, "short")} · {duplicate.reasons.join(", ")}
                </p>
                <Link
                  href={`/transactions?from=${duplicate.a.date}&to=${duplicate.b.date}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Check both <ArrowUpRight className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>No double entries found.</EmptyNote>
        )}
      </Section>
    </div>
  );
}
