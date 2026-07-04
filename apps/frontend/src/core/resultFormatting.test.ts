import { describe, expect, it } from "vitest";
import { formatChartValue, formatResultValue, formatScheduleValue, formatSummary, summaryText } from "./resultFormatting";

describe("result formatting", () => {
  it("formats currency summary fields as rupees", () => {
    expect(formatResultValue("Future value", 2323391.25)).toBe("\u20B923,23,391");
    expect(formatResultValue("Monthly SIP required", 10761.7)).toBe("\u20B910,762");
    expect(formatResultValue("Starting corpus", 5000000)).toBe("\u20B950,00,000");
  });

  it("formats rates, years, and counts without rupee symbols", () => {
    expect(formatResultValue("XIRR", 230.8397)).toBe("230.84%");
    expect(formatResultValue("IRR", 2.3647)).toBe("2.36%");
    expect(formatResultValue("Years", 15)).toBe("15");
    expect(formatResultValue("Cashflows", 5)).toBe("5");
  });

  it("uses the same labels for exported and copied summaries", () => {
    const summary = { XIRR: 230.8397, Cashflows: 5 };

    expect(formatSummary(summary)).toEqual({ XIRR: "230.84%", Cashflows: "5" });
    expect(summaryText("XIRR", summary)).toBe("XIRR\nXIRR: 230.84%\nCashflows: 5");
  });

  it("formats schedule and chart values for exports and tooltips", () => {
    expect(formatScheduleValue("period", 12)).toBe("12");
    expect(formatScheduleValue("cashflow", -100000)).toBe("-\u20B91,00,000");
    expect(formatScheduleValue("value", 2323391.25)).toBe("\u20B923,23,391");
    expect(formatChartValue(10100)).toBe("\u20B910,100");
  });
});
