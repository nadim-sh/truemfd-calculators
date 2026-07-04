import { EngineName } from "../calculators/types";

type Input = Record<string, number | string>;
type Row = Record<string, number | string>;

export interface CalculatorResult {
  summary: Record<string, number | string>;
  schedule: Row[];
  chart: { label: string; value: number }[];
  futureValue?: number;
  rate?: number;
  error?: string;
}

export const CASHFLOW_SIGN_MESSAGE = "IRR/XIRR requires at least one investment outflow and one return inflow.";
export const RATE_FAILURE_MESSAGE = "IRR/XIRR could not find a reliable rate for these cashflows.";

export function runCalculator(engine: EngineName, input: Input): CalculatorResult {
  const v = (key: string) => Number(input[key] || 0);
  switch (engine) {
    case "standardSip": return standardSip(v("monthlyInvestment"), v("annualReturn"), v("years"));
    case "stepUpSip": return stepUpSip(v("monthlyInvestment"), v("annualReturn"), v("years"), v("annualIncrease"));
    case "lumpsum": return lumpsum(v("principal"), v("annualReturn"), v("years"));
    case "goalSip": return goalSip(v("goalAmount"), v("annualReturn"), v("years"));
    case "swp": return swp(v("corpus"), v("monthlyWithdrawal"), v("annualReturn"), v("years"));
    case "ppf": return ppf(v("yearlyInvestment"), v("annualReturn"), v("years"));
    case "sipVsLumpsum": return sipVsLumpsum(v("monthlyInvestment"), v("principal"), v("annualReturn"), v("years"));
    case "xirr": return cashflowRate(String(input.cashflows ?? ""), true);
    case "irr": return cashflowRate(String(input.cashflows ?? ""), false);
  }
}

function standardSip(monthly: number, annualReturn: number, years: number): CalculatorResult {
  const months = Math.round(years * 12);
  const rate = annualReturn / 1200;
  const futureValue = rate === 0 ? monthly * months : monthly * (((1 + rate) ** months - 1) / rate) * (1 + rate);
  const invested = monthly * months;
  return withSchedule("Month", months, (month) => {
    const value = rate === 0 ? monthly * month : monthly * (((1 + rate) ** month - 1) / rate) * (1 + rate);
    return { period: month, invested: monthly * month, value };
  }, { "Future value": futureValue, "Total investment": invested, "Estimated gain": futureValue - invested }, futureValue);
}

function stepUpSip(monthly: number, annualReturn: number, years: number, annualIncrease: number): CalculatorResult {
  const monthlyRate = annualReturn / 1200;
  let value = 0;
  let invested = 0;
  const schedule: Row[] = [];
  for (let year = 1; year <= years; year += 1) {
    const contribution = monthly * (1 + annualIncrease / 100) ** (year - 1);
    for (let month = 1; month <= 12; month += 1) {
      value = (value + contribution) * (1 + monthlyRate);
      invested += contribution;
    }
    schedule.push({ period: year, invested, value });
  }
  return pack(schedule, { "Future value": value, "Total investment": invested, "Estimated gain": value - invested }, value);
}

function lumpsum(principal: number, annualReturn: number, years: number): CalculatorResult {
  return withSchedule("Year", years, (year) => ({ period: year, invested: principal, value: principal * (1 + annualReturn / 100) ** year }), {
    "Future value": principal * (1 + annualReturn / 100) ** years,
    "Total investment": principal,
    "Estimated gain": principal * (1 + annualReturn / 100) ** years - principal
  }, principal * (1 + annualReturn / 100) ** years);
}

function goalSip(goal: number, annualReturn: number, years: number): CalculatorResult {
  const months = years * 12;
  const rate = annualReturn / 1200;
  const monthly = rate === 0 ? goal / months : goal / ((((1 + rate) ** months - 1) / rate) * (1 + rate));
  const base = standardSip(monthly, annualReturn, years);
  return { ...base, summary: { "Monthly SIP required": monthly, "Goal amount": goal, "Years": years } };
}

function swp(corpus: number, monthlyWithdrawal: number, annualReturn: number, years: number): CalculatorResult {
  const rate = annualReturn / 1200;
  let balance = corpus;
  const schedule = [];
  for (let month = 1; month <= years * 12; month += 1) {
    balance = Math.max(0, balance * (1 + rate) - monthlyWithdrawal);
    schedule.push({ period: month, withdrawal: monthlyWithdrawal, value: balance });
  }
  return pack(schedule, { "Corpus remaining": balance, "Total withdrawal": monthlyWithdrawal * years * 12, "Starting corpus": corpus }, balance);
}

