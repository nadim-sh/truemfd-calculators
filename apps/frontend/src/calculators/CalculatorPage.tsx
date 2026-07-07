import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Copy, Download, FileText, Printer, RotateCcw, Share2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalculatorDefinition, FieldName } from "./types";
import { CASHFLOW_SIGN_MESSAGE, CalculatorResult, runCalculator } from "../engine/financialEngine";
import { runCalculatorApi } from "../engine/apiClient";
import { exportCsv, exportPdf, printPage, shareResult } from "../core/exports";
import { formatChartValue, formatResultValue, formatScheduleValue, formatSummary, summaryText } from "../core/resultFormatting";
import { copyText } from "../core/clipboard";
import { BrandFooter } from "../core/BrandFooter";
import { MobileNav } from "../core/MobileNav";
import { BrandHeader } from "../core/BrandHeader";
import { applySeo } from "../core/Seo";
import { InstallPrompt } from "../core/InstallPrompt";

type FormValues = Record<string, number | string>;

const fieldLabels: Record<string, string> = {
  monthlyInvestment: "Monthly investment",
  annualReturn: "Expected annual return %",
  years: "Years",
  annualIncrease: "Annual increase %",
  principal: "Lumpsum amount",
  goalAmount: "Goal amount",
  corpus: "Starting corpus",
  monthlyWithdrawal: "Monthly withdrawal",
  yearlyInvestment: "Yearly investment",
  cashflows: "Cashflows"
};

const defaults: FormValues = {
  monthlyInvestment: 10000,
  annualReturn: 12,
  years: 10,
  annualIncrease: 10,
  annualStepUpAmount: 1000,
  stepUpType: "percentage",
  principal: 500000,
  goalAmount: 2500000,
  corpus: 5000000,
  monthlyWithdrawal: 40000,
  yearlyInvestment: 150000,
  cashflows: "-100000,25000,30000,35000,40000"
};

