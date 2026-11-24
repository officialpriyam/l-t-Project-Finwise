# FinWise user guide

**FinWise is a personal and business financial operating system.** It keeps one honest ledger for your household and your company, from the receipt in your pocket to the payroll at the end of the month.

The product loop is:

> **Capture → Connect → Understand → Act**

The rule behind everything:

> **The ledger is the source of truth.** AI extracts, classifies, suggests and explains. It never quietly becomes the record.

This guide is for people using the app. Developers and self-hosters should also read [deployment](deploy.md) and the repository [README](../README.md). The same help is available inside the product at `/help` and in the support agent at the bottom-right of every signed-in screen.

---

## 1. Before you start

### Create an account

1. Open the landing page and choose **Start free**.
2. Create an account with your name, email and a strong password. Verify your email if the installation requires it.
3. Pick your country and currency on the landing page first if you want FinWise to pre-fill them during setup. Your choice is stored as a cookie on this device.
4. On the setup screen, confirm:
   - **Base currency** — the currency totals and reports use.
   - **Timezone** — what “today” means for due dates, reminders and reports.
   - **Business books** — keep a separate business workspace, or remove it if you only need personal books.
5. Start using FinWise. You can change all three choices later in **Settings → Workspace**.

### Understand the free plan

The free plan is designed to be usable, not a timed demo: a personal and a business workspace, transactions and receipts, core planning features, and a monthly AI allowance. The pricing page shows the exact limits configured for the installation. You can upgrade, downgrade or cancel from **Settings → Billing**.

### Move around

- **Sidebar** — your main navigation on desktop.
- **Bottom bar** — Overview, Activity, Inbox and the add button on mobile.
- **Command palette** — press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac), then search for a screen or start a transaction.
- **Workspace menu** — switch between personal and business books.
- **Support agent** — the floating **Need help?** button opens instant guide answers, the copilot and a message form.

---

## 2. Your first ten minutes

### Step 1 — Add an account

Go to **Accounts** and add where your money sits:

- bank account
- cash
- mobile wallet such as bKash, Nagad or Rocket
- credit or debit card
- digital wallet such as PayPal, Wise or Payoneer
- payment processor such as Stripe
- savings, loan or investment account
- crypto wallet or anything else

Give the account a name, choose its currency, and enter the opening balance as of today. Use the opening balance to make FinWise match the balance you already have; it is a starting point, not a guess.

### Step 2 — Record one transaction

Open **Capture**, or press **Ctrl+K / Cmd+K → Add transaction**.

Type a plain-language line such as:

- `lunch 250 cash`
- `office rent 15000 bkash e dilam`
- `gotokal bazar 1200 cash e`
- `received 50000 from client for website`

Or attach a receipt, screenshot, bank SMS or statement. Check the draft, fix anything that looks wrong, and **confirm**. Confirming is the moment it reaches the ledger.

### Step 3 — Look at the overview

The overview answers three questions:

- **What do I have?** Cash, accounts, assets and net worth.
- **What happened?** Income, spending, transfers and recent activity.
- **What needs attention?** AI Inbox items, upcoming bills, budgets and goals.

Every important number links to the records behind it. If a total looks surprising, click it.

---

## 3. Capture money

FinWise accepts the ways money messages already reach you.

### Receipts and screenshots

1. Open **Capture** (`/capture`).
2. Add a photo, screenshot or PDF.
3. The AI proposes merchant, amount, currency, date and category.
4. Confirm the fields and the account, then save.

Low-confidence fields are marked. Review them carefully. An AI reading is a draft; your confirmation is the record.

### Bank SMS and plain text

Paste the message instead of copying its fields one by one. FinWise understands English, Bangla and Banglish, including mixed-script entries such as `bkash e 1500 khoroch`.

### Voice notes

Use the microphone in Capture and speak the entry. The note is transcribed into the same editable draft. Voice is a shortcut, not a separate ledger path.

### AI Inbox

Open **AI Inbox** (`/ai/inbox`) for everything waiting for a person:

