export type EngineName = "standardSip" | "stepUpSip" | "lumpsum" | "goalSip" | "swp" | "ppf" | "sipVsLumpsum" | "xirr" | "irr";

export type FieldName = "monthlyInvestment" | "annualReturn" | "years" | "annualIncrease" | "principal" | "goalAmount" | "corpus" | "monthlyWithdrawal" | "yearlyInvestment" | "cashflows";

export interface CalculatorDefinition {
  slug: string;
  name: string;
  category: string;
  summary: string;
  fields: FieldName[];
  engine: EngineName;
}
