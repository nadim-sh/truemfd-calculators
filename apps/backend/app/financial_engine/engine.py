from __future__ import annotations

from math import isfinite


class CalculationError(ValueError):
    pass


CASHFLOW_SIGN_MESSAGE = "IRR/XIRR requires at least one investment outflow and one return inflow."
RATE_FAILURE_MESSAGE = "IRR/XIRR could not find a reliable rate for these cashflows."
MIN_RATE = -0.999999
MAX_ITERATIONS = 60
NPV_TOLERANCE = 1e-7


def standard_sip(monthly: float, annual_return: float, years: int) -> dict:
    months = years * 12
    rate = annual_return / 1200
    future_value = monthly * months if rate == 0 else monthly * (((1 + rate) ** months - 1) / rate) * (1 + rate)
    invested = monthly * months
    schedule = [
        {
            "period": month,
            "invested": monthly * month,
            "value": monthly * month if rate == 0 else monthly * (((1 + rate) ** month - 1) / rate) * (1 + rate),
        }
        for month in range(1, months + 1)
    ]
    return response("standard-sip", {"future_value": future_value, "total_investment": invested, "gain": future_value - invested}, schedule)


def step_up_sip(
    monthly: float,
    annual_return: float,
    years: int,
    annual_increase: float,
    step_up_type: str = "percentage",
    annual_step_up_amount: float = 0,
) -> dict:
    monthly_rate = annual_return / 1200
    value = 0.0
    invested = 0.0
    schedule = []
    flat = standard_sip(monthly, annual_return, years)["result"]["future_value"]
    for year in range(1, years + 1):
        contribution = (
            monthly + annual_step_up_amount * (year - 1)
            if step_up_type == "fixed_amount"
            else monthly * (1 + annual_increase / 100) ** (year - 1)
        )
        year_investment = contribution * 12
        for _ in range(12):
            value = (value + contribution) * (1 + monthly_rate)
            invested += contribution
        schedule.append(
            {
                "period": year,
                "monthly_sip": contribution,
                "annual_investment": year_investment,
                "cumulative_invested": invested,
                "invested": invested,
                "value": value,
                "gain": value - invested,
            }
        )
    return response(
        "step-up-sip",
        {
            "total_investment": invested,
            "future_value": value,
            "gain": value - invested,
            "final_monthly_sip": contribution if years else monthly,
            "extra_gain_vs_flat_sip": value - flat,
        },
        schedule,
    )


def lumpsum(principal: float, annual_return: float, years: int) -> dict:
    schedule = [
        {"period": year, "invested": principal, "value": principal * (1 + annual_return / 100) ** year}
        for year in range(1, years + 1)
    ]
    future_value = schedule[-1]["value"]
    return response("lumpsum", {"future_value": future_value, "total_investment": principal, "gain": future_value - principal}, schedule)


def goal_sip(goal_amount: float, annual_return: float, years: int) -> dict:
    months = years * 12
    rate = annual_return / 1200
    monthly = goal_amount / months if rate == 0 else goal_amount / ((((1 + rate) ** months - 1) / rate) * (1 + rate))
    result = standard_sip(monthly, annual_return, years)
    result["calculator"] = "goal-sip"
    result["result"] = {"monthly_sip_required": monthly, "goal_amount": goal_amount, "years": years}
    return result


def swp(corpus: float, monthly_withdrawal: float, annual_return: float, years: int) -> dict:
    rate = annual_return / 1200
    balance = corpus
    schedule = []
    for month in range(1, years * 12 + 1):
        balance = max(0, balance * (1 + rate) - monthly_withdrawal)
        schedule.append({"period": month, "withdrawal": monthly_withdrawal, "value": balance})
    return response("swp", {"corpus_remaining": balance, "total_withdrawal": monthly_withdrawal * years * 12}, schedule)


def ppf(yearly_investment: float, annual_return: float, years: int) -> dict:
    value = 0.0
    schedule = []
    for year in range(1, years + 1):
        value = (value + yearly_investment) * (1 + annual_return / 100)
        schedule.append({"period": year, "invested": yearly_investment * year, "value": value})
    return response("ppf", {"maturity_value": value, "total_investment": yearly_investment * years, "interest": value - yearly_investment * years}, schedule)


def sip_vs_lumpsum(monthly: float, principal: float, annual_return: float, years: int) -> dict:
    sip = standard_sip(monthly, annual_return, years)["result"]["future_value"]
    lump = lumpsum(principal, annual_return, years)["result"]["future_value"]
    return {
        "calculator": "sip-vs-lumpsum",
        "result": {"sip_value": sip, "lumpsum_value": lump, "recommendation": "sip" if sip > lump else "lumpsum"},
        "schedule": [],
        "chart": [{"label": "SIP", "value": sip}, {"label": "Lumpsum", "value": lump}],
    }


def irr(cashflows: list[float]) -> dict:
    return _rate_response("irr", cashflows, annualized=False)


def xirr(cashflows: list[float]) -> dict:
    return _rate_response("xirr", cashflows, annualized=True)


def _rate_response(name: str, cashflows: list[float], annualized: bool) -> dict:
    validate_cashflows(cashflows)
    rate = solve_periodic_rate(cashflows)
    final_rate = ((1 + rate) ** 12 - 1) * 100 if annualized else rate * 100
    if not isfinite(final_rate):
        raise CalculationError(RATE_FAILURE_MESSAGE)
    schedule = [{"period": index, "cashflow": cashflow} for index, cashflow in enumerate(cashflows)]
    return response(name, {"rate": final_rate}, schedule)


def validate_cashflows(cashflows: list[float]) -> None:
    valid = [cashflow for cashflow in cashflows if isfinite(cashflow)]
    if len(valid) < 2:
        raise CalculationError("Enter at least two valid cashflow entries.")
    if not any(cashflow < 0 for cashflow in valid) or not any(cashflow > 0 for cashflow in valid):
        raise CalculationError(CASHFLOW_SIGN_MESSAGE)


def solve_periodic_rate(cashflows: list[float]) -> float:
    rate = 0.1
    for _ in range(MAX_ITERATIONS):
        value = sum(cashflow / (1 + rate) ** index for index, cashflow in enumerate(cashflows))
        derivative = sum(-(index * cashflow) / (1 + rate) ** (index + 1) for index, cashflow in enumerate(cashflows))
        if abs(derivative) < 1e-9:
            break
        next_rate = rate - value / derivative
        if not isfinite(next_rate) or next_rate <= MIN_RATE:
            raise CalculationError(RATE_FAILURE_MESSAGE)
        if abs(next_rate - rate) < 1e-10:
            rate = next_rate
            break
        rate = next_rate

    residual = sum(cashflow / (1 + rate) ** index for index, cashflow in enumerate(cashflows))
    scale = max(1.0, sum(abs(cashflow) for cashflow in cashflows))
    if not isfinite(rate) or abs(residual) / scale > NPV_TOLERANCE:
        raise CalculationError(RATE_FAILURE_MESSAGE)
    return rate


def response(calculator: str, result: dict, schedule: list[dict]) -> dict:
    return {
        "calculator": calculator,
        "result": result,
        "schedule": schedule,
        "chart": [{"label": str(row["period"]), "value": row.get("value", row.get("cashflow", 0))} for row in schedule],
    }