- captured drafts
- items that need a category or account
- recurring-charge suggestions
- possible duplicates
- unusual spending
- other evidence-backed notices

Confirm, correct or dismiss an item. Nothing in the inbox posts by itself.

---

## 4. The ledger

### Accounts

An account is a container for money. Open one from **Accounts** (`/accounts`) to see its balance, recent transactions, attachments and reconciliation history.

### Transaction types

Choose the type that matches what actually happened:

| Type | Use it for | Effect on profit and loss |
|---|---|---|
| **Expense** | Food, rent, software, travel, bills | Reduces profit |
| **Income** | Salary, sales, interest, refunds received as income | Increases profit |
| **Transfer** | Moving money between your own accounts | None |
| **Refund** | Money returned to you | Reverses an earlier expense |
| **Adjustment** | A deliberate correction | Depends on the entry |
| **Investment** | Buying or selling an investment | Not ordinary income/expense |
| **Asset purchase** | Property, equipment, a vehicle | Not ordinary income/expense |
| **Debt payment** | Repaying a loan or card | Reduces what you owe |
| **Loan** | Money borrowed | Increases what you owe |
| **Equity** | Owner money put into or taken from a business | Not ordinary income/expense |

A transfer between two of your own accounts is **not spending**. An investment is **not income**. Choosing the right type keeps reports honest.

### Transfers

Go to **Transfers** (`/transfers`):

1. Choose the account money leaves.
2. Choose the account it arrives in.
3. Enter the amount and date.
4. If the currencies differ, enter the exchange rate you actually received.
5. Confirm.

Both sides are recorded together, so neither account drifts from reality.

### Edit, delete and void

Open a transaction from **Activity** (`/transactions`):

- **Edit** fixes the fields and rewrites its ledger entries in one operation.
- **Delete** removes a draft. A posted transaction is voided instead, so the audit trail still explains what happened.
- **Attach** adds proof such as a receipt or statement.

Do not create a manual reversing expense when a transfer, refund or void is the right tool.

### Multi-currency

Every transaction preserves three views:

1. the **original amount and currency** you received or paid;
2. the **account amount** in the account's currency;
3. the **base amount** in the workspace's reporting currency, with the exchange rate used.

The original currency is never overwritten. Manage rates in **Settings → Currency** (`/settings/currency`).

### Reconcile an account

Open an account and choose **Reconcile**. Enter the statement balance and the date, compare it with FinWise's book balance, and review the difference. If you allow an adjustment, FinWise creates a visible adjustment entry rather than silently forcing the numbers to match.

---

## 5. AI and the copilot

### Ask the copilot

Open **Copilot** (`/ai/copilot`) and ask in plain language:

- “How much did I spend on food last month?”
- “What were my biggest expenses this quarter?”
- “Who owes me money?”
- “Show business revenue by project.”
- “Can I afford a 40,000 laptop next month?”

The copilot reads through workspace-scoped queries and shows figures from your ledger. It does not invent records outside those queries.

### Ask it to prepare a change

Examples:

- “Record lunch for 250 from bKash.”
- “Create a monthly budget of 8,000 for food.”
- “Mark the internet bill as paid.”

In chat, a proposed change is stored on the message and only applied when a member confirms it. **Viewers cannot run write actions.**

### What the AI sees

It receives only what the task needs: a file you captured, or the ledger figures needed for your question. Credentials and unrelated data are not part of the prompt. Owners and admins can switch AI off for a workspace in **Settings → AI** (`/settings/ai`). The built-in parser and rules still work.

### AI credits

Every model call consumes credits:

1. the plan's monthly allowance is used first;
2. purchased credit packs are used next;
3. when neither remains, the app explains the limit and capture falls back to local parsing.

View usage and plan details in **Settings → Billing** (`/settings/billing`). Credit packs do not expire.

### Insights and forecasts

- **Insights** (`/ai/insights`) explain what changed, which segments or anomalies deserve attention, and point back to the transactions.
- **Forecasts** (`/ai/forecasts`) project cash flow using history and scheduled commitments.
- A forecast is a projection, not a promise. Update balances and commitments when circumstances change.

