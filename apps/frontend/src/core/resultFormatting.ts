export type SummaryValue = number | string;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2
});

export function formatResultValue(label: string, value: SummaryValue) {
  if (typeof value !== "number") return value;
  if (isPercentageLabel(label)) return `${numberFormatter.format(value)}%`;
  if (isCountLabel(label)) return numberFormatter.format(value);
  return currencyFormatter.format(value);
}

export function formatSummary(summary: Record<string, SummaryValue>) {
  return Object.fromEntries(Object.entries(summary).map(([label, value]) => [label, formatResultValue(label, value)]));
}

export function summaryText(calculatorName: string, summary: Record<string, SummaryValue>) {
  const lines = Object.entries(formatSummary(summary)).map(([label, value]) => `${label}: ${value}`);
  return `${calculatorName}\n${lines.join("\n")}`;
}

export function formatScheduleValue(label: string, value: unknown) {
  if (typeof value !== "number") return String(value ?? "");
  if (isPeriodLabel(label) || isCountLabel(label)) return numberFormatter.format(value);
  if (isPercentageLabel(label)) return `${numberFormatter.format(value)}%`;
  return currencyFormatter.format(value);
}

export function formatChartValue(value: unknown) {
  return typeof value === "number" ? currencyFormatter.format(value) : String(value ?? "");
}

function isPercentageLabel(label: string) {
  const normalized = label.toLowerCase();
  return normalized === "irr" || normalized === "xirr" || normalized === "rate" || normalized.includes("return");
}

function isCountLabel(label: string) {
  const normalized = label.toLowerCase();
  return normalized === "years" || normalized === "cashflows" || normalized.endsWith(" count") || normalized.includes("number of");
}

function isPeriodLabel(label: string) {
  const normalized = label.toLowerCase();
  return normalized === "period" || normalized === "month" || normalized === "year";
}
