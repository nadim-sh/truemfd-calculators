import { CalculatorDefinition } from "./types";

export const calculators: CalculatorDefinition[] = [
  { slug: "standard-sip", name: "Standard SIP", category: "SIP", summary: "Estimate future value, investment, gains, chart, and monthly schedule.", fields: ["monthlyInvestment", "annualReturn", "years"], engine: "standardSip" },
  { slug: "step-up-sip", name: "Step Up SIP", category: "SIP", summary: "Project annual contribution increases with a year-wise schedule.", fields: ["monthlyInvestment", "annualReturn", "years", "annualIncrease"], engine: "stepUpSip" },
  { slug: "lumpsum", name: "Lumpsum", category: "Growth", summary: "Estimate future value and wealth growth from a one-time investment.", fields: ["principal", "annualReturn", "years"], engine: "lumpsum" },
  { slug: "goal-sip", name: "Goal SIP", category: "Goal", summary: "Calculate monthly SIP required for a future target amount.", fields: ["goalAmount", "annualReturn", "years"], engine: "goalSip" },
  { slug: "swp", name: "SWP", category: "Withdrawal", summary: "Model monthly withdrawals and remaining corpus over time.", fields: ["corpus", "monthlyWithdrawal", "annualReturn", "years"], engine: "swp" },
  { slug: "ppf", name: "PPF", category: "Government", summary: "Plan PPF maturity with configurable rate and extension period.", fields: ["yearlyInvestment", "annualReturn", "years"], engine: "ppf" },
  { slug: "sip-vs-lumpsum", name: "SIP vs Lumpsum", category: "Comparison", summary: "Compare disciplined monthly investing with one-time investing.", fields: ["monthlyInvestment", "principal", "annualReturn", "years"], engine: "sipVsLumpsum" },
  { slug: "xirr", name: "XIRR", category: "Returns", summary: "Calculate annualized returns for dated irregular cashflows.", fields: ["cashflows"], engine: "xirr" },
  { slug: "irr", name: "IRR", category: "Returns", summary: "Calculate periodic return for cashflow series.", fields: ["cashflows"], engine: "irr" }
];