---

## 6. Budgets, goals, bills and commitments

### Budgets

Open **Budgets** (`/budgets`) and set a limit for a category:

- monthly
- quarterly
- yearly
- total for a chosen period

FinWise compares the limit with actual spending and warns you before you cross it. Use **Activity** to see which transactions make up the total.

### Savings goals and dream purchases

Open **Goals** (`/goals`):

- **Savings goals** — a target amount and target date.
- **Savings plans** — the monthly amount required to get there.
- **Dream assets** — a purchase you are saving toward, such as a laptop or a trip.

The progress and required contribution update as you move money toward the goal.

### Subscriptions and bills

Open **Subscriptions** (`/subscriptions`) and add recurring services: Netflix, internet, domains, rent or insurance. FinWise:

- reminds you before renewal;
- keeps a renewal history;
- spots price changes;
- lets you mark a bill paid in one tap;
- protects against marking the same period paid twice.

### Commitments

Open **Commitments** (`/commitments`) for salary, payroll, rent, loan installments, tax, utilities and other obligations. Commitments feed the payment calendar and cash-flow forecast. Keep them current; a forecast is only as honest as its schedule.

---

## 7. Business books

A business workspace keeps company money separate from personal money.

### Projects

Open **Business → Projects** (`/business/projects`) and create a project. Assign income and expenses to it to see:

- revenue
- cost by group
- budget use
- burn rate
- net contribution
- runway and capital invested where available

This answers “did that project actually make money?” rather than “did money arrive this month?”

### Revenue, invoices and receivables

Use **Business → Revenue** (`/business/revenue`) for sales by month, customer and project. Use **Wealth → Receivables** (`/wealth/receivables`) for invoices or loans owed to you. Record payment when it arrives; do not count an unpaid invoice as cash.

### Payroll

Open **Business → Payroll** (`/business/payroll`):

1. Add the people on the roster.
2. Record their salary and pay schedule.
3. Prepare a payroll run for the month.
4. Attach proof if required.
5. Post the run; its breakdown stays with the entry.

### Business reports

Open **Business → Reports** (`/business/reports`) for the company's profit and loss, revenue, costs and cash position. Personal reports remain in the personal workspace.

---

## 8. Wealth and net worth

### Assets

Open **Wealth → Assets** (`/wealth/assets`) for property, vehicles, gold and other things you own. Record valuations when you want the number refreshed.

### Investments

Open **Wealth → Investments** (`/wealth/investments`) for stocks, funds, crypto and other holdings. Track cost basis, quantities and valuations to see realised and unrealised gains and ROI.

### Liabilities

Open **Wealth → Liabilities** (`/wealth/liabilities`) for loans, mortgages and card balances you owe. Payments reduce the liability; interest is an expense.

### Receivables

Open **Wealth → Receivables** (`/wealth/receivables`) for money owed to you. The ageing view shows what is due and what is overdue.

### Net worth

Open **Wealth → Net worth** (`/wealth/net-worth`):

> **assets + investments + receivables − liabilities**

FinWise shows the history and warns you when accounts or valuations are missing, so you know whether the number is complete.

---

## 9. Reports, insights and export

### Reports

Open **Reports** (`/reports`) for:

- summary
- income and spending
- profit and loss
- cash-flow statement
- cash-flow forecast
- budgets and goals
- weekly, monthly and quarterly views

Every important number links to its records. Report narratives restate computed figures; they are not a second, independent set of books.

### Export your data

Go to **Settings → Data & account** (`/settings/account`) and download your records as JSON or CSV. No support request is needed. Keep exports private; they contain your financial history.

### Delete your account

From the same screen, export first if you want a copy, then delete the account. Shared workspaces remain for the other members; workspaces you own alone are deleted with the account.

---

## 10. Connect and automate

### Import a statement

Open **Integrations → Import** (`/integrations/import`):

1. Upload a CSV, Excel or supported PDF statement.
2. Map the file's columns to date, amount, description and account.
3. Preview the rows and fix the mapping.
4. Confirm the import.

