import pytest
from pytest import approx

from app.financial_engine.engine import (
    CASHFLOW_SIGN_MESSAGE,
    RATE_FAILURE_MESSAGE,
    CalculationError,
    goal_sip,
    irr,
    ppf,
    standard_sip,
    swp,
    xirr,
)


def test_standard_sip_generates_schedule():
    result = standard_sip(10000, 12, 10)
    assert result["result"]["future_value"] > 2_300_000
    assert len(result["schedule"]) == 120


def test_goal_sip_required_amount_is_positive():
    result = goal_sip(2_500_000, 12, 10)
    assert result["result"]["monthly_sip_required"] > 0


def test_ppf_uses_yearly_compounding_schedule():
    result = ppf(150000, 7.1, 15)
    assert result["calculator"] == "ppf"
    assert result["result"]["maturity_value"] == approx(4_068_209.857, rel=1e-6)
    assert result["result"]["total_investment"] == 2_250_000
    assert len(result["schedule"]) == 15


def test_swp_stops_at_zero_when_withdrawals_exhaust_corpus():
    result = swp(100000, 10000, 0, 1)
    assert result["result"]["corpus_remaining"] == 0
    assert result["schedule"][-1]["value"] == 0


def test_irr_solves_periodic_cashflows():
    result = irr([-100000, 30000, 35000, 40000])
    assert result["calculator"] == "irr"
    assert result["result"]["rate"] == approx(2.3647, abs=0.0001)


def test_xirr_returns_annualized_periodic_cashflow_rate():
    result = xirr([-100000, 25000, 30000, 35000, 40000])
    assert result["calculator"] == "xirr"
    assert result["result"]["rate"] == approx(230.8397, abs=0.0001)


def test_rate_calculators_reject_invalid_cashflow_signs_and_counts():
    with pytest.raises(CalculationError, match=CASHFLOW_SIGN_MESSAGE):
        irr([100, 200, 300])

    with pytest.raises(CalculationError, match=CASHFLOW_SIGN_MESSAGE):
        xirr([-100, -200, -300])

    with pytest.raises(CalculationError, match="Enter at least two valid cashflow entries."):
        irr([-100])


def test_rate_calculators_reject_non_convergent_or_invalid_results():
    with pytest.raises(CalculationError, match=RATE_FAILURE_MESSAGE):
        xirr([-100, 0.000001])
