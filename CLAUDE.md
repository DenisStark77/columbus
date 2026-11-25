# Columbus Heights — columbusheights.estate

Independent lot map and registry check for Columbus Heights, an owner-built, off-grid
community in the hills above Costa Rica's central Pacific coast (Quebrada Amarilla, Jacó).
Static site, six pages, no build step, deployed to GitHub Pages from `main`. The site
serves two audiences through one door — prospective buyers and existing lot owners —
and sells nothing directly: every service is a request answered personally.

---

## Strategic decisions (don't re-litigate without good reason)

**Positioning.** An independent map and registry check of Columbus Heights lots,
made by people who live here. For buyers who have heard stories about problem
lots and want facts; for owners who want to know what their lot is worth.
Not a digital service, not a listings board, not the HOA.

**Entry point: the map.** The home page is a clickable lot map. Every lot shows,
without registration: registry status on a given date (traffic light), a price
range from five comparable closed sales, area, plano number, relief, cover.
Three tiers:
1. Map — free, no registration.
2. Registration — email, name, explicit consent to be contacted, optional
   "I own lot(s) #…". Unlocks the five comparable sales (without lot numbers)
   and the methodology.
3. Service request — lot report (~$200), orientation call ($50), visit
   (half day / full day), guesthouse stay, listing a lot. A request creates a
   record and an email to Denis; he answers personally.

**Two audiences, one door.** Newcomers and lot owners both enter through the
map. Owners go "value my lot" → register → request a listing or a report.
Newcomers go map → register → call → visit → report → deal with their own
lawyer. Every step is optional; no pressure.

**The buyer ladder (section "How it works").** Map → registration → 15-minute
orientation call ($50, credited toward later services) → visit (half or full
day, optional guesthouse) → lot report before making an offer → deal with the
buyer's lawyer; we accompany and introduce neighbours.

**No payments on the site.** Nothing is purchasable on the page. Prices are
guides ("from $…"). Payment (SINPE, transfer, cash, PayPal) is agreed personally
after a request. No payment provider, no webhooks, no report-file storage.
Revisit a CR gateway (Onvopay / Tilopay) only when requests exceed a few per
month. Gumroad and Cal.com are no longer on the site.

**Registry data rules (hard).**
- Per-lot status with factual wording only: green "no mortgages, claims or
  notes in the registry"; yellow "registry entries present (mortgage, claim or
  note) — details in the lot report"; red "transfers blocked by court order"
  (inmovilización only); special for lots that are not separate parcels.
  Green = absence of entries, nothing else.
- Every lot card shows its own `checked_on` plus: "Registry data as of <date>.
  Records may have changed. An up-to-date check of this lot is part of the paid
  report." Never call the map a "demo"; it is a snapshot on a date.
- Never publish owner names, ID numbers, company names, or lot numbers inside
  the comparable-sales list. Never use "disputed", "fraud", "stolen".
- Company-owned lot: "registered owner is a company; a company check is part of
  the report."
- Declared deed prices can be understated; small samples — show n next to every
  figure. "Registry check, not legal advice; hire a Costa Rican lawyer."

**Disclosure ("How we earn").** Denis owns lots 47 and 123. He is paid for
calls, visits and reports by buyers, and may be paid by sellers for listings or
on closing. Every listing carries a role label: "our lot" / "we represent the
seller" / "platform only". When showing a lot he earns from, the buyer is told.

**Listing rule.** Asking price within the comparable-sales range → free
listing; above → paid. "Verified against the registry on <date>" only after a
fresh check.

**No public contact back-channels.** Public ways in: the map, registration,
the request form. No phone, no WhatsApp, no mailto on any page. Operator
contacts live in replies, never on the site.

**Honest framing stays.** No developer, volunteer HOA, owner-built community.
"No grid electricity" — update only after ICE actually reconnects (works under
way as of Nov 2026). Footer on every page: "Not affiliated with the Columbus
Heights HOA."

**Public repository rules.** Only `map_public.json`, `stats_public.json`,
`lots_public.json` may be committed. Never: HANDOFF.md, `*_internal*.json`,
owner tables, anything from the HOA folder, raw registry extracts, `.env`.

