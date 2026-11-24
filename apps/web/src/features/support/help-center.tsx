"use client";

import { ArrowRight, LifeBuoy, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HELP_SECTIONS, HELP_TOPICS, searchHelp } from "@/features/support/help-content";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

/** The public guide: every section visible, with an instant search box. */
export function HelpCenter() {
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchHelp(query, 8) : [];

  return (
    <div className="space-y-10">
      <div className="glass sticky top-16 z-10 rounded-xl border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the guide: receipts, transfers, payroll, export…"
            aria-label="Search the guide"
            className="ps-9 pe-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute end-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          {HELP_TOPICS.length} answers. Looking for something else?{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
            Write to the team
          </Link>
          .
        </p>
      </div>

      {query.trim() ? (
        <section aria-live="polite">
          <h2 className="font-semibold text-xl tracking-tight">
            {results.length === 0 ? `No answer for “${query.trim()}”` : `${results.length} ${results.length === 1 ? "answer" : "answers"} for “${query.trim()}”`}
          </h2>
          {results.length === 0 ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-border p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LifeBuoy className="size-4" aria-hidden /> We couldn't match that to the guide. A person can help.
              </p>
              <Button size="sm" render={<Link href="/contact" />}>
                Contact support <ArrowRight aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {results.map((topic) => (
                <TopicCard key={topic.id} topic={topic} section={topic.section} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <nav aria-label="Guide sections" className="hidden self-start lg:sticky lg:top-36 lg:block">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">On this page</p>
            <ul className="space-y-1 text-sm">
              {HELP_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-12">
            {HELP_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-semibold text-xl tracking-tight">{section.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{section.summary}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {section.topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, section }: { topic: (typeof HELP_SECTIONS)[number]["topics"][number]; section?: string }) {
  return (
    <article id={topic.id} className="glass scroll-mt-24 rounded-xl border p-4">
      {section && <p className="text-xs text-muted-foreground">{section}</p>}
      <h3 className="mt-0.5 font-medium">{topic.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{topic.answer}</p>
      {topic.steps && (
        <ol className="mt-2 list-decimal space-y-0.5 ps-5 text-sm text-muted-foreground">
          {topic.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {topic.href && (
        <Link href={topic.href} className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
          {topic.hrefLabel ?? "Open"} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </article>
  );
}
