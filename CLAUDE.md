# Columbus Heights — columbusheights.estate

Single-page landing site for an owner-built, off-grid community in the hills above Costa Rica's central Pacific coast. The page's job is to convert two distinct audiences: prospective newcomers (toward a paid in-person or video visit) and existing lot owners (toward a small set of services). Deploys to GitHub Pages from `main`.

---

## Strategic decisions (don't re-litigate without good reason)

**Two audiences, two paths.** Newcomers go through "A Day at Columbus Heights" (paid). Owners go through the "For Owners" section (Selling, Maintenance, Fruit Forest, Build/Relocate).

**Single entry point: the 15-minute orientation call.** Every prospect starts with the same paid conversation — $50, paid on Gumroad, scheduled on Cal.com. There is no choose-your-own-adventure pricing menu on the page. The four possible outcomes are listed transparently below the orientation pitch but are **not** purchasable from the landing — they're decided collaboratively on the call, and the payment link is sent by email afterwards. **The prices shown on the site are post-credit:** extended video conversation $150, half-day visit $100, full day with a meal $200, or "sometimes nothing more — and that's fine too" at no further cost. The Gumroad products themselves are listed at $200 / $150 / $250 respectively; the $50 difference is applied via a one-use **coupon code** Denis sends after each orientation call, so the buyer pays exactly the post-credit amount on Gumroad. Showing both numbers on the page (e.g. "+$150 · $200 total") confused readers — single price wins. Tally is now purely the **open door** for owners, sellers, and other unforeseen cases — not a post-purchase briefing.

**Why this shape over the old three-tier menu.** The previous menu (Video $200 / Half $150 / Full $250) forced people to pre-commit to a format before they had enough information to choose well. The orientation call moves the decision later, when both sides have context. It also collapses three checkouts into a single Reserve button, which is simpler to operate.

**Payment architecture: Gumroad-led, manually bridged to Cal.com.** Gumroad collects payment for the orientation (and for all follow-ons); Cal.com handles scheduling but never appears on the landing. The bridge between them is Gumroad's customized **receipt content** and **workflow email** — both contain the Cal.com booking URL. The landing itself has zero scheduling UI: a single Reserve button → Gumroad checkout in a new tab → buyer reads their email → clicks the Cal.com link → picks a time → Cal.com auto-confirms and sends the Zoom + calendar invite. We arrived here after a fairly long path:

- We tried embedding Gumroad in an in-page overlay/iframe modal (Lemon Squeezy too). Abandoned — Gumroad's modern URL formats don't reliably support overlay, and Lemon Squeezy's `?embed=1` flow trips on cross-site cookies in many real-world setups.
- We tried Cal.com's native payment integration. Abandoned — PayPal blocks Costa-Rica-merchant card checkout, HitPay doesn't support CR, Stripe requires US/EU residency, and Polar.sh has no Cal.com integration.
- We considered Stripe Atlas (US LLC) and UAE Free Zone incorporation. Deferred — overkill at current scale, and Stripe Atlas has a real banking-rejection risk on a Russian passport.
- The current arrangement is the cheapest, smallest moving-parts version that actually works end-to-end today. Cal.com is configured as a free event type (no payment app connected, Requires Confirmation off); anyone who reaches the booking page has already paid by definition. **Do not put the Cal.com URL on the landing** — it would defeat the gate.

**Warm, restrained tone.** Pricing menus over product cards. Discrete text links over solid CTA buttons. Reads like a thoughtful invitation, not a real-estate listing. Don't add bombastic copy, exclamation marks, or sales-y verbs.

**Honest framing of the place.** The site explicitly names the realities: no developer, no grid electricity (ICE conflict), volunteer HOA, owner-built community of 5–6 families. That honesty is the filter — wrong-fit people self-eject.

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
9. **Footer** — brand, tagline, domain. Floating WhatsApp button.

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

**Risk / fallback.** Two things can break the buyer flow: the Gumroad checkout (single source of failure for payment) and the Cal.com URL inside the Gumroad receipt/workflow. If Gumroad goes down the Reserve button still degrades to a normal link — buyer sees Gumroad's error page rather than a broken modal. If the Cal.com link breaks (event type renamed, account suspended), buyers will pay and then find themselves stuck — monitor that the receipt email's link always points at a live Cal.com event. Easy mitigation: include the WhatsApp number (`+506 6304 2667`) in the Gumroad receipt content as a "if the booking link doesn't work, reach out here" line.

**Operator workflow per booking.** Buyer pays on Gumroad → instantly sees the Cal.com booking link in the on-screen receipt and again by email → clicks it → picks a time → Cal.com auto-confirms and sends the Zoom + calendar invite. Denis takes **no manual action** between the payment and the calendar invite landing in his synced calendar. For follow-on bookings (extended call, half-day, full day): after the orientation call, Denis emails the matching Gumroad product link plus the $50 coupon code; the same Gumroad → email → calendar auto-flow kicks in from there.

**Contact**
- Email: `hello@columbusheights.estate` (mailto in owner CTA, footer)
- WhatsApp: `+506 6304 2667` (floating button → `https://wa.me/50663042667`)

---

## Open items / placeholders

**Photo slots** — every image on the page is currently a stylized SVG placeholder with a dashed border and a description of what photo belongs there:
- Hero — wide landscape from the property, ideally golden hour
- Day section — vertical 4:5, "what your day looks like" (the walk, the garden, a meal in progress)
- Place section — 21:9 panoramic of the gate / road / community
- How We Live — four 3:4 verticals: house exterior, solar array, food forest, kitchen/bread

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
