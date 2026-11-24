# FinWise presentation script — 13:30 + 1:00 Q&A

**Team:** Ananya, Kriti, Divyanshu, Priyam

**Total:** 13 minutes 30 seconds of prepared material, then 1 minute for questions — **14:30 maximum**.

**Deck:** 14 slides, generated with `docs/PRESENTATION_CANVA_PROMPT.md`.

The goal is not to explain every screen. It is to make the audience remember one idea:

> **FinWise keeps personal and business money in one honest ledger. AI does the typing; people decide.**

---

## Timing map

| Speaker | Slides | Prepared time | Handoff |
|---|---|---:|---|
| **Ananya** | 1–3 | 0:00–2:40 | Problem → principle → product |
| **Kriti** | 4–7 | 2:40–6:30 | Everyday loop: capture, connect, understand |
| **Divyanshu** | 8–10 | 6:30–9:50 | Business, AI and trust |
| **Priyam** | 11–14 | 9:50–13:30 | Live demo, deployment, team, close |
| **All** | Q&A | 13:30–14:30 | Questions |

**Hard stop:** 14:30. If the room starts late, skip the roadmap sentence on slide 13; do not cut the principle on slide 3 or the demo confirmation on slide 11.

---

## Before the presentation

### Rehearsal checklist

- Each speaker rehearses their section **twice out loud**, not just by reading.
- Keep the deck on the presenting laptop and a PDF copy on a USB drive.
- Open the product and sign in before the audience arrives.
- Put the browser in a clean window, hide bookmarks, and close notification pop-ups.
- Test the projector resolution and make sure small UI text is legible.
- Assign one person to advance slides; the speakers should not fight with the keyboard.
- Do a full timed run. Target **12:45–13:15** so there is margin.

### Demo checklist

Use a demo workspace, never a real customer's data. If the seeded demo account is available:

- Email: `demo@finwise.app`
- Password: `demo-finwise`
- Do not put the credentials on a slide.

Prepare these screens in separate tabs:

1. `/capture`
2. `/ai/inbox`
3. `/ai/copilot`
4. `/transactions`
5. `/reports`

If the live demo fails, show `docs/screenshots/transactions.webp` and `docs/screenshots/inbox.webp` on slide 11 and narrate the same four steps. Do not spend the presentation debugging.

---

# Ananya — slides 1–3 (0:00–2:40)

**Role in the story:** establish the problem and the promise. Keep this calm and confident; do not read the slide.

## Slide 1 — Title (0:00–0:30)

**On screen:** FinWise — personal and business money in one ledger.

**Say:**

> “Good [morning/afternoon], everyone. We are Ananya, Kriti, Divyanshu and Priyam, and this is FinWise: personal and business money in one ledger.”

**Do:** Face the audience, pause after the name, then move to slide 2.

**Transition:**

> “We built it because real financial life does not fit neatly into one app.”

---

## Slide 2 — The problem (0:30–1:35)

**On screen:** Salary + client payments. Netflix + AWS. Home loan + SME loan.

**Say:**

> “Most of us live in both worlds. We have a salary, but also a freelance payment. We pay a home bill, but also software for a small business. Today that information is split across bank SMS, receipts, spreadsheets and separate budgeting apps.
>
> A personal app misses the business. Accounting software is too heavy for everyday life. And many AI finance tools give you a number you cannot trace back to a real transaction.
>
> We wanted one place that understands both sides — without turning the AI into the accountant.”

**Do:** Point to the scattered inputs once, then to the messy centre. Do not list every feature.

**Transition:**

> “That gave us one non-negotiable design rule.”

---

## Slide 3 — The principle (1:35–2:40)

**On screen:** The ledger is the source of truth. AI drafts; people decide.

**Say:**

> “Our rule is simple: the ledger is the source of truth.
>
> AI can read a receipt, suggest a category, explain a trend or prepare a change. But it cannot quietly become the record. Nothing posts until a person confirms it.
>
> Under that, FinWise uses a real double-entry ledger, integer money and the original currency on every transaction. Every important number links back to the records that created it.
>
> So the promise is not ‘AI runs your finances.’ It is ‘AI removes the typing, while you keep control.’”

