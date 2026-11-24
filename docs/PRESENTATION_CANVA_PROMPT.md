# Canva AI presentation prompt

Copy the prompt below into **Canva → Create a design → Presentation → Magic Design / Canva AI** (wording varies by Canva version), then attach or upload the FinWise screenshots listed in the prompt.

---

```text
Create a polished 16:9 presentation for a college product presentation named “FinWise — personal and business money in one ledger.” It must feel like a modern fintech product, not a generic school report. The spoken presentation is under 15 minutes, so keep each slide visual, short and confident. Do not invent adoption numbers, revenue, customer counts, security certifications or unsupported technical claims.

BRAND AND VISUAL STYLE
- Product name: FinWise. Tagline: “Capture → Connect → Understand → Act.”
- Message: “The ledger is the source of truth. AI does the typing; people decide.”
- Palette: near-black navy #0B1020, off-white #F8FAFC, violet #8B5CF6, sky blue #0EA5E9, emerald #10B981, amber #F59E0B. Use tints and gradients sparingly.
- Typography: Geist or Inter for headings and body; a clean monospace for small labels and code.
- Layout: generous whitespace, rounded cards, thin borders, soft glass effects, one clear focal point per slide. Use diagrams and real product screenshots instead of paragraphs.
- Footer on every content slide: “FinWise” on the left and slide number on the right.
- Never put passwords, API keys, database URLs or real financial data on a slide.

CONTENT — EXACTLY 14 SLIDES

SLIDE 1 — TITLE
On-slide:
“FinWise”
“Personal and business money in one ledger.”
“Capture → Connect → Understand → Act”
Visual: large FinWise wordmark with a subtle wallet/ledger motif, a dark navy gradient and three floating glass cards labeled Capture, Understand, Act. Presenter: Ananya.

SLIDE 2 — THE PROBLEM
On-slide:
“Your life is not split into ‘personal’ and ‘business’.”
“Salary + client payments. Netflix + AWS. Home loan + SME loan.”
Visual: split screen showing scattered spreadsheets, bank SMS, receipts and finance apps, all pointing toward one messy centre. No stock-photo business handshakes. Presenter: Ananya.

SLIDE 3 — OUR PRINCIPLE
On-slide:
“The ledger is the source of truth.”
“AI extracts, classifies, suggests and explains.”
“Nothing posts until a person confirms it.”
Visual: a three-step pipeline — AI draft → human review → double-entry ledger — with a clear shield on the confirmation step. Presenter: Ananya.

SLIDE 4 — PRODUCT OVERVIEW
On-slide:
“One product, one honest picture.”
“Cash • spending • goals • bills • net worth • business”
Visual: use docs/screenshots/dashboard.webp inside a large browser-style frame. Add three small callouts: “Every number links to its records”, “Personal and business workspaces”, “Built for real-world money.” Presenter: Kriti.

SLIDE 5 — CAPTURE ANYTHING
On-slide:
“Receipt. Screenshot. SMS. Voice. Plain language.”
“AI reads it. You confirm it.”
Visual: four input icons flowing into one editable transaction draft, then a green Confirm button. Use a sample entry like “lunch 250 from bKash,” not a real receipt. Presenter: Kriti.

SLIDE 6 — CONNECT AND AUTOMATE
On-slide:
“Banks • mobile wallets • cards • CSV / Excel / PDF”
“REST API • webhooks • MCP for AI agents”
Visual: a central ledger connected to bKash/Nagad, bank, card, Stripe, spreadsheet and developer API nodes. Emphasise encrypted credentials and safe duplicate detection. Presenter: Kriti.

SLIDE 7 — UNDERSTAND AND ACT
On-slide:
“Know what changed. Know what is due. Know what is left.”
“Budgets • goals • subscriptions • reports • 90-day forecast”
Visual: three clean metric cards with small illustrative charts: spending vs budget, upcoming renewals, and cash-flow forecast. Use only labels and sample values; do not claim real results. Presenter: Kriti.

SLIDE 8 — BUSINESS BOOKS
On-slide:
“A company workspace that stays separate.”
“Projects • revenue • payroll • receivables • profit and loss”
Visual: use docs/screenshots/business-dashboard.webp or docs/screenshots/projects.webp with callouts for project profit, burn/runway, payroll and invoices. Presenter: Divyanshu.

SLIDE 9 — AI INBOX AND COPILOT
On-slide:
“Ask your books a question.”
“Answers come from the ledger, not from guesswork.”
“Drafts, duplicates, recurring charges and anomalies all need a decision.”
Visual: split panel — a copilot chat asking “How much did I spend on food last month?” and an AI Inbox list with evidence badges and Confirm/Dismiss controls. Presenter: Divyanshu.

SLIDE 10 — TRUST, SECURITY AND ARCHITECTURE
On-slide:
“Double-entry ledger. Integer money. Original currency preserved.”
“Audit trail on every change. Encrypted secrets. Role-based access.”
Visual: a simple architecture diagram with Browser / Next.js web → NestJS API + worker → PostgreSQL, plus small shields for encryption, roles and audit. Presenter: Divyanshu.

SLIDE 11 — LIVE DEMO
On-slide:
“The loop in 90 seconds”
“1 Capture  2 Confirm  3 Ask  4 Understand”
Visual: four numbered frames from the live demo: capture entry, confirm draft, ask the copilot, open the linked report. Leave space for the presenter to switch to the live product. Presenter: Priyam.

SLIDE 12 — PLANS, SELF-HOSTING AND DEPLOYMENT
On-slide:
“Free to start. Own your data.”
“Self-host with Docker, use Neon/PostgreSQL, or deploy web on Vercel + API on a long-running host.”
“Bring your own AI provider.”
Visual: three deployment cards — Docker, Vercel web + external API, and self-hosted/local model. Do not show a specific price unless it is supplied separately. Presenter: Priyam.

SLIDE 13 — TEAM AND ROADMAP
On-slide:
“Built by”
“Ananya • Kriti • Divyanshu • Priyam”
“Next: more connectors, richer forecasting, and a safer agent workflow.”
Visual: four equal team cards with initials, plus a short three-step roadmap arrow. Do not assign invented job titles. Presenter: Priyam.

SLIDE 14 — CLOSE
On-slide:
“FinWise”
“Your money. Your books. Your say.”
“Capture → Connect → Understand → Act”
“Thank you — questions?”
Visual: return to the dark navy brand background, large wordmark, small glass product collage, and the four presenter names. Presenter: Priyam.

IMPORTANT DESIGN NOTES
- Use the supplied product screenshots as the hero images. If a screenshot is unavailable, create a simplified UI mockup rather than a fabricated chart with “real” results.
- Keep body text at 20pt or larger and headings at 30pt or larger.
- Use at most five bullets on any slide; prefer three.
- Make the financial-control story visible on slides 3, 5, 9 and 10.
- Keep the final slide strong and minimal for the Q&A handoff.
- Put concise presenter cues in slide notes, not on the slide.
```

---

## Recommended images to attach

From the repository's `docs/screenshots/` folder:

- `dashboard.webp` — slide 4
- `inbox.webp` — slide 9
- `business-dashboard.webp` or `projects.webp` — slide 8
- `transactions.webp` — slide 11 if a live demo is not available
- `forecast.webp` — slide 7 if a chart placeholder is not enough

## Before presenting

- Replace any sample numbers with the current demo data.
- Rehearse to **13:30**, leaving a full minute for Q&A before the 15-minute limit.
- Check that screenshots do not show private account details or secrets.
- If Canva changes the number of slides, keep the order and merge only the roadmap into the closing slide.
