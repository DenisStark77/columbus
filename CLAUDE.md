# Columbus Heights — columbusheights.estate

Single-page landing site for an owner-built, off-grid community in the hills above Costa Rica's central Pacific coast. The page's job is to convert two distinct audiences: prospective newcomers (toward a paid in-person or video visit) and existing lot owners (toward a small set of services). Deploys to GitHub Pages from `main`.

---

## Strategic decisions (don't re-litigate without good reason)

**Two audiences, two paths.** Newcomers go through "A Day at Columbus Heights" (paid). Owners go through the "For Owners" section (Selling, Maintenance, Fruit Forest, Build/Relocate).

**Money is the filter, not the questionnaire.** The Tally orientation questionnaire was originally designed to gate. The flow is now reversed: Gumroad checkout first, then the questionnaire as preparation. The questionnaire also intentionally stays as a side door for owners, sellers, and other unforeseen cases.

**Three Day tiers, deliberately priced.** Video call $200, half-day $150, full-day $250. The Zoom sits above the half-day on purpose — we'd rather host on the land, and the pricing signals that without saying so.

**Warm, restrained tone.** Pricing menus over product cards. Discrete text links over solid CTA buttons. Reads like a thoughtful invitation, not a real-estate listing. Don't add bombastic copy, exclamation marks, or sales-y verbs.

**Honest framing of the place.** The site explicitly names the realities: no developer, no grid electricity (ICE conflict), volunteer HOA, owner-built community of 5–6 families. That honesty is the filter — wrong-fit people self-eject.

---

## Architecture (top to bottom)

1. **Nav** — sticky, transparent over hero, opaque on scroll. Links: The Day, The Place, How We Live, Owners, Stay in Touch. CTA "Book a Day" → `#book`.
2. **Hero** — full-height, dark veil over photo placeholder. Title: *Come spend a day with us.*
3. **The Day at Columbus Heights** (`#day`) — the centerpiece. Two-column: photo left, content right. Restrained 3-row pricing menu, each row with a Reserve → link (Gumroad overlay).
4. **The Place** (`#place`) — *What's here / What's not* two-card split. Honest about the development's history and current status.
5. **How We Live** (`#life`) — dark forest section. 4-tile gallery: house, solar, garden, kitchen.
6. **For Owners** (`#owners`) — light list of four services. Quiet visual treatment. Mailto CTA to `hello@columbusheights.estate`.
7. **Stay in Touch** (`#book`) — Tally questionnaire embed in a cream card on dark background. Copy supports both post-purchase briefing and open-door inquiries.
8. **FAQ** (`#faq`) — accordion. Booking questions plus family/kids (schools, healthcare, internet).
9. **Footer** — brand, tagline, domain. Floating WhatsApp button.

Single-file `index.html` — all CSS and JS inline. No build step.

---

## Live integrations

**Tally** — `https://tally.so/r/aQ2b8W`
- Embedded as iframe in the Stay in Touch section.
- The form's intro/outro copy in Tally still uses the old gating language ("we follow up only when there is alignment") — needs to be rewritten in Tally's UI to match the new "briefing / open door" framing.
- Any old redirect-to-Gumroad on submit should be removed (the flow is now reversed).

**Gumroad** — overlay script loaded at bottom of page.
- Video Call ($200) — **LIVE**: `https://starkwave15.gumroad.com/l/che-videocall?wanted=true`
  - Set up as a Call product type with built-in scheduling.
- Half Day ($150) — placeholder URL: `https://gumroad.com/l/REPLACE-ME-HALFDAY?wanted=true`
- Full Day ($250) — placeholder URL: `https://gumroad.com/l/REPLACE-ME-FULLDAY?wanted=true`

All Reserve links use `class="gumroad-button day-option-reserve"` and **require `?wanted=true`** for the overlay to trigger. Without the query parameter, the link navigates to the product page instead of opening the overlay. Gumroad's default button styling is overridden by CSS with `!important` to preserve the warm/restrained look.

For half-day and full-day, set the **post-purchase redirect** in Gumroad to `https://columbusheights.estate/#book` so buyers land at the Tally form.

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

**Two Gumroad products** still to create — half-day and full-day. Suggested type: regular Digital product (not Call), since they need date coordination via email rather than Calendly. After creating, replace the `REPLACE-ME-*` URLs in `index.html`.

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
2. Test locally: `python3 -m http.server 8000`, visit `http://localhost:8000`. **Gumroad overlays don't work from `file://`** — must serve over HTTP.
3. Commit and push to `main`. GitHub Pages picks it up within ~1 minute.

External resources used:
- Google Fonts (Cormorant Garamond + Inter)
- Tally embed script
- Gumroad embed script (`https://gumroad.com/js/gumroad.js`)

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
