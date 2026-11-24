"use client";

import { ArrowLeftRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/features/app/app-context";
import { EmptyNote, Section } from "@/features/app/blocks";
import type { SubscriptionDuplicates } from "@/features/insights/types";

/** Pairs of active subscriptions that look like the same service. */
export function SubscriptionDuplicatesPanel({ data }: { data: SubscriptionDuplicates | null }) {
  const { money } = useApp();
  if (!data) return null;
  return (
    <Section
      title="Possible duplicates"
      hint={`${data.activeCount} active subscriptions compared by provider, name and monthly cost`}
      actions={
        data.duplicates.length ? (
          <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            {money(data.potentialMonthly)}/mo could be saved
          </span>
        ) : undefined
      }
    >
      {data.duplicates.length ? (
        <ul className="divide-y divide-border">
          {data.duplicates.map((duplicate) => (
            <li key={`${duplicate.aId}-${duplicate.bId}`} className="flex flex-wrap items-center gap-3 py-2">
              <ArrowLeftRight className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-center gap-1.5 text-sm">
                  <Link href={duplicate.aHref} className="truncate hover:underline">
                    {duplicate.aName}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">and</span>
                  <Link href={duplicate.bHref} className="truncate hover:underline">
                    {duplicate.bName}
                  </Link>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {duplicate.reason} {Math.round(duplicate.score * 100)}% match.
                </p>
              </div>
              <div className="text-right text-sm tabular-nums">
                {money(duplicate.combinedMonthly)}<span className="text-xs text-muted-foreground">/mo together</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="size-3.5 text-emerald-500" /> No overlapping subscriptions. Nothing pays for the same service twice.
          </span>
        </EmptyNote>
      )}
    </Section>
  );
}
