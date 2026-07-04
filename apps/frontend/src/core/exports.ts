import { formatScheduleValue } from "./resultFormatting";
import { copyText } from "./clipboard";

export function exportCsv(name: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { period: "", value: "" });
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(formatScheduleValue(header, row[header]))).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}-schedule.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportPdf(name: string, summary: Record<string, number | string>, rows: Record<string, unknown>[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`${name} Result`, 14, 18);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

  let y = 42;
  Object.entries(summary).forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 14, y);
    y += 8;
  });

  y += 6;
  doc.text("Schedule preview", 14, y);
  y += 8;
  rows.slice(0, 18).forEach((row) => {
    const line = Object.entries(row).map(([key, value]) => `${key}: ${formatScheduleValue(key, value)}`).join(" | ");
    doc.text(line.slice(0, 95), 14, y);
    y += 7;
  });

  doc.save(`${name}-result.pdf`);
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function printPage() {
  window.print();
}

export async function shareResult(title: string, text?: string) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return copyText(text ? `${text}\n${url}` : url);
}
