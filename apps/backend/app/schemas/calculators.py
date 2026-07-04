from pydantic import BaseModel, Field


class SipRequest(BaseModel):
    monthly_investment: float = Field(gt=0)
    annual_return: float = Field(ge=0, le=100)
    years: int = Field(ge=1, le=60)


class StepUpSipRequest(SipRequest):
    annual_increase: float = Field(ge=0, le=100)


class LumpsumRequest(BaseModel):
    principal: float = Field(gt=0)
    annual_return: float = Field(ge=0, le=100)
    years: int = Field(ge=1, le=60)


class GoalSipRequest(BaseModel):
    goal_amount: float = Field(gt=0)
    annual_return: float = Field(ge=0, le=100)
    years: int = Field(ge=1, le=60)


class SwpRequest(BaseModel):
    corpus: float = Field(gt=0)
    monthly_withdrawal: float = Field(gt=0)
    annual_return: float = Field(ge=0, le=100)
    years: int = Field(ge=1, le=60)


class PpfRequest(BaseModel):
    yearly_investment: float = Field(gt=0, le=150000)
    annual_return: float = Field(ge=0, le=20)
    years: int = Field(ge=15, le=50)


class SipVsLumpsumRequest(BaseModel):
    monthly_investment: float = Field(gt=0)
    principal: float = Field(gt=0)
    annual_return: float = Field(ge=0, le=100)
    years: int = Field(ge=1, le=60)


class CashflowRequest(BaseModel):
    cashflows: list[float]
