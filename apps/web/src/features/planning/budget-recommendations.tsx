"use client";

import { ArrowDownRight, ArrowUpRight, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/features/app/app-context";
import { CategoryTile, EmptyNote, Section } from "@/features/app/blocks";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/cn";
import { BudgetFormDialog } from "./budget-form";
import type { BudgetRecommendation, BudgetRecommendations } from "@/features/insights/types";

/** Suggested limits from the last few completed months, with one-click create. */
export function BudgetRecommendationsPanel({ data }: { data: BudgetRecommendations }) {
  const { money, canWrite } = useApp();
  const [chosen, setChosen] = useState<BudgetRecommendation | null>(null);

  if (!data.recommendations.length) {
    return (
      <Section title="Suggested budgets" hint="From your recent spending">
        <EmptyNote>Not enough spending history yet. Suggestions appear after a couple of months.</EmptyNote>
      </Section>
    );
  }

  return (
    <>
      <Section
        title="Suggested budgets"
        hint={data.methodology}
        actions={
          <span className="rounded-full bg-violet-500/12 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            <Sparkles className="me-1 inline size-3 align-[-2px]" />
            {money(data.totals.recommended)} a month
          </span>
        }
      >
        <p className="text-xs text-muted-foreground">
          {data.totals.count} categories · {data.totals.missing} without a budget · currently {money(data.totals.current)} budgeted in total.
        </p>
        <ul className="divide-y divide-border">
          {data.recommendations.slice(0, 10).map((recommendation) => {
            const increase = recommendation.currentBudget === null ? null : recommendation.recommended - recommendation.currentBudget;
            return (
              <li key={recommendation.categoryId} className="flex flex-wrap items-center gap-3 py-2 sm:flex-nowrap">
                <CategoryTile icon={recommendation.icon} color={recommendation.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{recommendation.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {recommendation.rationale} Spent {money(recommendation.average)} on average.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">{money(recommendation.recommended)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  {recommendation.currentBudget === null ? (
                    <p className="text-[11px] text-muted-foreground">no budget</p>
                  ) : (
                    <p className={cn("flex items-center justify-end gap-0.5 text-[11px] tabular-nums", increase !== null && increase > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                      {increase !== null && increase > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {money(Math.abs(increase ?? 0))} vs {money(recommendation.currentBudget)} now
                    </p>
                  )}
                </div>
                {canWrite && recommendation.currentBudget === null && (
                  <Button size="xs" variant="outline" onClick={() => setChosen(recommendation)}>
                    <Wand2 className="size-3" /> Use
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-muted-foreground">Suggestions cover the {data.months} completed months before this one; the current month is excluded.</p>
      </Section>

      <BudgetFormDialog
        open={chosen !== null}
        onOpenChange={(open) => !open && setChosen(null)}
        initial={chosen ? { categoryId: chosen.categoryId, amount: chosen.recommended } : null}
        onSaved={() => setChosen(null)}
      />
    </>
  );
}
