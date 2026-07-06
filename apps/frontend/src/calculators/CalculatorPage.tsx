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

type FormValues = Record<string, number | string>;

const fieldLabels: Record<FieldName, string> = {
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
  const hydrated = Object.fromEntries(calculator.fields.map((field) => [field, params.get(field) ?? pageDefaults[field]]));
  const { register, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({ defaultValues: hydrated, mode: "onChange" });
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<CalculatorResult | null>(null);
  const [source, setSource] = useState<"local" | "api">("local");
  const [message, setMessage] = useState("Instant estimate shown. Calculate to verify with the API.");
  const [submittedSnapshot, setSubmittedSnapshot] = useState("");
  const watched = watch();
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
        <form className="panel form-panel">
          {calculator.fields.map((field) => field === "cashflows" ? (
            <label key={field}>
              <span>{fieldLabels[field]}</span>
              <textarea {...register(field, fieldRules(field, calculator.engine))} aria-invalid={Boolean(errors[field])} />
              {errors[field]?.message && <small className="field-error">{String(errors[field]?.message)}</small>}
            </label>
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

function formatInputValue(field: FieldName, value: number) {
  if (field === "annualReturn" || field === "annualIncrease") return `${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
  if (field === "years") return `${value.toLocaleString("en-IN")} years`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
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
