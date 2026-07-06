from fastapi import APIRouter, HTTPException

from app.financial_engine.engine import (
    CalculationError,
    goal_sip,
    irr,
    lumpsum,
    ppf,
    sip_vs_lumpsum,
    standard_sip,
    step_up_sip,
    swp,
    xirr,
)
from app.schemas.calculators import (
    CashflowRequest,
    GoalSipRequest,
    LumpsumRequest,
    PpfRequest,
    SipRequest,
    SipVsLumpsumRequest,
    StepUpSipRequest,
    SwpRequest,
)

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "calculators@TrueMFD"}


@router.post("/calculators/standard-sip")
def standard_sip_endpoint(payload: SipRequest):
    return standard_sip(payload.monthly_investment, payload.annual_return, payload.years)


@router.post("/calculators/step-up-sip")
def step_up_sip_endpoint(payload: StepUpSipRequest):
    return step_up_sip(
        payload.monthly_investment,
        payload.annual_return,
        payload.years,
        payload.annual_increase,
        payload.step_up_type,
        payload.annual_step_up_amount,
    )


@router.post("/calculators/lumpsum")
def lumpsum_endpoint(payload: LumpsumRequest):
    return lumpsum(payload.principal, payload.annual_return, payload.years)


@router.post("/calculators/goal-sip")
def goal_sip_endpoint(payload: GoalSipRequest):
    return goal_sip(payload.goal_amount, payload.annual_return, payload.years)


@router.post("/calculators/swp")
def swp_endpoint(payload: SwpRequest):
    return swp(payload.corpus, payload.monthly_withdrawal, payload.annual_return, payload.years)


@router.post("/calculators/ppf")
def ppf_endpoint(payload: PpfRequest):
    return ppf(payload.yearly_investment, payload.annual_return, payload.years)


@router.post("/calculators/sip-vs-lumpsum")
def sip_vs_lumpsum_endpoint(payload: SipVsLumpsumRequest):
    return sip_vs_lumpsum(payload.monthly_investment, payload.principal, payload.annual_return, payload.years)


@router.post("/calculators/xirr")
def xirr_endpoint(payload: CashflowRequest):
    return rate_or_422(lambda: xirr(payload.cashflows))


@router.post("/calculators/irr")
def irr_endpoint(payload: CashflowRequest):
    return rate_or_422(lambda: irr(payload.cashflows))


def rate_or_422(calculate):
    try:
        return calculate()
    except CalculationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