**Do:** Trace the three boxes: AI draft → human review → ledger. Let the final sentence land.

**Transition to Kriti:**

> “With that trust model in place, let us show you the everyday loop. Kriti?”

---

# Kriti — slides 4–7 (2:40–6:30)

**Role in the story:** show the normal user's day. Use concrete examples, not feature lists.

## Slide 4 — Product overview (2:40–3:35)

**On screen:** Dashboard screenshot.

**Say:**

> “This is the personal overview. At the top you see the answers people usually open a finance app for: what they have, what came in, what went out, and what needs attention.
>
> The important part is not just the chart. Every figure is clickable. If a spending number looks wrong, we can open the transactions behind it instead of trusting a black box.
>
> The workspace menu switches to a separate business set of books, so company data never gets mixed into household totals.”

**Do:** Point to one number and its drill-down link. Keep the pointer still; do not circle the whole screen.

**Transition:**

> “Now let us start where every useful ledger starts: one transaction.”

---

## Slide 5 — Capture anything (3:35–5:00)

**On screen:** Receipt, screenshot, SMS, voice and plain language → draft → confirm.

**Say:**

> “FinWise accepts money information in the form it already arrives.
>
> I can photograph a receipt, upload a bank statement, paste a bKash SMS, or just type ‘lunch 250 cash’. Bangla and Banglish work too — for example, ‘gotokal bazar 1200 cash e’.
>
> The AI turns that into an editable draft. I check the amount, the account and the category, and then I confirm. That confirmation is the moment it enters the ledger.
>
> The AI Inbox holds the same kind of decisions: captured drafts, possible duplicates, recurring charges and unusual spending. Nothing there posts by itself.”

**Do:** Use your hand to show the four inputs converging. Stress **confirm**.

**Transition:**

> “Capture handles the first entry. Connect handles the hundreds that follow.”

---

## Slide 6 — Connect and automate (5:00–5:45)

**On screen:** Accounts, wallets, imports, API, webhooks and MCP around the ledger.

**Say:**

> “You can add bank accounts, cash, cards and mobile wallets, then import CSV, Excel or PDF statements with a column-mapping preview.
>
> Connections pull transactions automatically, and duplicates are recognised on re-import. Credentials are encrypted and never shown again.
>
> For developers, the same workspace exposes a scoped REST API, signed webhooks and an MCP server, so an AI agent can use the books without loose database access.”

**Do:** Point to import first because it is familiar; mention API/MCP as the developer extension.

**Transition:**

> “Once the data is in, the useful question is not ‘where did I type it?’ It is ‘what does it mean?’”

---

## Slide 7 — Understand and act (5:45–6:30)

**On screen:** Budgets, goals, subscriptions, reports and forecast.

**Say:**

> “FinWise turns the ledger into decisions: budgets warn before overspending, goals show the monthly amount needed, subscriptions remind you before renewal, and reports show cash flow and profit and loss.
>
> The forecast uses actual commitments, so rent and loan payments are not invisible.
>
> The point is a short loop: capture, connect, understand, then act — pay on time, stay on budget, or reach a goal.”

**Do:** Point to one card per phrase. Do not explain all planning screens.

**Transition to Divyanshu:**

> “That loop works for a household. Divyanshu will show what changes when the workspace is a business.”

---

# Divyanshu — slides 8–10 (6:30–9:50)

**Role in the story:** prove business depth, explain AI safely, and close with trust and architecture.

## Slide 8 — Business books (6:30–7:45)

**On screen:** Business dashboard or projects screenshot.

**Say:**

