import { describe, expect, it } from "vitest";
import { CASHFLOW_SIGN_MESSAGE, RATE_FAILURE_MESSAGE, runCalculator } from "./financialEngine";

describe("financial engine", () => {
  it("calculates standard SIP gains", () => {
    const result = runCalculator("standardSip", { monthlyInvestment: 10000, annualReturn: 12, years: 10 });
    expect(result.summary["Future value"]).toBeGreaterThan(2300000);
    expect(result.schedule).toHaveLength(120);
  });

  it("solves a positive goal SIP", () => {
    const result = runCalculator("goalSip", { goalAmount: 2500000, annualReturn: 12, years: 10 });
    expect(result.summary["Monthly SIP required"]).toBeGreaterThan(0);
  });

  it("calculates PPF with a 15 year schedule", () => {
    const result = runCalculator("ppf", { yearlyInvestment: 150000, annualReturn: 7.1, years: 15 });
    expect(result.summary["Maturity value"]).toBeCloseTo(4068209.22, 1);
    expect(result.schedule).toHaveLength(15);
  });

  it("models SWP depletion without a negative balance", () => {
    const result = runCalculator("swp", { corpus: 100000, monthlyWithdrawal: 10000, annualReturn: 0, years: 1 });
    expect(result.summary["Corpus remaining"]).toBe(0);
    expect(result.schedule.at(-1)?.value).toBe(0);
  });

  it("calculates IRR and XIRR rate outputs", () => {
    const irr = runCalculator("irr", { cashflows: "-100000,30000,35000,40000" });
    const xirr = runCalculator("xirr", { cashflows: "-100000,25000,30000,35000,40000" });
    expect(irr.rate).toBeCloseTo(2.3647, 4);
    expect(xirr.rate).toBeCloseTo(230.8397, 4);
  });

  it("rejects all-positive, all-negative, and insufficient cashflows", () => {
    expect(runCalculator("irr", { cashflows: "100,200,300" }).error).toBe(CASHFLOW_SIGN_MESSAGE);
    expect(runCalculator("xirr", { cashflows: "-100,-200,-300" }).error).toBe(CASHFLOW_SIGN_MESSAGE);
    expect(runCalculator("irr", { cashflows: "-100" }).error).toBe("Enter at least two valid cashflow entries.");
  });

  it("does not return a misleading rate when the cashflow solver fails", () => {
    const result = runCalculator("xirr", { cashflows: "-100,0.000001" });

    expect(result.error).toBe(RATE_FAILURE_MESSAGE);
    expect(result.rate).toBeUndefined();
    expect(result.summary.XIRR).toBe(RATE_FAILURE_MESSAGE);
  });

  it("covers comparison and step-up calculators", () => {
    const stepUp = runCalculator("stepUpSip", { monthlyInvestment: 10000, annualReturn: 12, years: 10, annualIncrease: 10 });
    const comparison = runCalculator("sipVsLumpsum", { monthlyInvestment: 10000, principal: 500000, annualReturn: 12, years: 10 });
    expect(stepUp.summary["Future value"]).toBeGreaterThan(3000000);
    expect(comparison.chart).toHaveLength(2);
  });
});