**Platform.** Stage 0: static files on GitHub Pages, forms via Tally.
Stage 1: Cloudflare (static assets + Workers + D1), magic-link login, gated
comparable sales, request table, owner claims, listings with role label,
privacy policy and deletion on request. Languages: EN / ES / RU.

**Out of scope (first version).** Payments, neighbours' section, owners'
directory, agents' catalogue, house sales, time-to-sell forecast, lot-care
packages.

**Archive — the 2026-05 model.** Single entry via a $50 orientation call paid on
Gumroad, scheduled on Cal.com via the receipt email; three follow-on Gumroad
products with a $50 coupon. Abandoned attempts: Gumroad/Lemon Squeezy in-page
iframe modal (commit `ca9d2da`), Cal.com native payments (PayPal/HitPay/Stripe
blocked for a CR merchant), Stripe Atlas / UAE entity (deferred). Kept here so
nobody retries them by accident.

---

## Architecture (pages and files)

```
index.html          map + lot card (#map-section), Who we are (#who), How it works (#how),
                    For owners (#owners), FAQ (#faq), footer
how-we-count.html   methodology and its limits
how-we-earn.html    disclosure: our lots 47 and 123, what we are paid for, role labels
market.html         statistics from data/stats_public.json (js/market.js)
request.html        service request (Tally), prefilled from ?lot=N&service=…
disagree.html       "disagree with the estimate" (Tally), prefilled from ?lot=N
css/site.css        shared styles: tokens, nav, intro band, map + card, steps, owners, FAQ,
                    footer, prose pages, charts, forms
js/map.js           Leaflet 1.9.4 + OSM tiles; joins data/lots.json (geometry, lot number)
                    with data/map_public.json; keyed status wording; deep link #lot=N
js/i18n.js          EN lives in the markup; ES/RU come from i18n/*.json via data-i18n (text)
                    and data-i18n-html (markup); ?lang=xx, localStorage; fires 'langchange'
js/site.js          reveal on scroll, FAQ accordion, active nav link
js/market.js        inline-SVG charts + tables; purchases per year shown from 2019
i18n/es.json, i18n/ru.json   every key (JS-built strings have EN defaults inside the JS)
data/lots.json      GeoJSON, 223 polygons, properties {lot}
data/map_public.json  per lot: status, status_text, checked_on, area_m2, plano, relief,
                    cover, borders_river, owner_is_company, price_range_usd; data_as_of
data/stats_public.json, data/lots_public.json   public snapshot files
images/             hero, day, place, house, solar, garden, kitchen (see pipeline note below)
```

Nav and footer are copied into every page — change all six files together.

**Lot card rules (js/map.js).** Status key = `status` from map_public.json, with `special`
split by lot number (18–24 → "one parcel with lot 17", 63–64 → "merged in 2007") and a
per-lot override for 180 ("no entries on the parcel; owning company dissolved"). Lots that
exist in the geometry but not in map_public.json (29, 51, 52, 55) show "no registry record in
this snapshot". Lot 17 has no price range. Every card shows `checked_on` and the freshness
line directly under the status. Company-owned lots get the company line. Three quiet links:
method, talk to us (request?service=call), order a lot check (request?service=report).

**Image pipeline.** Python PIL with `ImageOps.exif_transpose`, `thumbnail()` to a max box,
JPEG quality 55–75, progressive. Wrappers use `overflow:hidden` + `object-fit:cover`.

---

## Live integrations

- **Tally** — two forms: service request (`request.html`) and "disagree with the estimate"
  (`disagree.html`). Both pages currently embed the OLD questionnaire `aQ2b8W` as a
  placeholder; replace the IDs once the new forms exist. Hidden fields `lot` and `service`
  must be created in the Tally editor; the official `embed.js` forwards the page's query
  parameters into them, and the page also appends them to `data-tally-src`. The required
  consent checkbox lives inside Tally.
- **OpenStreetMap** tiles via Leaflet 1.9.4 (unpkg). **Google Fonts** (Cormorant Garamond, Inter).
- No payment or scheduling integration. Gumroad products and the Cal.com event may still
  exist in their accounts but are not linked from the site.

---

## Data pipeline (operator-side, outside the repository)