> “A business workspace keeps company money separate from personal money.
>
> Projects connect revenue and cost to the job that created them, so we can see whether a project actually made money. Revenue can be broken down by customer and project. Receivables show who owes us and what is overdue.
>
> Payroll keeps the roster, salary schedule and each month's payment together, with proof attached.
>
> The business reports then answer the familiar questions: revenue, costs, profit and loss, burn and cash position — without contaminating the personal books.”

**Do:** Point to project profit and receivables, the two features that distinguish FinWise from a basic expense tracker.

**Transition:**

> “Business data makes the AI more useful, but also raises the standard for how it is allowed to behave.”

---

## Slide 9 — AI Inbox and copilot (7:45–8:55)

**On screen:** Copilot question + evidence; AI Inbox decisions.

**Say:**

> “The copilot answers from the workspace's ledger through scoped read queries. I can ask ‘How much did we spend on AI tools this quarter?’ and get a figure tied to real records.
>
> It can also prepare a change — for example, recording lunch for 250 from bKash — but in chat it waits for a member to confirm. Viewers are read-only.
>
> The Inbox is the review surface for drafts, duplicates, recurring charges and anomalies. Each item carries evidence. The AI reduces typing; it does not get the final vote.”

**Do:** Contrast **answer** and **change**. Stress that the agent does not run raw SQL from the model.

**Transition:**

> “That control is deliberate. Here is how we enforce it.”

---

## Slide 10 — Trust, security and architecture (8:55–9:50)

**On screen:** Double-entry, integer money, audit, encryption, roles; architecture diagram.

**Say:**

> “Every financial change goes through a domain service and a database transaction. The ledger change and its audit event happen together.
>
> Money is stored as integer minor units, never floating-point arithmetic. A foreign transaction keeps its original amount and currency, the account amount, and the base amount with the rate used.
>
> Integration and provider secrets are encrypted. Workspace roles separate owner, admin, member and viewer access.
>
> Architecturally, the Next.js web talks to a NestJS API and worker, backed by PostgreSQL. That separation is also what makes self-hosting and controlled deployment possible.”

**Do:** Follow the architecture arrows once. Do not read every label.

**Transition to Priyam:**

> “The fastest way to understand the product is to watch the loop happen. Priyam?”

---

# Priyam — slides 11–14 (9:50–13:30)

**Role in the story:** demonstrate, explain how to get it, introduce the team and close cleanly.

## Slide 11 — Live demo (9:50–11:50)

**On screen:** “The loop in 90 seconds — Capture, Confirm, Ask, Understand.”

### Demo actions

1. Open **Capture**.
2. Type `lunch 250 cash` and generate the draft.
3. Point to the parsed amount and category. **Confirm** it.
4. Open **Activity** and show the new row.
5. Open **Copilot** and ask `How much did I spend on food last month?`
6. Point to the answer's linked records.
7. Open the related report or budget and show the updated total.

### Say while doing it

> “I will type an expense the way I would say it: ‘lunch 250 cash’.”

*[Generate the draft.]*

> “The AI proposed the amount, account and category. I can correct any field. When I press Confirm, it posts.”

*[Confirm and show Activity.]*

> “Now I ask the copilot a question in ordinary language: ‘How much did I spend on food last month?’ It answers from the ledger.”

*[Show the answer and a linked record.]*

> “And because every number links back, I can verify the result instead of taking the AI's word for it. That is the complete loop: capture, confirm, ask, understand.”

**Fallback if the demo fails after 20 seconds:**

> “The live environment is not cooperating, so I will use the recorded screens.”

Switch to the transaction and inbox screenshots and narrate the same four steps. Do not troubleshoot on stage.

**Transition:**

> “FinWise is free to start, self-hostable, and deployable in a normal production stack.”

---

## Slide 12 — Plans and deployment (11:50–12:35)

**On screen:** Free to start; own your data; Docker / Vercel + API / bring your own AI.

**Say:**

> “The free plan includes the core personal and business workflow, with limits for larger teams, storage and AI usage.
>
> You can self-host with Docker and PostgreSQL, or use a managed database such as Neon. The Next.js web can run on Vercel, while the API and worker stay on a long-running host because they hold database pools and job loops.
>
> You can also bring your own AI provider, including local models through Ollama. Your data can be exported as JSON or CSV at any time.”

