// Demo data: 3 weeks of realistic transactions for a small Indonesian
// neighbourhood shop (warung) — sales, stock purchases, rent, utilities.
// Amounts in IDR. Dates are generated relative to "today" so the demo
// always looks alive.
import { toISODate } from "./store.js";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

const PLAN = [
  // [daysAgo, type, category, note, amount]
  [0, "income", "Sales", "Morning sales — rice, coffee, snacks", 385000],
  [0, "expense", "Stock & supplies", "Eggs and cooking oil restock", 120000],
  [0, "expense", "Food & drinks", "Lunch for shop helper", 25000],
  [1, "income", "Sales", "Daily sales", 412000],
  [1, "expense", "Transport", "Fuel for delivery motorbike", 30000],
  [2, "income", "Sales", "Daily sales + phone credit top-ups", 468000],
  [2, "expense", "Stock & supplies", "Instant noodles and drinks", 185000],
  [3, "income", "Sales", "Weekend sales", 520000],
  [3, "income", "Services", "Phone credit and bill payment fees", 45000],
  [4, "income", "Sales", "Daily sales", 390000],
  [4, "expense", "Utilities", "Electricity token", 100000],
  [5, "income", "Sales", "Daily sales", 445000],
  [5, "expense", "Stock & supplies", "Rice 25kg + sugar", 310000],
  [6, "income", "Sales", "Daily sales", 378000],
  [6, "expense", "Food & drinks", "Drinking water gallons", 40000],
  [7, "income", "Sales", "Daily sales", 402000],
  [7, "expense", "Transport", "Fuel for delivery motorbike", 30000],
  [8, "income", "Sales", "Daily sales + weekend boost", 495000],
  [8, "expense", "Stock & supplies", "Snacks and cigarettes restock", 210000],
  [9, "income", "Sales", "Daily sales", 361000],
  [10, "income", "Sales", "Daily sales", 430000],
  [10, "expense", "Stock & supplies", "Cooking gas refill", 95000],
  [11, "income", "Sales", "Daily sales", 388000],
  [11, "expense", "Utilities", "Water bill", 65000],
  [12, "income", "Sales", "Daily sales", 415000],
  [12, "expense", "Stock & supplies", "Vegetables and tofu from market", 140000],
  [13, "income", "Sales", "Daily sales", 372000],
  [14, "income", "Sales", "Daily sales", 398000],
  [14, "expense", "Rent", "Monthly shop rent", 800000],
  [15, "income", "Sales", "Daily sales", 421000],
  [15, "expense", "Stock & supplies", "Rice 25kg + instant noodles", 295000],
  [16, "income", "Sales", "Daily sales", 355000],
  [17, "income", "Sales", "Daily sales", 440000],
  [17, "expense", "Transport", "Fuel for delivery motorbike", 30000],
  [18, "income", "Sales", "Daily sales", 389000],
  [18, "expense", "Stock & supplies", "Drinks and snacks restock", 175000],
  [19, "income", "Sales", "Daily sales", 410000],
  [20, "income", "Sales", "Daily sales", 377000],
];

export function buildDemoTransactions() {
  return PLAN.map(([ago, type, category, note, amount], i) => ({
    id: "demo_" + i,
    type,
    amount,
    category,
    note,
    date: daysAgo(ago),
    createdAt: new Date().toISOString(),
  }));
}

export const DEMO_BUDGETS = {
  "Stock & supplies": 2500000,
  "Food & drinks": 300000,
  Transport: 200000,
  Utilities: 250000,
};
