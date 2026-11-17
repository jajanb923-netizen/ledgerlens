// Minimal dependency-free bar chart: daily income vs expenses, last 14 days.
import { toISODate, sumBy } from "./store.js";

export function drawChart(canvas, transactions) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  const income = days.map((d) => sumBy(transactions, (t) => t.type === "income" && t.date === d));
  const expense = days.map((d) => sumBy(transactions, (t) => t.type === "expense" && t.date === d));
  const max = Math.max(1, ...income, ...expense);
  const padL = 8, padB = 22, padT = 10;
  const plotH = H - padB - padT;
  const slot = (W - padL * 2) / days.length;
  const barW = Math.max(4, Math.min(16, slot * 0.32));

  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "#667085";
  ctx.textAlign = "center";
  days.forEach((d, i) => {
    const cx = padL + slot * i + slot / 2;
    const ih = (income[i] / max) * plotH;
    const eh = (expense[i] / max) * plotH;
    ctx.fillStyle = "#12b76a";
    ctx.fillRect(cx - barW - 1, padT + plotH - ih, barW, ih);
    ctx.fillStyle = "#f04438";
    ctx.fillRect(cx + 1, padT + plotH - eh, barW, eh);
    ctx.fillStyle = "#667085";
    ctx.fillText(d.slice(5), cx, H - 6);
  });
  // Baseline
  ctx.strokeStyle = "#e4e7ec";
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH + 0.5);
  ctx.lineTo(W - padL, padT + plotH + 0.5);
  ctx.stroke();
}