**Do:** Mention deployment architecture briefly; do not turn this into a dev-ops lecture.

**Transition:**

> “This is the work our team put together, and where we want to take it next.”

---

## Slide 13 — Team and roadmap (12:35–13:05)

**On screen:** Ananya • Kriti • Divyanshu • Priyam; roadmap.

**Say:**

> “We built FinWise as a team: Ananya, Kriti, Divyanshu and Priyam.
>
> The next steps are more connectors, richer forecasting, and a safer agent workflow that proposes more work while keeping confirmation visible.
>
> The foundation is already the important part: an honest ledger, clear roles, and AI that knows its place.”

**Do:** Let the four names appear. If time is short, omit the roadmap sentence.

**Transition:**

> “One final idea to take away.”

---

## Slide 14 — Close (13:05–13:30)

**On screen:** “Your money. Your books. Your say.” Thank you — questions?

**Say:**

> “FinWise is one place for personal and business money, built around a simple promise: your money, your books, your say.
>
> Capture, connect, understand and act — without giving up control of the record.
>
> Thank you. We are happy to take your questions.”

**Do:** Stop. Do not add a feature list after the close. Hand the screen to Q&A.

---

# Q&A — all four speakers (13:30–14:30)

## How to answer

- **Ananya:** product problem, positioning, user experience.
- **Kriti:** capture, ledger, budgets, goals, everyday workflow.
- **Divyanshu:** AI behaviour, security, architecture, integrations.
- **Priyam:** demo, deployment, roadmap, team coordination.

Answer in **20–30 seconds**. If a question needs a screen, say:

> “We can show that right after the talk.”

If you do not know:

> “That is a good question. We have not implemented or tested that yet, so I do not want to guess.”

## Prepared answers

### “How is this different from a normal expense tracker?”

> “An expense tracker mainly tells you what you spent. FinWise keeps a double-entry ledger, separates personal and business workspaces, and connects spending to projects, payroll, wealth, reports and forecasts. AI is layered on top, but it is never the record.”

### “Can the AI make a wrong transaction?”

> “It can misread a receipt or suggest the wrong category. That is why it creates a draft, shows low-confidence fields, and requires confirmation. After posting, edits and voids are audited.”

### “Does it work with bKash or local banks?”

> “It has mobile-wallet account types and supports imports and a provider-neutral connector framework. A specific live bank connection depends on the connectors configured for the installation; CSV, Excel and PDF imports work without a bank integration.”

### “Is it open source and self-hostable?”

> “Yes. The repository includes the web, API, worker, database migrations and Docker deployment. You can self-host with PostgreSQL and bring your own AI provider.”

### “Why not put everything on Vercel?”

> “Vercel hosts the Next.js web. The API and worker need long-lived processes for database pools, jobs and schedules, so they run on a separate long-lived host. Both use the same database and a public HTTPS connection.”

### “What happens if AI credits run out?”

> “The app uses the plan's allowance first, then purchased packs. When credits run out, it explains the limit and capture falls back to the built-in parser and rules.”

### “Can an accountant see the books without editing?”

> “Yes. Invite them as a viewer in that workspace. They can read and export, but every write route blocks them.”

### “What is the most important next step?”

> “More connectors and a richer confirmation workflow for agent actions — while keeping the ledger, evidence and audit trail at the centre.”

---

## Recovery plan

| Problem | What to do |
|---|---|
| Speaker runs long | Skip slide 13's roadmap sentence; keep slide 3 and the demo confirmation |
| Demo does not load | Use the recorded screenshots after 20 seconds |
| Projector text too small | Narrate the focal point; do not read the UI |
| Question becomes a debate | Summarise the trade-off in one sentence and offer to continue after the talk |
| Internet drops | Continue from the local deck and screenshots; no live dependency is required |
