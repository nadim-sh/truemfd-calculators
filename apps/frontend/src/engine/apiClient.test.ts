import { afterEach, describe, expect, it, vi } from "vitest";
import { runCalculatorApi } from "./apiClient";

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps frontend inputs to backend payloads and normalizes the response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        calculator: "standard-sip",
        result: { future_value: 2323391.25, total_investment: 1200000, gain: 1123391.25 },
        schedule: [{ period: 1, invested: 10000, value: 10100 }],
        chart: [{ label: "1", value: 10100 }]
      })
    } as Response);

    const result = await runCalculatorApi("standardSip", { monthlyInvestment: 10000, annualReturn: 12, years: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/calculators/standard-sip",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ monthly_investment: 10000, annual_return: 12, years: 10 })
      })
    );
    expect(result.summary["Future value"]).toBe(2323391.25);
    expect(result.futureValue).toBe(2323391.25);
  });

  it("surfaces API validation messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: "Input should be greater than or equal to 15" }] })
    } as Response);

    await expect(runCalculatorApi("ppf", { yearlyInvestment: 150000, annualReturn: 7.1, years: 10 })).rejects.toThrow(
      "API validation failed"
    );
  });

  it("labels rate responses for IRR and XIRR", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        calculator: "xirr",
        result: { rate: 230.8397 },
        schedule: [{ period: 0, cashflow: -100000 }],
        chart: [{ label: "0", value: -100000 }]
      })
    } as Response);

    const result = await runCalculatorApi("xirr", { cashflows: "-100000,25000,30000,35000,40000" });

    expect(result.summary.XIRR).toBe(230.8397);
    expect(result.rate).toBe(230.8397);
  });
}
);
