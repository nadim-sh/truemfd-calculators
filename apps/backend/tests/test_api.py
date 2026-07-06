from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_standard_sip_api():
    response = client.post(
        "/api/v1/calculators/standard-sip",
        json={"monthly_investment": 10000, "annual_return": 12, "years": 10},
    )
    assert response.status_code == 200
    assert response.json()["calculator"] == "standard-sip"


def test_root_health_api():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_all_calculator_endpoints_return_results():
    cases = [
        ("step-up-sip", {"monthly_investment": 10000, "annual_return": 12, "years": 10, "annual_increase": 10}),
        ("lumpsum", {"principal": 500000, "annual_return": 12, "years": 10}),
        ("goal-sip", {"goal_amount": 2500000, "annual_return": 12, "years": 10}),
        ("swp", {"corpus": 5000000, "monthly_withdrawal": 40000, "annual_return": 8, "years": 10}),
        ("ppf", {"yearly_investment": 150000, "annual_return": 7.1, "years": 15}),
        ("sip-vs-lumpsum", {"monthly_investment": 10000, "principal": 500000, "annual_return": 12, "years": 10}),
        ("xirr", {"cashflows": [-100000, 25000, 30000, 35000, 40000]}),
        ("irr", {"cashflows": [-100000, 25000, 30000, 35000, 40000]}),
    ]

    for slug, payload in cases:
        response = client.post(f"/api/v1/calculators/{slug}", json=payload)
        assert response.status_code == 200
        body = response.json()
        assert body["calculator"] == slug
        assert "result" in body
        assert "chart" in body


def test_step_up_sip_api_accepts_fixed_amount_mode():
    response = client.post(
        "/api/v1/calculators/step-up-sip",
        json={
            "monthly_investment": 10000,
            "annual_return": 12,
            "years": 3,
            "annual_increase": 0,
            "step_up_type": "fixed_amount",
            "annual_step_up_amount": 1000,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["result"]["final_monthly_sip"] == 12000
    assert body["schedule"][1]["monthly_sip"] == 11000


def test_ppf_rejects_invalid_short_term():
    response = client.post(
        "/api/v1/calculators/ppf",
        json={"yearly_investment": 150000, "annual_return": 7.1, "years": 10},
    )
    assert response.status_code == 422


def test_cashflow_api_rejects_all_positive_and_all_negative_cashflows():
    for cashflows in ([100, 200, 300], [-100, -200, -300]):
        response = client.post("/api/v1/calculators/irr", json={"cashflows": cashflows})
        assert response.status_code == 422
        assert response.json()["detail"] == "IRR/XIRR requires at least one investment outflow and one return inflow."


def test_cashflow_api_rejects_insufficient_cashflows():
    response = client.post("/api/v1/calculators/xirr", json={"cashflows": [-100]})

    assert response.status_code == 422
    assert response.json()["detail"] == "Enter at least two valid cashflow entries."


def test_cashflow_api_rejects_invalid_solver_result():
    response = client.post("/api/v1/calculators/xirr", json={"cashflows": [-100, 0.000001]})

    assert response.status_code == 422
    assert response.json()["detail"] == "IRR/XIRR could not find a reliable rate for these cashflows."
