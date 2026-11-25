# Columbus Heights — columbusheights.estate

Single-page landing site for an owner-built, off-grid community in the hills above Costa Rica's central Pacific coast. The page's job is to convert two distinct audiences: prospective newcomers (toward a paid in-person or video visit) and existing lot owners (toward a small set of services). Deploys to GitHub Pages from `main`.

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

## Architecture (top to bottom)

1. **Nav** — sticky, transparent over hero, opaque on scroll. Links: The Day, The Place, How We Live, Owners, Stay in Touch. CTA "Book a Day" → `#book`.
2. **Hero** — full-height, dark veil over photo placeholder. Title: *Come spend a day with us.*
3. **The Day at Columbus Heights** (`#day`) — the centerpiece. Two-column photo + content up top (the pitch + a transparent list of the four possible next-step outcomes). Below it, a full-width cream booking card with a single **Reserve →** button that opens the $50 orientation Gumroad checkout in a new tab. No scheduling UI on the landing — the Cal.com link is delivered in Gumroad's post-purchase receipt.
4. **The Place** (`#place`) — *What's here / What's not* two-card split. Honest about the development's history and current status.
5. **How We Live** (`#life`) — dark forest section. 4-tile gallery: house, solar, garden, kitchen.
6. **For Owners** (`#owners`) — light list of four services. Quiet visual treatment. **No section CTA anymore** — the old "Get in touch →" mailto was absorbed into the Stay in Touch form below.
7. **Stay in Touch** (`#book`) — Tally questionnaire in a cream card. The single contact surface for everything that isn't an orientation booking: lot owners, sellers, unforeseen inquiries. Copy is explicit that we read every response but **only reply when something resonates** — and if we don't write back, the 15-minute orientation call above is always an open door. Day requests go through the orientation booking, not this form.
8. **FAQ** (`#faq`) — accordion. Booking questions plus family/kids (schools, healthcare, internet).
9. **Footer** — brand, tagline, domain. No floating contact button. The orientation call is the only public way through; the Tally form is the optional side door.

Single-file `index.html` — all CSS and JS inline. No build step.

---

## Live integrations

**Tally** — `https://tally.so/r/aQ2b8W`
- Embedded as iframe in the Stay in Touch section.
- The form's intro/outro copy in Tally still uses the old gating language ("we follow up only when there is alignment") — needs to be rewritten in Tally's UI to match the new "briefing / open door" framing.
- Any old redirect-to-Gumroad on submit should be removed (the flow is now reversed).

**Gumroad — primary payment surface.** The $50 orientation product is live at `https://starkwave15.gumroad.com/l/che-orientation?wanted=true` — that URL is the `href` on the Reserve button in the `.day-booking-header`. The product's **customer receipt content** AND its **workflow email** both contain the Cal.com booking link (`https://cal.com/denis-stark/orientation`). Buyers see the link the instant they pay and again by email; we don't have to do anything between the payment and the buyer landing on Cal.com. Three follow-on products live in the same Gumroad account at gross list prices — extended video conversation $200, half-day $150, full day $250. After the orientation call, Denis emails the matching Gumroad product link plus a one-use **$50 coupon code** that drops the price to the post-credit amount the landing advertises ($150 / $100 / $200). The coupon is the credit mechanism — Gumroad list prices stay at $200 / $150 / $250 so the math holds.

**Cal.com — scheduling only.** Public event-type URL: `https://cal.com/denis-stark/orientation`. Configured as a **free** event type (no payment app connected, **Requires Confirmation OFF**). The link is delivered to paid buyers exclusively through Gumroad's receipt/workflow email — it does **not** appear anywhere on the public landing page. Putting it on the landing would bypass the $50 gate, which is the whole point of the architecture.

