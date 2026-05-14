# Columbus Heights — columbusheights.estate

Single-page landing site for an owner-built, off-grid community in the hills above Costa Rica's central Pacific coast. The page's job is to convert two distinct audiences: prospective newcomers (toward a paid in-person or video visit) and existing lot owners (toward a small set of services). Deploys to GitHub Pages from `main`.

---

## Strategic decisions (don't re-litigate without good reason)

**Two audiences, two paths.** Newcomers go through "A Day at Columbus Heights" (paid). Owners go through the "For Owners" section (Selling, Maintenance, Fruit Forest, Build/Relocate).

**Single entry point: the 15-minute orientation call.** Every prospect starts with the same paid conversation — $50, booked through Cal.com, scheduled in their own calendar. There is no choose-your-own-adventure pricing menu on the page. The four possible outcomes (extended video conversation $200, half-day visit $150, full day with a meal $250, or "sometimes nothing more — and that's fine too") are listed transparently below the orientation pitch but are **not** purchasable from the landing. They are decided collaboratively during the orientation call; afterwards, if a follow-on is right, we send the payment link manually. The $50 orientation fee credits toward whichever path is chosen. Tally is now purely the **open door** for owners, sellers, and other unforeseen cases — not a post-purchase briefing.

**Why this shape over the old three-tier menu.** The previous menu (Video $200 / Half $150 / Full $250) forced people to pre-commit to a format before they had enough information to choose well. The orientation call moves the decision later, when both sides have context. It also collapses three Gumroad/LS checkouts into a single Cal.com booking surface, which is simpler to operate.

**Warm, restrained tone.** Pricing menus over product cards. Discrete text links over solid CTA buttons. Reads like a thoughtful invitation, not a real-estate listing. Don't add bombastic copy, exclamation marks, or sales-y verbs.

**Honest framing of the place.** The site explicitly names the realities: no developer, no grid electricity (ICE conflict), volunteer HOA, owner-built community of 5–6 families. That honesty is the filter — wrong-fit people self-eject.

---

## Architecture (top to bottom)

1. **Nav** — sticky, transparent over hero, opaque on scroll. Links: The Day, The Place, How We Live, Owners, Stay in Touch. CTA "Book a Day" → `#book`.
2. **Hero** — full-height, dark veil over photo placeholder. Title: *Come spend a day with us.*
3. **The Day at Columbus Heights** (`#day`) — the centerpiece. Two-column photo + content up top (the pitch + a transparent list of the four possible next-step outcomes). Below it, a full-width cream booking card containing the inline Cal.com embed for the $50 orientation call.
4. **The Place** (`#place`) — *What's here / What's not* two-card split. Honest about the development's history and current status.
5. **How We Live** (`#life`) — dark forest section. 4-tile gallery: house, solar, garden, kitchen.
6. **For Owners** (`#owners`) — light list of four services. Quiet visual treatment. Mailto CTA to `hello@columbusheights.estate`.
7. **Stay in Touch** (`#book`) — Tally questionnaire embed in a cream card on dark background. Now framed strictly as a side door for everything that isn't a Day-at-Columbus-Heights request (lot owners, sellers, unforeseen inquiries). Day requests go through the orientation booking above.
8. **FAQ** (`#faq`) — accordion. Booking questions plus family/kids (schools, healthcare, internet).
9. **Footer** — brand, tagline, domain. Floating WhatsApp button.

Single-file `index.html` — all CSS and JS inline. No build step.

---

## Live integrations

**Tally** — `https://tally.so/r/aQ2b8W`
- Embedded as iframe in the Stay in Touch section.
- The form's intro/outro copy in Tally still uses the old gating language ("we follow up only when there is alignment") — needs to be rewritten in Tally's UI to match the new "briefing / open door" framing.
- Any old redirect-to-Gumroad on submit should be removed (the flow is now reversed).

**Cal.com** — the primary booking surface for the $50 orientation call. Public link: `https://cal.com/denis-stark/orientation`. Embedded inline on the page via Cal's official embed.js loader (`https://app.cal.com/embed/embed.js`) inside the `.day-booking` section.

- Embed namespace: `"orientation"`. Mount target: `<div id="my-cal-inline-orientation">`. Layout: `month_view` with `useSlotsViewOnSmallScreen` on mobile.
- The loader snippet sits at the very bottom of `<body>`, right after the Tally embed loader. Both are independent — Cal.com does not need lemon.js, gumroad.js, or any other prior dependency.
- **Payment is collected by Cal.com at booking time** (Stripe-backed). The $50 is non-refundable but credits toward whatever follow-on path the prospect chooses on the call.
- Post-call routing is manual: after each orientation Denis sends the appropriate Gumroad payment link by email if a follow-on is agreed.

**Gumroad (backend only).** Still used as the back-office checkout for the three follow-on products — extended video conversation ($200), half-day visit ($150), full day with meal ($250). **No longer embedded on the landing.** Payment links are emailed manually to people who completed the orientation call and chose a follow-on. The custom iframe modal that used to host Gumroad/Lemon Squeezy checkouts in-page has been removed; it lives in git history (commit `ca9d2da` and prior) and can be revived if a future product genuinely needs in-page checkout. The notes on the modal's quirks — Lemon Squeezy's `postMessage` event names, the localhost `SameSite` cookie trap, the iframe `X-Frame-Options` fallback to `window.open()` — are preserved there for future reference.

**Risk / fallback.** If Cal.com's embed fails to render (script blocked, layout breaks, etc.), the booking section still degrades gracefully because the `#my-cal-inline-orientation` div is empty by default. Quick fallback: replace the empty mount div with a direct link or button to `https://cal.com/denis-stark/orientation` so people can still book on Cal's hosted page.

**Contact**
- Email: `hello@columbusheights.estate` (mailto in owner CTA, footer)
- WhatsApp: `+506 6304 2667` (floating button → `https://wa.me/50663042667`)

---

## Open items / placeholders

**Healthcare FAQ** — placeholder `[YOUR ANSWER — ...]` in the FAQ. Needs real local content: nearest clinic/hospital, Caja vs. private, doctors families actually use, emergency response.

**Photo slots** — every image on the page is currently a stylized SVG placeholder with a dashed border and a description of what photo belongs there:
- Hero — wide landscape from the property, ideally golden hour
- Day section — vertical 4:5, "what your day looks like" (the walk, the garden, a meal in progress)
- Place section — 21:9 panoramic of the gate / road / community
- How We Live — four 3:4 verticals: house exterior, solar array, food forest, kitchen/bread

**Three Gumroad products** kept as the backend payment surface for follow-ons — extended video conversation, half-day, full day. They are **not** linked from the landing anymore; URLs only need to exist as something Denis can paste into a follow-up email. Suggested type: regular Digital product (not Call), since date coordination happens by email after the orientation call.

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
2. Test locally: `python3 -m http.server 8000`, visit `http://localhost:8000`. (Serve over HTTP, not `file://`, so the Cal.com and Tally scripts run with normal browser security.)
3. Commit and push to `main`. GitHub Pages picks it up within ~1 minute.

External resources used:
- Google Fonts (Cormorant Garamond + Inter)
- Tally embed script (`https://tally.so/widgets/embed.js`, loaded on demand by the inline loader)
- Cal.com embed script (`https://app.cal.com/embed/embed.js`, loaded by the inline init snippet)

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
