import { EngineName } from "../calculators/types";
import { CalculatorResult } from "./financialEngine";

type Input = Record<string, number | string>;
type ApiResult = {
  calculator: string;
  result: Record<string, number | string>;
  schedule: Record<string, number | string>[];
  chart: { label: string; value: number }[];
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000");

const endpoints: Record<EngineName, string> = {
  standardSip: "standard-sip",
  stepUpSip: "step-up-sip",
  lumpsum: "lumpsum",
  goalSip: "goal-sip",
  swp: "swp",
  ppf: "ppf",
  sipVsLumpsum: "sip-vs-lumpsum",
  xirr: "xirr",
  irr: "irr"
};

const summaryLabels: Record<string, string> = {
  corpus_remaining: "Corpus remaining",
  future_value: "Future value",
  gain: "Estimated gain",
  goal_amount: "Goal amount",
  interest: "Interest earned",
  lumpsum_value: "Lumpsum value",
  maturity_value: "Maturity value",
  monthly_sip_required: "Monthly SIP required",
  rate: "Rate",
  recommendation: "Recommendation",
  sip_value: "SIP value",
  total_investment: "Total investment",
  total_withdrawal: "Total withdrawal",
  years: "Years"
};

export async function runCalculatorApi(engine: EngineName, input: Input): Promise<CalculatorResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/calculators/${endpoints[engine]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(engine, input))
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return fromApiResult(await response.json());
}

function toPayload(engine: EngineName, input: Input) {
  const n = (key: string) => Number(input[key] || 0);
  switch (engine) {
    case "standardSip":
      return { monthly_investment: n("monthlyInvestment"), annual_return: n("annualReturn"), years: n("years") };
    case "stepUpSip":
      return { monthly_investment: n("monthlyInvestment"), annual_return: n("annualReturn"), years: n("years"), annual_increase: n("annualIncrease") };
    case "lumpsum":
      return { principal: n("principal"), annual_return: n("annualReturn"), years: n("years") };
    case "goalSip":
      return { goal_amount: n("goalAmount"), annual_return: n("annualReturn"), years: n("years") };
    case "swp":
      return { corpus: n("corpus"), monthly_withdrawal: n("monthlyWithdrawal"), annual_return: n("annualReturn"), years: n("years") };
    case "ppf":
      return { yearly_investment: n("yearlyInvestment"), annual_return: n("annualReturn"), years: n("years") };
    case "sipVsLumpsum":
      return { monthly_investment: n("monthlyInvestment"), principal: n("principal"), annual_return: n("annualReturn"), years: n("years") };
    case "xirr":
    case "irr":
      return { cashflows: String(input.cashflows ?? "").split(",").map((item) => Number(item.trim())).filter(Number.isFinite) };
  }
}

function fromApiResult(apiResult: ApiResult): CalculatorResult {
  const summary = Object.fromEntries(
    Object.entries(apiResult.result).map(([key, value]) => [summaryLabel(apiResult.calculator, key), normalizeValue(key, value)])
  );

  return {
    summary,
    schedule: apiResult.schedule,
    chart: apiResult.chart,
    futureValue: pickFutureValue(summary),
    rate: pickRate(summary)
  };
}

async function errorMessage(response: Response) {
  try {
    const body = await response.json();
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    return detail ? `API validation failed: ${detail}` : `Calculator API returned ${response.status}`;
  } catch {
    return `Calculator API returned ${response.status}`;
  }
}

function summaryLabel(calculator: string, key: string) {
  if (key === "rate" && calculator === "xirr") return "XIRR";
  if (key === "rate" && calculator === "irr") return "IRR";
  return summaryLabels[key] ?? titleize(key);
}

function normalizeValue(key: string, value: number | string) {
  if (key === "recommendation" && value === "sip") return "SIP leads for these inputs";
  if (key === "recommendation" && value === "lumpsum") return "Lumpsum leads for these inputs";
  return value;
}

function normalizeBaseUrl(url: string) {
  const base = url.startsWith("http") ? url : `https://${url}`;
  return base.replace(/\/$/, "");
}

function pickFutureValue(summary: Record<string, number | string>) {
  const value = summary["Future value"] ?? summary["Maturity value"] ?? summary["Corpus remaining"];
  return typeof value === "number" ? value : undefined;
}

function pickRate(summary: Record<string, number | string>) {
  const value = summary.Rate ?? summary.IRR ?? summary.XIRR;
  return typeof value === "number" ? value : undefined;
}

function titleize(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