**History (so future-you doesn't redo this work).** We tried embedding Gumroad and Lemon Squeezy checkouts in a custom in-page iframe modal — abandoned because Gumroad's modern URLs don't reliably support overlay and LS's `?embed=1` flow trips on cross-site cookies. We tried Cal.com's native payment integration — PayPal blocks CR-merchant card checkout, HitPay doesn't support CR, Stripe requires US/EU residency, Polar.sh has no Cal.com integration. We considered Stripe Atlas (US LLC) and UAE Free Zone incorporation — deferred at current scale, plus Stripe Atlas has real banking-rejection risk on a Russian passport. The iframe-modal code (with all its quirks — LS `postMessage` event names, localhost `SameSite` cookie trap, `X-Frame-Options` fallback to `window.open()`) lives in git history at commit `ca9d2da` and prior; revive it only if a future product genuinely needs in-page checkout.

**Risk / fallback.** Two things can break the buyer flow: the Gumroad checkout (single source of failure for payment) and the Cal.com URL inside the Gumroad receipt/workflow. If Gumroad goes down the Reserve button still degrades to a normal link — buyer sees Gumroad's error page rather than a broken modal. If the Cal.com link breaks (event type renamed, account suspended), buyers will pay and then find themselves stuck — monitor that the receipt email's link always points at a live Cal.com event. Easy mitigation: include a direct contact (Denis's email `hello@columbusheights.estate` and/or WhatsApp `+506 6304 2667`) inside the Gumroad receipt content as a "if the booking link doesn't work, reach out here" line. That contact appears only after payment — it doesn't sit on the public landing where it would undermine the $50 gate.

**Operator workflow per booking.** Buyer pays on Gumroad → instantly sees the Cal.com booking link in the on-screen receipt and again by email → clicks it → picks a time → Cal.com auto-confirms and sends the Google Meet + calendar invite. Denis takes **no manual action** between the payment and the calendar invite landing in his synced calendar. For follow-on bookings (extended call, half-day, full day): after the orientation call, Denis emails the matching Gumroad product link plus the $50 coupon code; the same Gumroad → email → calendar auto-flow kicks in from there.

**Contact (operator-side only, not on the public landing).** The only public way to reach us is the orientation booking ($50 → Cal.com) or the Tally form. The following details exist for use inside the Gumroad receipt content, in workflow emails, and in operator notes — never as a public-page button or mailto:
- Email: `hello@columbusheights.estate`
- WhatsApp: `+506 6304 2667` (was a floating button on the landing — removed because a direct one-click chat back-channel undermines the $50 orientation gate)

---

## Open items / placeholders

**Photo slots** — all 7 wired up. Real images live in `images/` at the repo root:
- `hero.jpg` — aerial road through fields, 1024×768 (source resolution; slightly soft on retina but the dark veil absorbs it)
- `day.jpg` — glamping tent at dusk with fairy lights, 1200×1600
- `place.jpg` — aerial of our lot with fruit-forest plot, 2000×1500, ~660KB at quality 55
- `house.jpg` — family on porch of the white house through trees, 1067×1600
- `solar.jpg` — rooftop panels + green lawn + mountains, 960×1280
- `garden.jpg` — papaya tree from below against blue sky, 1200×1600
- `kitchen.jpg` — rustic bread loaf with mountain view through window, 1200×1600

**Family-photo rule update.** The original CLAUDE.md said "no family photo." We relaxed it: the House tile shows the family on the porch, and the Day tile has the family small inside the lit tent at dusk. Both were deliberate choices — the warmth pays off the "actually live the life" framing — but if you want to swap to no-faces alternates later, keep `IMG_2540.jpeg` (hills + road) as a hero/place backup and re-shoot the House from a faces-out angle.

**Image pipeline.** Python PIL with `ImageOps.exif_transpose` (bakes iPhone EXIF rotation into pixels — iPhone JPEGs are stored landscape with an orientation tag, and `sips` ignores the tag during resize), then `thumbnail()` to fit within a max-dim box, then `JPEG quality=55–75 optimize=True progressive=True`. CSS pattern: each photo wrapper (`.day-photo`, `.place-photo`, `.life-tile`) gets `overflow:hidden`, and its child `> img` gets `width:100%; height:100%; object-fit:cover` so the source aspect doesn't have to match the slot exactly. The old placeholder div pattern (`<div class="photo" data-label="...">` rendering a green gradient + dashed border) is still in the CSS and could be re-enabled for future sections.

**Gumroad products.** The orientation ($50) is the only Gumroad URL on the landing — `https://starkwave15.gumroad.com/l/che-orientation?wanted=true`. Three follow-on products (extended video conversation, half-day, full day) live in the same account at gross prices ($200 / $150 / $250) and are emailed manually after the orientation call with a $50 coupon code attached. Suggested type for all four: regular Digital product (not Call) — Cal.com handles scheduling, Gumroad just collects money.

**Prior Tally submissions** to follow up on personally:
- `rachelvvg@yahoo.com` (Apr 20) — family of four planning relocation, perfect bullseye. Younger son on autistic spectrum, wants to be a farmer. Address the school question directly: Quebrada Amarilla (3 min, Spanish), Playa Hermosa (7 min, bilingual options), Journey School in Jacó (IB, all grades).
- `slizauskasl@gmail.com` (Apr 19) — owns a lot, wants to sell. Asked for help selling on commission. Confirm lot location, asking price, timeline.

---

## Tone & design conventions

- Typography: Cormorant Garamond display serif paired with Inter for body. Italic + gold for emphasis words.
- Palette tokens: `--forest`, `--forest-deep`, `--cream`, `--cream-soft`, `--clay`, `--gold`, `--gold-soft`.
- First-person "we" voice throughout. **No names, no family photo** (user's choice — keep the family private until people actually book).
- No exclamation marks. No "discover/explore/unlock" sales verbs. No emojis.
- Em dashes are the user's natural style — preserve them.
- If a change makes the page louder or more commercial, push back. The brief is warm and considered.

---

## Workflow

1. Edit `index.html` directly. Single file, no build step.
2. Test locally: `python3 -m http.server 8000`, visit `http://localhost:8000`. (Serve over HTTP, not `file://`, so the Tally script runs with normal browser security. The page no longer embeds any payment or scheduling widget — Gumroad opens in a new tab, Cal.com is reached via the receipt email — so there's nothing payment-related to test locally.)
3. Commit and push to `main`. GitHub Pages picks it up within ~1 minute.

External resources used:
- Google Fonts (Cormorant Garamond + Inter)
- Tally embed script (`https://tally.so/widgets/embed.js`, loaded on demand by the inline loader)

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