Re-importing the same source is safe: duplicates are recognised through external identifiers.

### Connect an app or bank

Open **Integrations** (`/integrations`) and choose a configured provider or a custom REST connector. Credentials are encrypted and are not shown again after saving. Connections can be paused or disconnected at any time. **Sync history** shows what each run imported or skipped.

### API keys, webhooks and MCP

Open **Integrations → API** (`/integrations/api`):

- create a workspace key with only the scope it needs;
- use the REST API to read or write from your own software;
- subscribe a webhook to workspace events;
- connect an AI agent through MCP.

Keys follow plan limits, can be revoked immediately, and should be treated like passwords. Never put a key in browser code, a slide deck or a public repository.

### Idempotency

When your software calls the API, pass an `externalId` (and a connection id when relevant). FinWise recognises a retry instead of creating a duplicate transaction.

---

## 11. Teams and roles

### Invite someone

Go to **Settings → Workspace** (`/settings/workspace`). Owners and admins send an invitation to an email address. The invitee must accept from the verified address it was sent to; forwarding an invitation does not open the workspace.

### Roles

| Role | Can read | Can write | Can manage people/settings | Billing |
|---|---|---|---|---|
| **Owner** | Yes | Yes | Yes, including transfer and deletion | Yes |
| **Admin** | Yes | Yes | Yes | No |
| **Member** | Yes | Yes | No | No |
| **Viewer** | Yes | No | No | No |

A viewer can ask read-only questions in the copilot, but cannot make changes. Membership is per workspace: you may be an owner of your personal books and a viewer in someone else's company.

### Audit log

Open **Settings → Audit** (`/settings/audit`) to see who changed what, when, and the before/after values. Financial mutations record an audit event in the same database transaction as the change.

---

## 12. Settings, security and billing

### Workspace settings

**Settings → Workspace** contains:

- workspace name
- base currency
- timezone
- fiscal year start
- review threshold
- members and invitations

Only owners and admins can change these.

### Categories and rules

- **Settings → Categories** (`/settings/categories`) — organise income and expense categories.
- **Settings → Rules** (`/settings/rules`) — automate classification with rules you trust. A rule is an explicit policy, not an unexplained AI guess.

### Notifications and preferences

- **Settings → Notifications** (`/settings/notifications`) — choose which alerts matter.
- **Settings → Preferences** (`/settings/preferences`) — theme, number format and calendar.

### Account and security

- **Settings → Profile** (`/settings/profile`) — name and profile details.
- **Settings → Account** (`/settings/account`) — export and delete.
- **Settings → Security** (`/settings/security`) — two-factor authentication and active sessions.
- **Settings → AI** (`/settings/ai`) — provider, workspace AI controls and usage.

Turn on two-factor authentication for anything holding real financial data. Use a unique password and a password manager.

### Billing

**Settings → Billing** (`/settings/billing`) shows the owner's plan, invoices, usage and credit packs. Limits follow the workspace owner's plan. On a self-hosted installation with billing disabled, all features are allowed.

---

## 13. Admin console

The admin console is for **platform administrators**, not ordinary workspace admins. In development the first account becomes a platform admin; in production, access is limited to the emails configured in `ADMIN_EMAILS`.

Open `/admin` to manage:

- users and workspaces
- billing configuration
- AI providers and spend
- integrations and connector health
- storage (Cloudflare R2 or S3-compatible)
- jobs and schedules
- support messages
- installation-level audit log

Admin-level secrets are encrypted at rest and never returned to the browser. If you are not a platform admin, `/admin` is not where you manage your workspace — use **Settings**.

---

## 14. Mobile and desktop

### Phone

The web app is responsive. The bottom navigation keeps the core loop close to your thumb:

- **Overview**
- **Activity**
- **Inbox**
- **Add** — the central button opens capture choices and quick entry

### Windows desktop

The repository includes a Tauri 2 shell that loads a running FinWise web server in a native window. It contains no separate business logic and does not expose IPC to remote pages. Build/install instructions live in the repository README and package scripts.

---

