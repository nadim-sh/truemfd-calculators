# TrueMFD Website Integration

Live calculator services:

- Frontend: https://truemfd-calculators-web.onrender.com
- Backend API: https://truemfd-calculators-api.onrender.com
- Swagger: https://truemfd-calculators-api.onrender.com/docs

## Recommended Integration

Use a primary navigation link on `www.truemfd.com`:

- Label: `Calculators`
- URL: `https://truemfd-calculators-web.onrender.com`
- Open: same tab

Add a hero or tools-section CTA:

```html
<a href="https://truemfd-calculators-web.onrender.com" class="button">
  Explore Mutual Fund Calculators
</a>
```

## Premium Custom Domain Option

Best production URL:

```text
https://calculators.truemfd.com
```

Render setup:

1. Open `truemfd-calculators-web` in Render.
2. Go to Settings > Custom Domains.
3. Add `calculators.truemfd.com`.
4. Add the DNS record shown by Render in the domain DNS manager.
5. Wait for SSL to become active.

The backend CORS configuration already allows:

```text
https://www.truemfd.com
https://truemfd.com
https://calculators.truemfd.com
```

## Embed Option

Use only if the main website platform supports responsive iframe embeds cleanly:

```html
<iframe
  src="https://truemfd-calculators-web.onrender.com"
  title="TrueMFD Mutual Fund Calculators"
  style="width: 100%; min-height: 900px; border: 0;"
  loading="lazy"
></iframe>
```

For mobile, prefer linking to the calculator app instead of iframe embedding.

## Verification Checklist

- Home page loads.
- `/calculators/standard-sip` direct route loads.
- Standard SIP Calculate shows `API result loaded successfully.`
- XIRR result displays as a percentage.
- PDF export downloads.
- CSV export downloads.
- Copy/share show success, or a helpful browser-permission message.
- Mobile bottom navigation is visible on phone widths.
- No browser console errors.
