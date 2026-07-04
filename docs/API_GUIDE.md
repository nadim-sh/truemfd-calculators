# API Guide

Base path: `/api/v1`

- `GET /health`
- `POST /calculators/standard-sip`
- `POST /calculators/step-up-sip`
- `POST /calculators/lumpsum`
- `POST /calculators/goal-sip`
- `POST /calculators/swp`
- `POST /calculators/ppf`
- `POST /calculators/sip-vs-lumpsum`
- `POST /calculators/xirr`
- `POST /calculators/irr`

All endpoints return consistent JSON:

```json
{
  "calculator": "standard-sip",
  "result": {},
  "schedule": [],
  "chart": []
}
```
