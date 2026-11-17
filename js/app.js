// LedgerLens UI — wires the store, chart and AI service to the page.
import {
  loadState, saveState, addTransaction, deleteTransaction, setBudget,
  clearAll, todayISO, monthOf, sumBy, formatIDR, toCSV, ledgerContext,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, ALL_CATEGORIES,
} from "./store.js";
import { drawChart } from "./charts.js";
import { askAI, aiMode } from "./ai.js";
import { buildDemoTransactions, DEMO_BUDGETS } from "./seed.js";

let state = loadState();

const $ = (id) => document.getElementById(id);
const aiStatusEl = $("aiStatus");

function setAIStatus(source) {
  const map = {
    ON_DEVICE: ["chip chip-ondevice", "AI: On-device (Gemini Nano)"],
    IN_CLOUD: ["chip chip-cloud", "AI: Cloud (Gemini Flash)"],
    LOCAL: ["chip chip-local", "AI: Local demo mode"],
  };
  const [cls, label] = map[source] || map.LOCAL;
  aiStatusEl.className = cls;
  aiStatusEl.textContent = label;
}

function renderCategories() {
  const type = $("txType").value;
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  $("txCategory").innerHTML = cats.map((c) => `<option>${c}</option>`).join("");
  const filter = $("filterCategory");
  const current = filter.value;
  filter.innerHTML =
    `<option value="all">All categories</option>` +
    ALL_CATEGORIES.map((c) => `<option>${c}</option>`).join("");
  if ([...filter.options].some((o) => o.value === current)) filter.value = current;
}

function renderStats() {
  const today = todayISO();
  const month = monthOf(today);
  const incToday = sumBy(state.transactions, (t) => t.type === "income" && t.date === today);
  const expToday = sumBy(state.transactions, (t) => t.type === "expense" && t.date === today);
  const balance = sumBy(state.transactions, (t) => t.type === "income") -
    sumBy(state.transactions, (t) => t.type === "expense");
  const monthNet = sumBy(state.transactions, (t) => t.date.startsWith(month) && t.type === "income") -
    sumBy(state.transactions, (t) => t.date.startsWith(month) && t.type === "expense");
  $("statIncomeToday").textContent = formatIDR(incToday);
  $("statExpenseToday").textContent = formatIDR(expToday);
  $("statIncomeCount").textContent =
    `${state.transactions.filter((t) => t.type === "income" && t.date === today).length} entries`;
  $("statExpenseCount").textContent =
    `${state.transactions.filter((t) => t.type === "expense" && t.date === today).length} entries`;
  $("statBalance").textContent = formatIDR(balance);
  $("statBalance").style.color = balance >= 0 ? "var(--green)" : "var(--red)";
  $("statTxCount").textContent = `${state.transactions.length} transactions`;
  $("statMonthNet").textContent = formatIDR(monthNet);
  $("statMonthNet").style.color = monthNet >= 0 ? "var(--green)" : "var(--red)";
  const monthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  $("statMonthNote").textContent = monthName;
}

function renderBudgets() {
  const month = monthOf(todayISO());
  const wrap = $("budgetList");
  wrap.innerHTML = "";
  for (const cat of EXPENSE_CATEGORIES) {
    if (cat === "Other expense") continue;
    const budget = state.budgets[cat] || 0;
    const spent = sumBy(state.transactions, (t) =>
      t.type === "expense" && t.category === cat && t.date.startsWith(month));
    const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    const row = document.createElement("div");
    row.className = "budget-row";
    row.innerHTML = `
      <span>${cat} — <strong>${formatIDR(spent)}</strong>${budget ? ` of ${formatIDR(budget)}` : " (no limit set)"}</span>
      <label>Rp <input type="number" min="0" step="1000" value="${budget || ""}" placeholder="limit" aria-label="Monthly budget for ${cat}"></label>
      <div class="bar"><span class="${spent > budget && budget > 0 ? "over" : ""}" style="width:${pct}%"></span></div>`;
    row.querySelector("input").addEventListener("change", (e) => {
      setBudget(state, cat, e.target.value);
      renderBudgets();
    });
    wrap.appendChild(row);
  }
}