export function CalculatorPage({ calculator }: { calculator: CalculatorDefinition }) {
  const params = new URLSearchParams(window.location.search);
  const pageDefaults: FormValues = { ...defaults, ...(calculator.engine === "ppf" ? { years: 15 } : {}) };
  const hydrated = {
    ...Object.fromEntries(calculator.fields.map((field) => [field, params.get(field) ?? pageDefaults[field]])),
    ...(calculator.engine === "stepUpSip" ? {
      stepUpType: params.get("stepUpType") ?? pageDefaults.stepUpType,
      annualStepUpAmount: params.get("annualStepUpAmount") ?? pageDefaults.annualStepUpAmount
    } : {})
  };
  const { register, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({ defaultValues: hydrated, mode: "onChange" });
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<CalculatorResult | null>(null);
  const [source, setSource] = useState<"local" | "api">("local");
  const [message, setMessage] = useState("Instant estimate shown. Calculate to verify with the API.");
  const [submittedSnapshot, setSubmittedSnapshot] = useState("");
  const watched = watch();
  const stepUpType = String(watched.stepUpType ?? "percentage");
  const localResult = useMemo(() => runCalculator(calculator.engine, watched), [calculator.engine, watched]);
  const result = apiResult ?? localResult;
  const watchedSnapshot = JSON.stringify(watched);

  useEffect(() => {
    applySeo({
      title: `${calculator.name} | calculators@TrueMFD`,
      description: calculator.summary,
      canonical: `https://truemfd-calculators-web.onrender.com/calculators/${calculator.slug}`
    });
  }, [calculator.name, calculator.slug, calculator.summary]);

  useEffect(() => {
    if (apiResult && watchedSnapshot !== submittedSnapshot) {
      setApiResult(null);
      setSource("local");
      setMessage("Inputs changed. Verifying updated estimate with the API.");
    }
  }, [apiResult, submittedSnapshot, watchedSnapshot]);

  useEffect(() => {
    if (localResult.error) {
      setApiResult(null);
      setSource("local");
      return;
    }

    const values = watched;
    const next = new URLSearchParams();
    calculator.fields.forEach((field) => next.set(field, String(values[field])));
    if (calculator.engine === "stepUpSip") {
      next.set("stepUpType", String(values.stepUpType ?? "percentage"));
      next.set("annualStepUpAmount", String(values.annualStepUpAmount ?? pageDefaults.annualStepUpAmount));
    }
    window.history.replaceState(null, "", `?${next.toString()}`);

    const loadingTimer = window.setTimeout(() => setLoading(true), 500);
    const requestTimer = window.setTimeout(async () => {
      try {
        const verified = await runCalculatorApi(calculator.engine, values);
        setApiResult(verified);
        setSource("api");
        setSubmittedSnapshot(JSON.stringify(values));
        setMessage("API result loaded successfully.");
      } catch (error) {
        setApiResult(null);
        setSource("local");
        setMessage(`${error instanceof Error ? error.message : "API request failed"}. Showing instant estimate instead.`);
      } finally {
        window.clearTimeout(loadingTimer);
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(loadingTimer);
      window.clearTimeout(requestTimer);
      setLoading(false);
    };
  }, [calculator.engine, calculator.fields, localResult.error, watchedSnapshot]);

  async function copyResult() {
    setMessage((await copyText(summaryText(calculator.name, result.summary))) ? "Result copied." : "Copy failed. Select and copy the result manually.");
  }

  return (
    <main>
      <section className="page-hero">
        <BrandHeader />
        <p className="breadcrumb">Home &gt; Calculators &gt; {calculator.name}</p>
        <p className="eyebrow">{calculator.category}</p>
        <h1>{calculator.name}</h1>
        <p>{calculator.summary}</p>
      </section>

      <section className="workspace">
        <aside className="panel calculator-brief" aria-label={`${calculator.name} details`}>
          <div>
            <p className="eyebrow">{calculator.category} calculator</p>
            <h2>{calculator.name}</h2>
            <p>{calculator.summary}</p>
          </div>
          <div className="brief-card">
            <h3>Who should use it</h3>
            <p>{whoShouldUse(calculator)}</p>
          </div>
          <div className="brief-card">
            <h3>Key benefits</h3>
            <ul>{benefitsFor(calculator).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="brief-card">
            <h3>Formula used</h3>
            <p>{formulaFor(calculator)}</p>
          </div>
          <div className="brief-card">
            <h3>Assumptions</h3>
            <ul>{assumptionsFor(calculator).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </aside>

        <form className="panel form-panel">
          {calculator.fields.map((field) => field === "cashflows" ? (
            <label key={field}>
              <span>{fieldLabels[field]}</span>
              <textarea {...register(field, fieldRules(field, calculator.engine))} aria-invalid={Boolean(errors[field])} />
              {errors[field]?.message && <small className="field-error">{String(errors[field]?.message)}</small>}
            </label>
          ) : calculator.engine === "stepUpSip" && field === "annualIncrease" ? (
            <div key={field} className="step-up-control">
              <div className="segmented-control" role="radiogroup" aria-label="Step-up mode">
                <button type="button" className={stepUpType === "percentage" ? "active" : ""} onClick={() => setValue("stepUpType", "percentage", { shouldDirty: true })}>% Percentage</button>
                <button type="button" className={stepUpType === "fixed_amount" ? "active" : ""} onClick={() => setValue("stepUpType", "fixed_amount", { shouldDirty: true })}>Rs Fixed Amount</button>
              </div>
              {stepUpType === "fixed_amount" ? (
                <label className="range-field">
                  <span>Annual Increase (Rs)</span>
                  <strong>{formatCurrency(Number(watched.annualStepUpAmount ?? pageDefaults.annualStepUpAmount ?? 0))}</strong>
                  <input type="number" min={0} max={100000} step={500} {...register("annualStepUpAmount", stepUpRules("fixed_amount"))} aria-invalid={Boolean(errors.annualStepUpAmount)} />
                  <input type="range" min={0} max={100000} step={500} value={Number(watched.annualStepUpAmount ?? pageDefaults.annualStepUpAmount ?? 0)} onChange={(event) => setValue("annualStepUpAmount", Number(event.target.value), { shouldValidate: true, shouldDirty: true })} />
                  <small className="field-hint">Your SIP increases by {formatCurrency(Number(watched.annualStepUpAmount ?? 0))} every year.</small>
                  {errors.annualStepUpAmount?.message && <small className="field-error">{String(errors.annualStepUpAmount?.message)}</small>}
                </label>
              ) : (
                <label className="range-field">
                  <span>Annual Step-Up (%)</span>
                  <strong>{formatInputValue(field, Number(watched[field] ?? pageDefaults[field] ?? 0))}</strong>
                  <input type="number" min={0} max={30} step={0.01} {...register(field, fieldRules(field, calculator.engine))} aria-invalid={Boolean(errors[field])} />
                  <input type="range" min={0} max={30} step={0.01} value={Number(watched[field] ?? pageDefaults[field] ?? 0)} onChange={(event) => setValue(field, Number(event.target.value), { shouldValidate: true, shouldDirty: true })} />
                  <small className="field-hint">Your SIP grows by {Number(watched[field] ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}% every year.</small>
                  {errors[field]?.message && <small className="field-error">{String(errors[field]?.message)}</small>}
                </label>
              )}
            </div>
          ) : (
            <label key={field} className="range-field">
              <span>{fieldLabels[field]}</span>
              <strong>{formatInputValue(field, Number(watched[field] ?? pageDefaults[field] ?? 0))}</strong>
              <input type="number" min={fieldRange(field, calculator.engine).min} max={fieldRange(field, calculator.engine).max} step={field === "years" ? 1 : 0.01} {...register(field, fieldRules(field, calculator.engine))} aria-invalid={Boolean(errors[field])} />
              <input type="range" min={fieldRange(field, calculator.engine).min} max={fieldRange(field, calculator.engine).max} step={field === "years" ? 1 : 0.01} value={Number(watched[field] ?? pageDefaults[field] ?? 0)} onChange={(event) => setValue(field, Number(event.target.value), { shouldValidate: true, shouldDirty: true })} />
              {errors[field]?.message && <small className="field-error">{String(errors[field]?.message)}</small>}
            </label>
          ))}
          <div className="toolbar">
            <span className={`auto-calc-note ${loading ? "is-loading" : ""}`}>{loading ? "Verifying..." : "Auto-calculates as you edit."}</span>
            <button type="button" className="icon-button" aria-label="Reset" onClick={() => { reset(pageDefaults); setApiResult(null); setSource("local"); setMessage("Inputs reset. Instant estimate shown."); }}><RotateCcw /></button>
          </div>
        </form>

        <section className="panel result-panel" aria-live="polite">
          <div className={`result-status ${source === "api" ? "success" : "notice"}`}>
            <strong>{result.error ? "Needs valid cashflows" : source === "api" ? "API result" : "Instant estimate"}</strong>
            <span>{result.error ?? message}</span>
          </div>
          <div className="result-grid">
            {Object.entries(result.summary).map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <CountedResult label={label} value={value} />
              </div>
            ))}
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={result.chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Area dataKey="value" stroke="#8f5f24" fill="#eadfca" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {result.schedule.length > 0 && (
            <div className="schedule-preview" aria-label="Year-wise schedule preview">
              <div className="schedule-heading">
                <h2>Year-wise schedule</h2>
                <span>Preview of export data</span>
              </div>
              <div className="schedule-scroll">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(result.schedule[0]).map((label) => <th key={label}>{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.slice(0, 8).map((row, index) => (
                      <tr key={index}>
                        {Object.entries(row).map(([label, value]) => <td key={label}>{formatScheduleValue(label, value)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="toolbar">
            <button type="button" className="icon-button" aria-label="Copy result" onClick={copyResult}><Copy /></button>
            <button type="button" className="icon-button" aria-label="Export Excel CSV" onClick={() => exportCsv(calculator.slug, result.schedule)}><Download /></button>
            <button type="button" className="icon-button" aria-label="Export PDF" onClick={() => exportPdf(calculator.slug, formatSummary(result.summary), result.schedule)}><FileText /></button>
            <button type="button" className="icon-button" aria-label="Print" onClick={printPage}><Printer /></button>
            <button type="button" className="icon-button" aria-label="Share" onClick={async () => setMessage((await shareResult(calculator.name, summaryText(calculator.name, result.summary))) ? "Share details copied." : "Share failed. Copy the page URL manually.")}><Share2 /></button>
          </div>
        </section>
      </section>

      <section className="section education">
        {["What does this calculator do?", "How is it calculated?", "Assumptions", "Limitations", "Investor education"].map((title) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>This calculator provides an educational projection using the values entered above. Actual outcomes can vary with market returns, timing, taxes, expenses, and product rules.</p>
          </article>
        ))}
      </section>
      <BrandFooter />
      <InstallPrompt />
      <MobileNav />
    </main>
  );
}

function CountedResult({ label, value }: { label: string; value: number | string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 800;
    const from = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <strong>{formatResultValue(label, display)}</strong>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function formatInputValue(field: FieldName, value: number) {
  if (field === "annualReturn" || field === "annualIncrease") return `${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
  if (field === "years") return `${value.toLocaleString("en-IN")} years`;
  return formatCurrency(value);
}

function fieldRange(field: FieldName, engine: CalculatorDefinition["engine"]) {
  const ranges: Partial<Record<FieldName, { min: number; max: number }>> = {
    monthlyInvestment: { min: 1000, max: 100000 },
    annualReturn: { min: 1, max: engine === "ppf" ? 20 : 30 },
    years: { min: engine === "ppf" ? 15 : 1, max: engine === "ppf" ? 50 : 40 },
    annualIncrease: { min: 0, max: 30 },
    principal: { min: 10000, max: 10000000 },
    goalAmount: { min: 100000, max: 50000000 },
    corpus: { min: 100000, max: 50000000 },
    monthlyWithdrawal: { min: 1000, max: 500000 },
    yearlyInvestment: { min: 500, max: 150000 }
  };
  return ranges[field] ?? { min: 0, max: 100 };
}

function fieldRules(field: FieldName, engine: CalculatorDefinition["engine"]) {
  if (field === "cashflows") {
    return {
      required: "Enter at least two cashflows.",
      validate: (value: string | number) => {
        const cashflows = String(value).split(",").map((item) => Number(item.trim())).filter(Number.isFinite);
        if (cashflows.length < 2) return "Enter at least two valid cashflow entries.";
        if (!cashflows.some((cashflow) => cashflow < 0) || !cashflows.some((cashflow) => cashflow > 0)) return CASHFLOW_SIGN_MESSAGE;
        return true;
      }
    };
  }

  const min = field === "years" && engine === "ppf" ? 15 : 0;
  const max = field === "yearlyInvestment" ? 150000 : field === "annualReturn" && engine === "ppf" ? 20 : field === "annualReturn" ? 100 : field === "years" ? 60 : undefined;
  return {
    required: `${fieldLabels[field]} is required.`,
    valueAsNumber: true,
    min: { value: min, message: field === "years" && engine === "ppf" ? "PPF requires at least 15 years." : "Enter zero or more." },
    ...(max == null ? {} : { max: { value: max, message: `Enter ${max} or less.` } }),
    validate: (value: string | number) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) return `${fieldLabels[field]} is required.`;
      if (field === "years" && !Number.isInteger(numericValue)) return "Enter whole years only.";
      return true;
    }
  };
}

function stepUpRules(type: "percentage" | "fixed_amount") {
  return {
    required: type === "fixed_amount" ? "Annual increase is required." : "Annual step-up is required.",
    valueAsNumber: true,
    min: { value: 0, message: "Enter zero or more." },
    max: { value: type === "fixed_amount" ? 100000 : 30, message: type === "fixed_amount" ? "Enter Rs 1,00,000 or less." : "Enter 30 or less." },
    validate: (value: string | number) => Number.isFinite(Number(value)) || "Enter a valid number."
  };
}

function assumptionsFor(calculator: CalculatorDefinition) {
  const common = calculator.fields
    .filter((field) => field !== "cashflows")
    .map((field) => fieldLabels[field] ?? field);
  if (calculator.engine === "stepUpSip") return [...common, "Step-up mode can be percentage or fixed yearly rupee increase"];
  if (calculator.engine === "irr" || calculator.engine === "xirr") return ["Cashflows must include at least one outflow and one inflow", "Rates are solver-based and depend on the cashflow pattern"];
  if (calculator.engine === "ppf") return [...common, "PPF illustration assumes yearly compounding and current input rate"];
  return common;
}

function whoShouldUse(calculator: CalculatorDefinition) {
  const map: Record<string, string> = {
    "standard-sip": "Investors planning a disciplined monthly investment.",
    "step-up-sip": "Investors who expect income growth and want to raise SIPs yearly.",
    lumpsum: "Investors deploying a one-time amount for long-term growth.",
    "goal-sip": "Families planning for a target such as education, home, or retirement.",
    swp: "Investors planning regular withdrawals from an existing corpus.",
    ppf: "Investors evaluating long-term tax-efficient fixed-income accumulation.",
    "sip-vs-lumpsum": "Investors comparing monthly investing with a one-time allocation.",
    xirr: "Investors measuring irregular cashflow returns.",
    irr: "Investors measuring periodic cashflow returns."
  };
  return map[calculator.slug] ?? "Investors comparing planning scenarios.";
}

function benefitsFor(calculator: CalculatorDefinition) {
  if (calculator.engine === "stepUpSip") return ["Compare percentage and fixed rupee step-ups", "See final monthly SIP", "Review year-wise schedule"];
  if (calculator.engine === "irr" || calculator.engine === "xirr") return ["Validate cashflow signs", "Estimate return rate", "Copy or export results"];
  return ["Live result updates", "Chart and schedule output", "Copy, PDF, and CSV export"];
}

function formulaFor(calculator: CalculatorDefinition) {
  const map: Record<string, string> = {
    standardSip: "Monthly SIP future value using monthly compounding.",
    stepUpSip: "Year-wise SIP contribution compounded monthly, using selected step-up mode.",
    lumpsum: "Future value = principal x (1 + annual return) ^ years.",
    goalSip: "Required SIP derived from target future value and monthly compounding.",
    swp: "Corpus grows monthly, then planned withdrawal is deducted.",
    ppf: "Yearly contribution compounded annually at the entered rate.",
    sipVsLumpsum: "Compares SIP future value against lumpsum future value.",
    xirr: "Annualized solver-based return for irregular cashflows.",
    irr: "Periodic solver-based return for cashflow series."
  };
  return map[calculator.engine];
}
