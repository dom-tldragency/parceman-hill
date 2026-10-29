# Parceman Hill website (v1)

Static site. Pages live in `src/pages`, shared header, footer and newsletter block in `src/partials`, styles in `src/assets/site.css`.

```bash
npm run build      # writes dist/
npm run preview    # build and serve locally
```

## Deploy on Vercel

Import the repo in Vercel. `vercel.json` already sets the build command (`node build.js`) and output folder (`dist`). No framework or dependencies.

## Before go-live

Wire up the integrations in `site.config.json`. Until a form has an endpoint, it shows a "preview only" notice instead of submitting.

| Key | What goes there |
| --- | --- |
| `forms.newsletter` | Kit form URL: `https://app.kit.com/forms/<id>/subscriptions` |
| `forms.roundtable` | Kit form with an `events` tag |
| `forms.collective` | Kit form with a `collective` tag |
| `forms.clientEnquiry`, `forms.associate` | Form handler endpoint (e.g. Formspree), or swap for Tally embeds |
| `resources.*` | Tally form links for each gated resource (Tally to Kit via Zapier) |

Set `draftBanner` to `false` to remove the review banner.

## Open items flagged on the site (yellow "TBC" chips)

- Hero line: Gary and Scott to sign off
- SSE, Specsavers, Nationwide: confirm we can name them (and get logo files)
- Newsletter name
- "The Collective": Scott to OK the name
- Investment Broking: one plain-English line
- Case studies: one measurable result and a duration each, confirmed with the delivering partner
