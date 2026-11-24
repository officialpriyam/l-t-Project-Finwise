// One guide, two readers: the public /help page and the in-app support agent.
// Keep answers short and link to the screen where the work happens.

export type HelpTopic = {
  id: string;
  title: string;
  answer: string;
  steps?: string[];
  href?: string;
  hrefLabel?: string;
  keywords: string[];
};

export type HelpSection = {
  id: string;
  title: string;
  summary: string;
  topics: HelpTopic[];
};

export const HELP_SECTIONS: readonly HelpSection[] = [
  {
    id: "start",
    title: "Start here",
    summary: "The ten-minute tour: your books, your workspaces, and how to move around.",
    topics: [
      {
        id: "what-is-finwise",
        title: "What does FinWise do?",
        answer:
          "FinWise keeps one ledger for your personal and business money. You capture what you spend, connect the accounts you already use, see where the money goes, and act on it. AI does the typing; nothing it reads or suggests reaches your books until you confirm it.",
        keywords: ["what is finwise", "overview", "about", "getting started", "what does it do"],
      },
      {
        id: "first-transaction",
        title: "Add your first transaction",
        answer: "Type it, say it, or capture a screenshot. Confirming the draft is what writes it to the ledger.",
        steps: [
          "Open Capture (or press Ctrl+K / Cmd+K and choose Add transaction).",
          "Type something like “lunch 250 cash” or attach a receipt, screenshot or SMS.",
          "Check the amount, account and category, then confirm.",
        ],
        href: "/capture",
        hrefLabel: "Open Capture",
        keywords: ["first transaction", "add expense", "new transaction", "record", "quick add", "add"],
      },
      {
        id: "workspaces",
        title: "Personal vs business books",
        answer:
          "Each workspace has its own accounts, transactions, budgets and reports. Your personal workspace is for household money; a business workspace keeps a company's books separate, with projects, payroll and its own profit and loss. Switch with the workspace menu in the sidebar.",
        href: "/settings/workspace",
        hrefLabel: "Workspace settings",
        keywords: ["workspace", "personal", "business", "switch", "separate books", "company"],
      },
      {
        id: "setup",
        title: "Change country, currency or timezone",
        answer:
          "The base currency is what totals and reports use; accounts and transactions can still be in any currency. The timezone decides what “today” means for due dates and reminders. Both live in Workspace settings and need an owner or admin.",
        href: "/settings/workspace",
        hrefLabel: "Open workspace settings",
        keywords: ["currency", "base currency", "timezone", "country", "change currency", "locale"],
      },
      {
        id: "navigate",
        title: "Find any screen quickly",
        answer:
          "Press Ctrl+K (or Cmd+K on a Mac) to search the whole app and jump to a page or start a new entry. On a phone, the bottom bar holds Overview, Activity, Inbox and the add button.",
        keywords: ["command palette", "shortcut", "search", "navigate", "ctrl k", "cmd k", "keyboard"],
      },
    ],
  },
  {
    id: "capture",
    title: "Capture money",
    summary: "Receipts, screenshots, SMS, voice and plain language all become drafts you confirm.",
    topics: [
      {
        id: "receipt",
        title: "Capture a receipt or screenshot",
        answer: "Drop an image or PDF and the AI reads the merchant, amount, date and currency into a draft. You check it before it is saved.",
        steps: ["Open Capture and add the file.", "Wait for the draft to fill in.", "Fix anything the AI misread, then confirm."],
        href: "/capture",
        hrefLabel: "Open Capture",
        keywords: ["receipt", "screenshot", "photo", "image", "bill", "capture", "upload"],
      },
      {
        id: "sms",
        title: "Paste an SMS or type plain language",
        answer:
          "Paste a bank or bKash message, or write a line the way you would say it: “office rent 15000 bkash”, “gotokal bazar 1200 cash e”. English, Bangla and Banglish all work.",
        href: "/capture",
        hrefLabel: "Open Capture",
        keywords: ["sms", "paste", "bangla", "banglish", "text", "plain language", "type"],
      },
      {
        id: "voice",
        title: "Record a voice note",
        answer: "Speak the entry instead of typing it. The note is transcribed and turned into the same draft you can confirm.",
        href: "/capture",
        hrefLabel: "Open Capture",
        keywords: ["voice", "speak", "record", "microphone", "audio"],
      },
      {
        id: "inbox",
        title: "What is the AI Inbox?",
        answer:
          "Everything that needs a decision lands there: captured drafts, items the AI noticed, and suggestions that are waiting for you. Confirm, fix or dismiss each one; nothing posts by itself.",
        href: "/ai/inbox",
        hrefLabel: "Open the AI Inbox",
        keywords: ["inbox", "ai inbox", "review", "pending", "drafts", "needs attention"],
      },
    ],
  },
  {
    id: "ledger",
    title: "The ledger",
    summary: "Accounts, transactions, transfers and corrections. The ledger is the source of truth.",
    topics: [
      {
        id: "accounts",
        title: "Add an account",
        answer:
          "An account is where money sits: a bank account, cash, a mobile wallet like bKash, a card or an investment. Each account has its own currency and opening balance.",
        href: "/accounts",
        hrefLabel: "Open Accounts",
        keywords: ["account", "bank", "cash", "bkash", "wallet", "opening balance", "card"],
      },
      {
        id: "transfer",
        title: "Move money between accounts",
        answer:
          "Use a transfer, not an expense. A transfer records money leaving one account and arriving in another, so it never shows up as spending. If the two accounts are in different currencies, enter the rate you actually got.",
        href: "/transfers",
        hrefLabel: "New transfer",
        keywords: ["transfer", "move money", "between accounts", "send money", "own account"],
      },
      {
        id: "fix",
        title: "Fix a wrong transaction",
        answer:
          "Open the transaction and edit it; the ledger entries are rewritten in the same step. If it already posted and should not count, delete it: a posted transaction is voided and stays in the ledger for the audit trail, while a draft is removed.",
        href: "/transactions",
        hrefLabel: "Open Activity",
        keywords: ["edit", "wrong", "mistake", "fix", "delete", "void", "remove", "correct"],
      },
      {
        id: "income-expense",
        title: "Income, expenses and everything else",
        answer:
          "Expenses and income affect profit and loss. Transfers, investments, asset purchases, loan proceeds, debt payments and equity do not: they change what you own or owe, not what you earned. Use the right type and the reports stay correct.",
        href: "/transactions",
        hrefLabel: "Open Activity",
        keywords: ["income", "expense", "profit", "p&l", "investment", "loan", "equity", "transaction type"],
      },
      {
        id: "attach",
        title: "Attach a receipt to a transaction",
        answer: "Open the transaction and add the file. Attachments are stored privately and opened only through your workspace.",
        href: "/transactions",
        hrefLabel: "Open Activity",
        keywords: ["attachment", "attach", "receipt file", "proof", "document"],
      },
      {
        id: "multi-currency",
        title: "How foreign currency is handled",
        answer:
          "Every transaction keeps its original amount and currency, the amount in the account's currency, and the amount in your base currency at the rate used. The original is never overwritten, so history stays honest.",
        href: "/settings/currency",
        hrefLabel: "Exchange rates",
        keywords: ["multi currency", "foreign", "exchange rate", "fx", "dollar", "conversion", "base amount"],
      },
    ],
  },
  {
    id: "ai",
    title: "AI and the copilot",
    summary: "Ask questions, prepare changes, and stay in control of what gets saved.",
    topics: [
      {
        id: "copilot",
        title: "Ask the copilot a question",
        answer:
          "Ask in English or Bangla: “how much did I spend on food last month?”, “who owes me money?”, “can I afford a 40,000 laptop?”. It answers from your ledger and shows the records behind the number.",
        href: "/ai/copilot",
        hrefLabel: "Open the copilot",
        keywords: ["copilot", "ask", "question", "chat", "ai", "assistant"],
      },
      {
        id: "copilot-write",
        title: "Can the copilot change my books?",
        answer:
          "It can prepare a change, for example “record lunch 250 from bKash”, but it only applies after a member confirms. Viewers cannot make changes through it.",
        href: "/ai/copilot",
        hrefLabel: "Open the copilot",
        keywords: ["copilot change", "prepare", "confirm", "write", "approve"],
      },
      {
        id: "ai-privacy",
        title: "What does the AI see, and can I turn it off?",
        answer:
          "It sees only what the task needs: the receipt you captured, or the figures the copilot looks up for your question. An owner or admin can switch AI off for a workspace and keep using the parser and rules.",
        href: "/settings/ai",
        hrefLabel: "AI settings",
        keywords: ["privacy", "what does ai see", "turn off ai", "disable ai", "data", "model"],
      },
      {
        id: "credits",
        title: "AI credits and limits",
        answer:
          "Every model call uses credits: your plan's monthly allowance first, then any purchased balance. When credits run out, capture falls back to the built-in parser and the copilot explains what is left.",
        href: "/settings/billing",
        hrefLabel: "Plan and usage",
        keywords: ["credits", "usage", "limit", "allowance", "ai cost", "quota"],
      },
    ],
  },
  {
    id: "planning",
    title: "Budgets, goals and bills",
    summary: "Plan the month, save for something, and never miss a due date.",
    topics: [
      {
        id: "budget",
        title: "Create a budget",
        answer:
          "Give a category a monthly, quarterly, yearly or total limit. FinWise compares it with what you actually spent and warns you before you cross it.",
        href: "/budgets",
        hrefLabel: "Open Budgets",
        keywords: ["budget", "limit", "spending plan", "monthly budget", "overspend"],
      },
      {
        id: "goal",
        title: "Set a savings goal",
        answer: "A goal tracks what you have set aside and the monthly amount that gets you there by the date you choose. Dream purchases work the same way.",
        href: "/goals",
        hrefLabel: "Open Goals",
        keywords: ["goal", "saving", "save", "dream", "target", "savings plan"],
      },
      {
        id: "bills",
        title: "Track bills and subscriptions",
        answer:
          "Add rent, internet, Netflix or a domain and FinWise reminds you before it is due, spots price changes, and lets you mark it paid in one tap.",
        href: "/subscriptions",
        hrefLabel: "Open Subscriptions",
        keywords: ["bill", "subscription", "netflix", "renewal", "due date", "reminder", "pay bill"],
      },
      {
        id: "commitments",
        title: "Salaries, rent and loan installments",
        answer: "Commitments are the regular obligations that shape the month. Recording them keeps forecasts and the “left to spend” figure honest.",
        href: "/commitments",
        hrefLabel: "Open Commitments",
        keywords: ["commitment", "salary", "payroll", "rent", "loan payment", "insurance", "regular"],
      },
    ],
  },
  {
    id: "business",
    title: "Business books",
    summary: "A company workspace with projects, payroll, revenue and its own reports.",
    topics: [
      {
        id: "business-workspace",
        title: "Keep company money separate",
        answer:
          "Create a business workspace and invite the people who need it. Its accounts, transactions and reports are separate from your personal books; your role in each workspace can differ.",
        href: "/settings/workspace",
        hrefLabel: "Workspace settings",
        keywords: ["business workspace", "company", "separate", "freelance", "sole proprietor"],
      },
      {
        id: "projects",
        title: "Track a project's profit",
        answer: "Tag income and expenses with a project to see what each one earned, what it cost, and whether it made money.",
        href: "/business/projects",
        hrefLabel: "Open Projects",
        keywords: ["project", "profit", "job", "client work", "project cost"],
      },
      {
        id: "payroll",
        title: "Run payroll",
        answer: "Keep a roster, record what each person is paid, and post a payroll run as one entry with its own breakdown.",
        href: "/business/payroll",
        hrefLabel: "Open Payroll",
        keywords: ["payroll", "salary", "employee", "wages", "staff"],
      },
      {
        id: "revenue",
        title: "Revenue, invoices and receivables",
        answer: "Record what customers owe, mark invoices paid as the money arrives, and see who is overdue from the receivables list.",
        href: "/business/revenue",
        hrefLabel: "Open Revenue",
        keywords: ["revenue", "invoice", "customer", "receivable", "owes", "unpaid", "sales"],
      },
    ],
  },
  {
    id: "wealth",
    title: "Wealth and net worth",
    summary: "What you own, what you owe, and the number that combines them.",
    topics: [
      {
        id: "net-worth",
        title: "See your net worth",
        answer: "Net worth adds your assets and investments and subtracts your liabilities. It updates as balances change, so it stays current without a spreadsheet.",
        href: "/wealth/net-worth",
        hrefLabel: "Open Net worth",
        keywords: ["net worth", "wealth", "total", "assets minus liabilities"],
      },
      {
        id: "assets",
        title: "Add an asset or investment",
        answer:
          "Use an asset for things you own (property, a vehicle, gold) and an investment for holdings whose value moves (stocks, funds, crypto). Both can be revalued whenever you like.",
        href: "/wealth/assets",
        hrefLabel: "Open Assets",
        keywords: ["asset", "investment", "property", "gold", "stock", "crypto", "portfolio", "holding"],
      },
      {
        id: "liabilities",
        title: "Track loans you owe",
        answer: "A liability is money you owe: a loan, a card balance, a mortgage. Payments reduce it and the interest you pay is recorded as an expense.",
        href: "/wealth/liabilities",
        hrefLabel: "Open Liabilities",
        keywords: ["liability", "loan", "debt", "mortgage", "credit card balance", "owe"],
      },
      {
        id: "receivables",
        title: "Track money owed to you",
        answer: "Receivables are amounts other people owe you. Record one when you lend or invoice, and settle it when the money arrives.",
        href: "/wealth/receivables",
        hrefLabel: "Open Receivables",
        keywords: ["receivable", "owed to me", "lend", "friend owes", "collect"],
      },
    ],
  },
  {
    id: "reports",
    title: "Reports and export",
    summary: "Understand the month, prove the year, and take your data with you.",
    topics: [
      {
        id: "reports",
        title: "Read your reports",
        answer:
          "Reports cover spending by category, profit and loss, cash flow, budgets and trends over time. Every figure links to the transactions behind it, so you can check any number.",
        href: "/reports",
        hrefLabel: "Open Reports",
        keywords: ["report", "analytics", "chart", "trend", "cash flow", "profit and loss", "spending by category"],
      },
      {
        id: "insights",
        title: "Insights and forecasts",
        answer:
          "Insights point at what changed and why; forecasts project the next months from your history and commitments. Both are explanations on top of the ledger, never a replacement for it.",
        href: "/ai/insights",
        hrefLabel: "Open Insights",
        keywords: ["insight", "forecast", "prediction", "trend", "anomaly", "next month"],
      },
      {
        id: "export",
        title: "Export everything",
        answer: "Download your records as JSON or CSV at any time from Data & account. The export is yours; no support ticket needed.",
        href: "/settings/account",
        hrefLabel: "Open Data & account",
        keywords: ["export", "download", "csv", "json", "backup", "take my data"],
      },
    ],
  },
  {
    id: "connect",
    title: "Connect and automate",
    summary: "Imports, connections, the API, webhooks and MCP for AI agents.",
    topics: [
      {
        id: "import",
        title: "Import a CSV, Excel or PDF statement",
        answer:
          "Upload the file, match its columns to the fields FinWise needs, and review the rows before they post. Re-importing the same file is safe: duplicates are recognised.",
        href: "/integrations/import",
        hrefLabel: "Import a file",
        keywords: ["import", "csv", "excel", "pdf", "statement", "bank statement"],
      },
      {
        id: "connections",
        title: "Connect an app or bank",
        answer:
          "Connections pull transactions in on their own and can be paused at any time. Credentials are encrypted and never shown again after you save them.",
        href: "/integrations",
        hrefLabel: "Open Integrations",
        keywords: ["integration", "connect", "bank", "sync", "connection", "automatic"],
      },
      {
        id: "api",
        title: "Use the API, webhooks or MCP",
        answer:
          "Create a workspace API key to read or write through the REST API, subscribe a webhook to events, or connect an AI agent like Claude through MCP. Keys follow your plan's limits and can be revoked instantly.",
        href: "/integrations/api",
        hrefLabel: "API and keys",
        keywords: ["api", "webhook", "mcp", "key", "token", "developer", "claude"],
      },
    ],
  },
  {
    id: "team",
    title: "People, plans and security",
    summary: "Invite the right people, keep the right limits, and protect the account.",
    topics: [
      {
        id: "invite",
        title: "Invite someone to a workspace",
        answer:
          "Owners and admins send an email invitation. The person joins only by accepting it from the address it was sent to, so a forwarded link cannot open your books.",
        href: "/settings/workspace",
        hrefLabel: "Manage members",
        keywords: ["invite", "member", "teammate", "accountant", "partner", "add user", "team"],
      },
      {
        id: "roles",
        title: "What the roles can do",
        answer:
          "Owners manage everything, including billing and the workspace itself. Admins manage the books and people. Members record and change transactions. Viewers can read and export but never change anything.",
        href: "/settings/workspace",
        hrefLabel: "Manage members",
        keywords: ["role", "owner", "admin", "member", "viewer", "permission", "read only"],
      },
      {
        id: "plans",
        title: "Change or cancel your plan",
        answer:
          "Plan, invoices and usage live in Billing. Limits (people, storage, AI credits, integrations) follow the workspace owner's plan; with billing off on a self-hosted install, everything is allowed.",
        href: "/settings/billing",
        hrefLabel: "Open Billing",
        keywords: ["plan", "upgrade", "downgrade", "cancel", "billing", "invoice", "payment", "subscription plan"],
      },
      {
        id: "security",
        title: "Protect your account",
        answer:
          "Turn on two-factor authentication and review active sessions in Security. Changing your password signs other devices out.",
        href: "/settings/security",
        hrefLabel: "Open Security",
        keywords: ["security", "2fa", "two factor", "password", "sessions", "log out", "hacked"],
      },
      {
        id: "delete-account",
        title: "Delete your account",
        answer:
          "Data & account can export everything first, then delete the account. Workspaces you own alone are deleted with it; shared workspaces stay with the other members.",
        href: "/settings/account",
        hrefLabel: "Open Data & account",
        keywords: ["delete account", "close account", "remove account", "privacy", "gdpr"],
      },
    ],
  },
] as const;

