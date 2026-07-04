const frontendUrl = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";

const calculators = [
  ["standard-sip", { monthly_investment: 10000, annual_return: 12, years: 10 }],
  ["step-up-sip", { monthly_investment: 10000, annual_return: 12, years: 10, annual_increase: 10 }],
  ["lumpsum", { principal: 500000, annual_return: 12, years: 10 }],
  ["goal-sip", { goal_amount: 2500000, annual_return: 12, years: 10 }],
  ["swp", { corpus: 5000000, monthly_withdrawal: 40000, annual_return: 8, years: 10 }],
  ["ppf", { yearly_investment: 150000, annual_return: 7.1, years: 15 }],
  ["sip-vs-lumpsum", { monthly_investment: 10000, principal: 500000, annual_return: 12, years: 10 }],
  ["xirr", { cashflows: [-100000, 25000, 30000, 35000, 40000] }],
  ["irr", { cashflows: [-100000, 25000, 30000, 35000, 40000] }]
];

await assertOk(`${frontendUrl}/`, "frontend");
await assertJson(`${apiUrl}/api/v1/health`, "health", (body) => body.status === "healthy");

for (const [slug, payload] of calculators) {
  await assertJson(`${apiUrl}/api/v1/calculators/${slug}`, slug, (body) => {
    return body.calculator === slug && body.result && Array.isArray(body.chart);
  }, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

const invalidPpf = await fetch(`${apiUrl}/api/v1/calculators/ppf`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ yearly_investment: 150000, annual_return: 7.1, years: 10 })
});
if (invalidPpf.status !== 422) throw new Error(`invalid PPF expected 422, got ${invalidPpf.status}`);

console.log(`Smoke passed: ${calculators.length} calculators verified against ${apiUrl}`);

async function assertOk(url, label) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} failed with ${response.status}`);
}

async function assertJson(url, label, validate, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${label} failed with ${response.status}`);
  const body = await response.json();
  if (!validate(body)) throw new Error(`${label} returned an unexpected response`);
}