## 15. Keyboard and quick reference

| Shortcut / place | Action |
|---|---|
| **Ctrl+K / Cmd+K** | Open the command palette |
| **Add** or **Capture** | New transaction, receipt, SMS or voice entry |
| `/` | Personal overview |
| `/transactions` | All transactions and filters |
| `/accounts` | Accounts and reconciliation |
| `/capture` | Capture money |
| `/ai/inbox` | Drafts and decisions waiting |
| `/ai/copilot` | Ask about your books |
| `/ai/insights` | Insights and evidence |
| `/budgets` | Spending limits |
| `/goals` | Savings and dream purchases |
| `/subscriptions` | Renewals and bills |
| `/commitments` | Regular obligations |
| `/business/projects` | Project profit |
| `/business/payroll` | Payroll runs |
| `/wealth/net-worth` | What you own minus what you owe |
| `/reports` | Reports and forecasts |
| `/integrations/import` | Import CSV, Excel or PDF |
| `/integrations/api` | API keys, webhooks and MCP |
| `/settings/workspace` | Currency, timezone and members |
| `/settings/account` | Export or delete |
| `/help` | Full written guide |
| **Need help?** | In-app support agent |

---

## 16. Common questions and troubleshooting

### My totals do not match my bank

Check for:

- a missing account or opening balance;
- an unconfirmed AI Inbox draft;
- a transfer recorded as an expense;
- a transaction in the wrong account;
- an outdated exchange rate;
- a statement that includes pending items your ledger does not.

Use **Reconcile** on the account and drill into every number from the overview or report.

### A captured amount or category is wrong

Edit the draft before confirming. If it is already posted, open the transaction and edit it. Repeated mistakes can be handled with an explicit rule in **Settings → Rules**.

### The copilot cannot change something

Check your role. Viewers are read-only. Also check that the workspace has AI enabled and the owner has credits remaining.

### I cannot sign in on a preview deployment

FinWise authentication is pinned to the browser-facing `APP_URL`. Preview deployments use a different origin, so use the production domain to sign in. This is intentional, not a broken cookie.

### My support message needs a reference

After sending a message, the form shows a reference such as `SUP-…`. Keep it if the team asks about the conversation.

### I want my data out

**Settings → Data & account → Export**. JSON is the complete structured copy; CSV is easier to open in a spreadsheet.

### I want a feature that is not here

Use **Help & support** in the app or the public **Contact** page. Include the screen, what you expected, and what happened. Never include passwords, API keys or full bank statements unless the team explicitly asks through a secure channel.

---

## 17. Self-hosting and deployment in one page

The web, API and database are separate processes.

- **Web** — Next.js, port 3100. It can be hosted on Vercel.
- **API** — NestJS, port 4100. It must run on a long-lived host such as Render, Railway, Fly or Docker.
- **Worker** — runs jobs and schedules; it can run inside the API process or as a second service.
- **Database** — PostgreSQL. Local embedded PostgreSQL or Docker works for development; Neon or another managed PostgreSQL works for production.

Vercel cannot run the API or worker because they hold long-lived database pools and job loops. Put the Next.js web on Vercel, host the API separately, and point `API_INTERNAL_URL` at the API's public HTTPS origin with **no `/api` suffix**. Set `APP_URL` to the public web origin on both sides. Do not send database passwords or AI keys to Vercel.

The full checklist is in [docs/deploy.md](deploy.md).

---

## 18. Glossary

- **Base currency** — the currency workspace totals and reports use.
- **Ledger** — the double-entry record of every financial event.
- **Draft** — a proposed transaction that has not posted yet.
- **Workspace** — an isolated set of books, people and settings.
- **Commitment** — a scheduled obligation such as rent, salary or a loan payment.
- **Receivable** — money owed to you.
- **Liability** — money you owe.
- **Net worth** — assets, investments and receivables minus liabilities.
- **Credit** — the unit consumed by an AI model call.
- **Webhook** — an event sent to your own server when something changes.
- **MCP** — a protocol that lets another AI agent use FinWise through scoped tools.