Registry extracts, owner tables, internal flags, the comparable-sales dataset and HOA data
live in a folder on Denis's Mac and are never committed (`.gitignore` guards the obvious
names). Publishing a new snapshot = copy `map_public.json`, `stats_public.json`,
`lots_public.json` into `data/`; `data_as_of` and per-lot `checked_on` travel with the files.
Two known wrinkles: lot 180's wording is a frontend override until the pipeline emits a
`status_key` field; `stats_public.json` has a key named `lots_with_fraud_prevention_note`
(the site labels it "Preventive note") — rename it in the pipeline when convenient.

---

## Open items

- Create the two Tally forms; replace the placeholder IDs in `request.html` / `disagree.html`.
- Git history still holds the contact names and phones removed from `data/lots.json` on
  2026-11-25; rewriting history was not done.
- Lots 29, 51, 52, 55 are on the map but absent from the snapshot — confirm in the pipeline.
- Guesthouse price is "on request" until decided.
- Lawyer: traffic-light wording and report disclaimers; accountant: receiving payment;
  law 8968 privacy text before Stage 1 collects emails.
- "No grid electricity" copy (FAQ, market page) — update only after ICE actually reconnects.
- Optional satellite tile layer (check tile terms first).
- Stage 1 on Cloudflare (planned, not started): Workers + static assets with Workers Builds,
  D1 (users, login_tokens, sessions, owner_claims, service_requests, messages, comps,
  listings), magic-link login, gated comparable sales, request notifications to Denis,
  privacy page and deletion on request. Needs the domain on Cloudflare DNS; email to users
  needs Workers Paid or Resend; notifications to our own verified address are free.

---

## Tone & design conventions

- Typography: Cormorant Garamond display serif paired with Inter for body. Italic + gold for emphasis words.
- Palette tokens: `--forest`, `--forest-deep`, `--cream`, `--cream-soft`, `--clay`, `--gold`, `--gold-soft`.
- First-person "we" voice throughout. **No names on the site.** Photos of the house and the tent at dusk are fine; no close-up faces.
- No exclamation marks. No "discover/explore/unlock" sales verbs. No emojis.
- Em dashes are the user's natural style — preserve them.
- If a change makes the page louder or more commercial, push back. The brief is warm and considered.

---

## Workflow

1. Edit the files directly. No build step.
2. Test locally: `python3 -m http.server 8000` (launch config `static`), open `http://localhost:8000`.
3. Text changes: English goes in the markup with a `data-i18n` / `data-i18n-html` key; add the
   same key to `i18n/es.json` and `i18n/ru.json`. Strings built in JS have EN defaults in
   `js/map.js` / `js/market.js` and the same keys in the dictionaries.
4. Before pushing, grep HTML/JS/i18n for `disputed`, `fraud`, `stolen`, `demo`, phone numbers,
   `gumroad`, `cal.com`, `whatsapp`, `mailto` — none should appear.
5. Commit and push to `main`; GitHub Pages deploys within about a minute.

External resources: Google Fonts, Leaflet + OpenStreetMap tiles, Tally embed script.

---

## Strategic context (the longer story)

User (Denis) lives at Columbus Heights with his family. The actual goals, in priority order:

1. **Attract three or four like-minded families to move in.** This is the real win.
2. **Modest aligned income** ($300–$1000/mo). The principle is symmetry, not greed. Over five years of free tours, ~100 families visited, two bought lots, zero commission to us. The asymmetry is what's being fixed.
3. **Personal acquisition.** Continue buying lots cheaply for generational wealth — fruit forest, low-entropy build, autonomy for the long term.

Tensions to keep in mind:

- Low prices benefit acquisition; high prices benefit commission. Optimize for *aligned* cash flow, not *maximum* cash flow.
- Honesty about the place attracts the right people but can upset neighbors who treat lots as speculation. The page leans into honesty without explicitly advertising lots or prices, which would anchor the local market.
- Squatting / adverse-possession ideas were considered and consciously parked. Public encouragement is off-limits; private title research and outreach to absentee owners is legitimate. Not on the public site.

The For Owners section was added after a real Tally submission from a lot owner who wanted to sell — direct evidence that lot owners are a distinct audience the page now needs to serve.
