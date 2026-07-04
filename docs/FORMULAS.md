# Formula Documentation

- SIP: monthly contribution compounded monthly using `FV = P * (((1+r)^n - 1) / r) * (1+r)`.
- Step Up SIP: each year increases the monthly contribution by the configured step-up percentage.
- Lumpsum: one-time amount compounded annually using `FV = P * (1+r)^years`.
- Goal SIP: target future value solved for required monthly contribution.
- SWP: monthly withdrawal projection with monthly growth on remaining corpus.
- PPF: yearly deposit with configurable annual government rate and optional extension.
- XIRR: Newton-Raphson solve over dated cashflows.
- IRR: periodic Newton-Raphson solve over cashflows.

All rates are entered as annual percentages and converted internally where needed.
