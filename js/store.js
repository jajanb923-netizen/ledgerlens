// LedgerLens data layer — all data lives in localStorage (offline-first).
// No account, no server. Export as CSV anytime.

const KEY = "ledgerlens.v1";

export const INCOME_CATEGORIES = [
  "Sales",
  "Services",
  "Other income",
];
export const EXPENSE_CATEGORIES = [
  "Stock & supplies",
  "Rent",
  "Utilities",
  "Transport",
  "Food & drinks",
  "Other expense",
];
export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { transactions: [], budgets: {} };
    const parsed = JSON.parse(raw);
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: parsed.budgets && typeof parsed.budgets === "object" ? parsed.budgets : {},
    };
  } catch {
    return { transactions: [], budgets: {} };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function addTransaction(state, { type, amount, category, note, date }) {
  const tx = {
    id: "tx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    type,
    amount: Math.round(Number(amount)),
    category,
    note: (note || "").trim(),
    date, // YYYY-MM-DD
    createdAt: new Date().toISOString(),
  };
  state.transactions.push(tx);
  saveState(state);
  return tx;
}

export function deleteTransaction(state, id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState(state);
}

export function setBudget(state, category, amount) {
  state.budgets[category] = Math.max(0, Math.round(Number(amount) || 0));
  saveState(state);
}

export function clearAll() {
  localStorage.removeItem(KEY);
}

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function monthOf(isoDate) {
  return isoDate.slice(0, 7); // YYYY-MM
}

export function sumBy(transactions, predicate) {
  return transactions.filter(predicate).reduce((a, t) => a + t.amount, 0);
}

export function formatIDR(n) {
  return "Rp " + Math.round(n).toLocaleString("en-US");
}

export function toCSV(transactions) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["date", "type", "category", "note", "amount_idr"].map(esc).join(",")];
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const t of sorted) {
    rows.push([t.date, t.type, t.category, t.note, t.amount].map(esc).join(","));
  }
  return rows.join("\n");
}

/** Compact JSON context handed to the AI (only totals + recent rows, so
 *  on-device prompts stay short). */
export function ledgerContext(state, days = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = toISODate(cutoff);
  const recent = state.transactions.filter((t) => t.date >= cutoffISO);
  const today = todayISO();
  const daySpan = new Set(state.transactions.map((t) => t.date)).size;
  return JSON.stringify({
    days: daySpan,
    currency: "IDR",
    transactions: recent.slice(-60).map((t) => ({
      date: t.date, type: t.type, category: t.category, amount: t.amount, note: t.note,
    })),
    today: {
      income: sumBy(state.transactions, (t) => t.type === "income" && t.date === today),
      expense: sumBy(state.transactions, (t) => t.type === "expense" && t.date === today),
    },
  });
}