export const HELP_TOPICS: ReadonlyArray<HelpTopic & { section: string }> = HELP_SECTIONS.flatMap((section) =>
  section.topics.map((topic) => ({ ...topic, section: section.title })),
);

export const SUGGESTED_QUESTIONS = [
  "How do I add an expense?",
  "How do I change my currency?",
  "What does the copilot do?",
  "How do I invite my accountant?",
  "Where do I export my data?",
] as const;

const STOP_WORDS = new Set(["a", "an", "the", "how", "do", "does", "i", "my", "to", "in", "on", "of", "is", "it", "can", "what", "where", "and", "for", "with", "me"]);

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/** Keyword-and-title match, good enough to point someone at the right answer offline. */
export function searchHelp(query: string, limit = 4): Array<HelpTopic & { section: string }> {
  const words = tokens(query);
  if (words.length === 0) return [];
  const phrase = query.trim().toLowerCase();
  const scored = HELP_TOPICS.map((topic) => {
    const title = topic.title.toLowerCase();
    const keywords = topic.keywords.join(" ");
    let score = 0;
    if (phrase.length > 2 && (title.includes(phrase) || keywords.includes(phrase))) score += 6;
    for (const word of words) {
      if (title.includes(word)) score += 3;
      if (keywords.includes(word)) score += 3;
      if (topic.answer.toLowerCase().includes(word)) score += 1;
    }
    return { topic, score };
  })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.topic);
}