function ppf(yearly: number, annualReturn: number, years: number): CalculatorResult {
  let value = 0;
  const schedule = [];
  for (let year = 1; year <= years; year += 1) {
    value = (value + yearly) * (1 + annualReturn / 100);
    schedule.push({ period: year, invested: yearly * year, value });
  }
  return pack(schedule, { "Maturity value": value, "Total investment": yearly * years, "Interest earned": value - yearly * years }, value);
}

function sipVsLumpsum(monthly: number, principal: number, annualReturn: number, years: number): CalculatorResult {
  const sip = standardSip(monthly, annualReturn, years);
  const lump = lumpsum(principal, annualReturn, years);
  return {
    summary: { "SIP value": sip.futureValue ?? 0, "Lumpsum value": lump.futureValue ?? 0, Recommendation: (sip.futureValue ?? 0) > (lump.futureValue ?? 0) ? "SIP leads for these inputs" : "Lumpsum leads for these inputs" },
    schedule: [...sip.schedule, ...lump.schedule],
    chart: [{ label: "SIP", value: sip.futureValue ?? 0 }, { label: "Lumpsum", value: lump.futureValue ?? 0 }],
    futureValue: Math.max(sip.futureValue ?? 0, lump.futureValue ?? 0)
  };
}

function cashflowRate(raw: string, annualized: boolean): CalculatorResult {
  const cashflows = raw.split(",").map((item) => Number(item.trim())).filter(Number.isFinite);
  const invalid = validateCashflows(cashflows);
  const schedule = cashflows.map((cashflow, index) => ({ period: index, cashflow }));
  const chart = cashflows.map((cashflow, index) => ({ label: String(index), value: cashflow }));
  const label = annualized ? "XIRR" : "IRR";
  if (invalid) return { summary: { [label]: invalid, "Cashflows": cashflows.length }, schedule, chart, error: invalid };

  let rate = 0.1;
  for (let i = 0; i < 50; i += 1) {
    const f = cashflows.reduce((sum, cashflow, index) => sum + cashflow / (1 + rate) ** index, 0);
    const d = cashflows.reduce((sum, cashflow, index) => sum - (index * cashflow) / (1 + rate) ** (index + 1), 0);
    if (Math.abs(d) < 1e-9) break;
    const nextRate = rate - f / d;
    if (!Number.isFinite(nextRate) || nextRate <= -0.999999) {
      return { summary: { [label]: RATE_FAILURE_MESSAGE, "Cashflows": cashflows.length }, schedule, chart, error: RATE_FAILURE_MESSAGE };
    }
    if (Math.abs(nextRate - rate) < 1e-10) {
      rate = nextRate;
      break;
    }
    rate = nextRate;
  }
  const displayRate = annualized ? ((1 + rate) ** 12 - 1) * 100 : rate * 100;
  const residual = cashflows.reduce((sum, cashflow, index) => sum + cashflow / (1 + rate) ** index, 0);
  const scale = Math.max(1, cashflows.reduce((sum, cashflow) => sum + Math.abs(cashflow), 0));
  if (!Number.isFinite(displayRate) || Math.abs(residual) / scale > 1e-7) {
    return { summary: { [label]: RATE_FAILURE_MESSAGE, "Cashflows": cashflows.length }, schedule, chart, error: RATE_FAILURE_MESSAGE };
  }
  return { summary: { [label]: displayRate, "Cashflows": cashflows.length }, schedule, chart, rate: displayRate };
}

function validateCashflows(cashflows: number[]) {
  if (cashflows.length < 2) return "Enter at least two valid cashflow entries.";
  if (!cashflows.some((cashflow) => cashflow < 0) || !cashflows.some((cashflow) => cashflow > 0)) return CASHFLOW_SIGN_MESSAGE;
  return "";
}

function withSchedule(label: string, count: number, build: (period: number) => Row, summary: Record<string, number | string>, futureValue: number): CalculatorResult {
  const schedule = Array.from({ length: count }, (_, index) => build(index + 1));
  return { ...pack(schedule, summary, futureValue), chart: schedule.filter((_, index) => index % Math.max(1, Math.floor(count / 12)) === 0).map((row) => ({ label: `${label} ${row.period}`, value: Number(row.value) })) };
}

function pack(schedule: Row[], summary: Record<string, number | string>, futureValue: number): CalculatorResult {
  return { summary, schedule, chart: schedule.map((row) => ({ label: String(row.period), value: Number(row.value) || 0 })), futureValue };
}
