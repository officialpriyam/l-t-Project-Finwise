"use client";

import { ArrowLeft, ArrowUpRight, BookOpen, MessageCircle, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useApp } from "@/features/app/app-context";
import { SupportForm } from "@/features/marketing/support-form";
import { HELP_TOPICS, SUGGESTED_QUESTIONS, searchHelp } from "@/features/support/help-content";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogDescription, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from "@/shared/ui/side-dialog";

/** A small, offline support agent: guide answers first, then the copilot or a human. */
export function SupportAgent() {
  const { me } = useApp();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"answers" | "contact">("answers");
  const [input, setInput] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [results, setResults] = useState<Array<(typeof HELP_TOPICS)[number]>>([]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) setView("answers");
  };

  const ask = (question: string) => {
    const query = question.trim();
    if (!query) return;
    setAsked(query);
    setResults(searchHelp(query, 3));
    setInput("");
    setView("answers");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed end-4 bottom-tab-bar z-40 mb-4 gap-2 rounded-full shadow-lg md:bottom-4"
        onClick={() => changeOpen(true)}
        aria-label="Open support agent"
        aria-expanded={open}
        aria-controls="finwise-support-agent"
      >
        <MessageCircle className="size-4.5" aria-hidden />
        <span className="hidden sm:inline">Need help?</span>
      </Button>

      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogPopup id="finwise-support-agent" className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Sparkles className="size-4" aria-hidden />
              </span>
              FinWise support
            </DialogTitle>
            <DialogDescription>Instant answers from the guide, then shortcuts to the copilot or a person. This agent does not read your ledger.</DialogDescription>
          </DialogHeader>
          <DialogPanel className="min-h-0 flex-1 space-y-4">
            {view === "contact" ? (
              <div className="space-y-4">
                <Button size="sm" variant="ghost" onClick={() => setView("answers")}>
                  <ArrowLeft aria-hidden /> Back to answers
                </Button>
                <SupportForm defaultName={me.user.name} defaultEmail={me.user.email} />
              </div>
            ) : (
              <>
                {!asked ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Ask how to use something. I’ll point you to the right guide answer.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_QUESTIONS.map((question) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() => ask(question)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3" aria-live="polite">
                    <p className="text-xs text-muted-foreground">For “{asked}”</p>
                    {results.length > 0 ? (
                      results.map((topic) => (
                        <article key={topic.id} className="rounded-xl border border-border p-3.5">
                          <p className="text-[11px] text-muted-foreground">{topic.section}</p>
                          <h2 className="mt-0.5 text-sm font-medium">{topic.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{topic.answer}</p>
                          {topic.steps && (
                            <ol className="mt-2 list-decimal space-y-0.5 ps-4 text-sm text-muted-foreground">
                              {topic.steps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          )}
                          {topic.href && (
                            <Link
                              href={topic.href}
                              onClick={() => setOpen(false)}
                              className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                            >
                              {topic.hrefLabel ?? "Open"} <ArrowUpRight className="size-3.5" aria-hidden />
                            </Link>
                          )}
                        </article>
                      ))
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/40 p-4">
                        <p className="text-sm font-medium">I couldn’t find that in the guide.</p>
                        <p className="mt-1 text-sm text-muted-foreground">Ask the copilot about your money, or write to the team for anything else.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" render={<Link href="/ai/copilot" />} onClick={() => setOpen(false)}>
                            <BookOpen aria-hidden /> Ask the copilot
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setView("contact")}>
                            Write to the team
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={submit} className="flex gap-2">
                  <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="How do I…" aria-label="Ask the support agent" maxLength={240} />
                  <Button type="submit" size="icon" aria-label="Send question" disabled={!input.trim()}>
                    <Send aria-hidden />
                  </Button>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                  <Link href="/help" className="underline underline-offset-4 hover:text-foreground" onClick={() => setOpen(false)}>
                    Browse all {HELP_TOPICS.length} answers
                  </Link>
                  <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setView("contact")}>
                    Contact support
                  </button>
                </div>
              </>
            )}
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </>
  );
}