function renderTable() {
  const fType = $("filterType").value;
  const fCat = $("filterCategory").value;
  const q = $("filterSearch").value.trim().toLowerCase();
  const rows = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .filter((t) => (fType === "all" || t.type === fType))
    .filter((t) => (fCat === "all" || t.category === fCat))
    .filter((t) => !q || (t.note || "").toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  const tbody = $("txTableBody");
  tbody.innerHTML = "";
  $("txEmpty").style.display = rows.length ? "none" : "block";
  for (const t of rows.slice(0, 200)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type === "income" ? "Income" : "Expense"}</td>
      <td>${t.category}</td>
      <td>${escapeHtml(t.note)}</td>
      <td class="num"><span class="${t.type === "income" ? "inc" : "exp"}">${t.type === "income" ? "+" : "−"}${formatIDR(t.amount)}</span></td>
      <td><button class="link-btn" data-id="${t.id}" type="button">Delete</button></td>`;
    tr.querySelector("button").addEventListener("click", () => {
      deleteTransaction(state, t.id);
      renderAll();
    });
    tbody.appendChild(tr);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderAll() {
  renderStats();
  renderBudgets();
  renderTable();
  drawChart($("chart"), state.transactions);
}

function showAnswer(el, text, source) {
  const label = { ON_DEVICE: "On device · Gemini Nano", IN_CLOUD: "Cloud · Gemini Flash", LOCAL: "Local analyser (no Firebase configured)" }[source] || source;
  const cls = { ON_DEVICE: "src-ondevice", IN_CLOUD: "src-cloud", LOCAL: "src-local" }[source] || "src-local";
  el.innerHTML = "";
  const p = document.createElement("div");
  p.textContent = text;
  const badge = document.createElement("span");
  badge.className = "src " + cls;
  badge.textContent = label;
  el.append(p, badge);
  setAIStatus(source);
}

async function runInsight(kind) {
  const btn = kind === "week" ? $("btnWeekInsight") : $("btnInsight");
  const out = $("insightOut");
  btn.disabled = true;
  out.innerHTML = "<p class='muted'>Thinking…</p>";
  const prompt = kind === "week"
    ? "Give me a weekly review of this small shop's money: total income and expenses, the biggest spending category, whether the week was profitable, and 3 concrete, practical tips to improve next week. Keep it under 150 words."
    : "Give me a short daily insight for this small shop: how today went, the biggest expense so far, and one practical tip for tomorrow. Keep it under 120 words.";
  try {
    const { text, source } = await askAI(prompt, ledgerContext(state));
    showAnswer(out, text, source);
  } catch (err) {
    out.innerHTML = "<p class='muted'>Something went wrong: " + escapeHtml(err.message) + "</p>";
  } finally {
    btn.disabled = false;
  }
}

// --- Events ---------------------------------------------------------------
$("txType").addEventListener("change", renderCategories);
$("txForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number($("txAmount").value);
  if (!amount || amount <= 0) { $("formMsg").textContent = "Enter an amount greater than 0."; return; }
  addTransaction(state, {
    type: $("txType").value,
    amount,
    category: $("txCategory").value,
    note: $("txNote").value,
    date: $("txDate").value || todayISO(),
  });
  $("formMsg").textContent = "Transaction added.";
  e.target.reset();
  $("txDate").value = todayISO();
  renderCategories();
  renderAll();
});
$("filterType").addEventListener("change", renderTable);
$("filterCategory").addEventListener("change", renderTable);
$("filterSearch").addEventListener("input", renderTable);
$("btnInsight").addEventListener("click", () => runInsight("day"));
$("btnWeekInsight").addEventListener("click", () => runInsight("week"));
$("askForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = $("askInput").value.trim();
  if (!q) return;
  const out = $("askOut");
  out.innerHTML = "<p class='muted'>Thinking…</p>";
  try {
    const { text, source } = await askAI(q, ledgerContext(state));
    showAnswer(out, text, source);
  } catch (err) {
    out.innerHTML = "<p class='muted'>Something went wrong: " + escapeHtml(err.message) + "</p>";
  }
});
$("btnDemo").addEventListener("click", () => {
  if (state.transactions.length > 0 && !confirm("Replace your current data with the demo dataset?")) return;
  state = { transactions: buildDemoTransactions(), budgets: { ...DEMO_BUDGETS } };
  saveState(state);
  renderAll();
  $("insightOut").innerHTML = "<p class='muted'>Demo data loaded — 3 weeks of shop transactions. Try “Generate daily insight”.</p>";
});
$("btnExport").addEventListener("click", () => {
  const blob = new Blob([toCSV(state.transactions)], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ledgerlens-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});
$("btnWipe").addEventListener("click", () => {
  if (!confirm("Delete ALL transactions and budgets stored in this browser?")) return;
  clearAll();
  state = loadState();
  renderAll();
});

// --- Init -----------------------------------------------------------------
$("txDate").value = todayISO();
renderCategories();
setAIStatus(aiMode() === "firebase" ? "IN_CLOUD" : "LOCAL");
if (aiMode() === "local") {
  aiStatusEl.title = "Local demo mode — paste a Firebase config in js/firebase-config.js to enable real hybrid AI (Gemini Nano on-device + Gemini Flash cloud).";
}
renderAll();
