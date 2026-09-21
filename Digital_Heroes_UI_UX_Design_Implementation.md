# Digital Heroes: UI/UX Design Implementation Spec

> **Companion to:** `Digital_Heroes_Implementation_Plan.md` (same stack: Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, Stripe).
> **Audience:** an AI coding agent building the front end. Every token, component, page, and animation below is specified so it can be implemented without further design decisions.
> **PRD authority:** all PRD rules remain exactly as stated in the first document (Section 0.1 there). This spec only decides how they look, feel, and move.

---

## 1. Design Intent

### 1.1 What the PRD asks for (§12), and how this design answers it

| PRD requirement | Design response |
|---|---|
| Clean, modern, motion-enhanced interface | Restrained dark-teal interface, one signature motif, GSAP motion used with a strict budget (Section 6) |
| Must not resemble a golf website; avoid fairways, plaid, club imagery | No green turf, no plaid, no clubs, no flags. Golf appears only as data (Stableford scores, the draw numbers). |
| Emotion-driven, leading with charitable impact, not sport | Hero headline and first content block are about giving. Charity imagery leads; sport is never the hero. |
| Homepage communicates what the user does, how they win, charity impact, and the call to action | Five homepage blocks map one-to-one to these four things (Section 4.1) |
| Subtle transitions and micro-interactions throughout | Motion inventory (Section 6.2) covers every interactive surface, kept short and purposeful |
| Subscribe button/flow must be prominent and persuasive | The only warm-colour filled button in the product is Subscribe. It is always visible on desktop and mobile. |
| Responsive on mobile and desktop (§16.1) | Mobile-first layouts, dedicated mobile navigation, tables that collapse to stacked rows |

### 1.2 Concept: "Ripple"

A subscription is a stone dropped in water. It spreads outward: to a charity, to a prize pool, to a draw. The interface uses **concentric rings** as its single recurring motif, in the hero, the charity-percentage control, the draw reveal, and loading states. The motif says "your action reaches other people" without a single golf reference.

**Colour rule that carries the whole product:** cool sea-glass means *giving*, warm marigold means *action and reward*. The user learns it once and it holds everywhere.

### 1.3 Design principles

1. **Give first.** Charity content always appears before sport or prize content in any layout.
2. **One bold moment per screen.** Hero ripple on the homepage, draw reveal on the draws page. Everything else stays quiet.
3. **Motion answers the user.** Motion happens because someone acted (added a score, chose a charity, published a draw). Unprompted motion is limited to one hero sequence and one scroll sequence.
4. **Numbers are the content.** Scores, prize amounts, and percentages get large, tabular, high-contrast type. Money is always explained (where every rupee goes).
5. **Plain words.** Sentence case, active voice, buttons that say exactly what happens (Section 9).

### 1.4 Deliberate departures from generic defaults

Recorded so the agent does not "fix" them back:

- No tracked-out ALL-CAPS eyebrow above every heading. Labels are sentence case and appear only where they carry information.
- No monospace "data label" styling. Numbers use the display family with tabular figures.
- No arrow glyph appended to buttons or links.
- No identical rounded cards in a grid. Radius, size, and surface depend on the role of the element (Section 3.5).
- No fade-and-slide-up on every section, and no hover lift on every card.
- Numbered markers appear only where the content is a real sequence (how it works, signup steps, draw publishing steps).
- The PRD cover uses a dark navy, green, and copper look with a serif-italic accent. This design borrows the *feeling* (teal, sage, warm accent) but does not copy the serif-italic treatment or the near-black base.

---

## 2. Technology for UI and Motion

| Concern | Choice | Notes |
|---|---|---|
| Animation engine | **GSAP 3.13+** (`gsap`, `@gsap/react`) | Recent GSAP releases ship all plugins in the public package at no cost. Verify the current licence at gsap.com before shipping. |
| GSAP plugins | `ScrollTrigger`, `Flip`, `SplitText`, `DrawSVGPlugin`, `MotionPathPlugin`, `CustomEase`, `Draggable` + `InertiaPlugin` | Each has a specific job in Section 6. Do not register plugins that are not used. |
| React integration | `useGSAP()` hook with `scope` and `dependencies` | Handles context and cleanup. Never call raw `gsap` in `useEffect` without a context. |
| Smooth scroll | **Lenis**, synced to `gsap.ticker` | Marketing pages only. Disabled on dashboard and admin (nested scroll areas, dense tables) and when reduced motion is on. |
| Components | shadcn/ui (Radix primitives) restyled with the tokens below | Radix supplies accessibility. Restyle every default. |
| Styling | Tailwind CSS v4 with `@theme` tokens | Tokens in `app/globals.css` |
| Icons | `lucide-react`, 1.5 px stroke | Custom SVG for the ripple motif and the check mark |
| Charts (admin) | Recharts, themed with tokens | |
| Tables (admin) | TanStack Table | |
| Command palette (admin) | `cmdk` | |
| Toasts | `sonner`, restyled | |
| Fonts | `next/font/google`: **Bricolage Grotesque** (display and UI headings), **Figtree** (body and form text) | Bricolage is a variable font with width and optical-size axes, which gives the headline its character without decoration. |

---

## 3. Design Tokens

### 3.1 Colour

**Dark theme (default, used across the whole product)**

| Token | Name | Hex | Use |
|---|---|---|---|
| `--color-bg` | Deep lagoon | `#071F29` | Page background |
| `--color-surface` | Lagoon raised | `#0D2E3B` | Cards, panels |
| `--color-surface-2` | Lagoon lifted | `#143C4B` | Popovers, hovered rows, sheets |
| `--color-line` | Line | `rgba(233,244,240,0.10)` | Borders and dividers |
| `--color-text` | Foam | `#E9F4F0` | Primary text |
| `--color-text-2` | Tide | `#A7C2C4` | Secondary text |
| `--color-text-3` | Mist | `#7C9BA0` | Tertiary text, placeholders (5.8:1 on bg, use for 14px and up) |
| `--color-charity` | Sea glass | `#7DE0C3` | Charity, impact, success, selected states |
| `--color-reward` | Marigold | `#FFC145` | Subscribe CTA, jackpot, prizes, primary actions |
| `--color-on-reward` | Ink | `#1A1200` | Text on marigold |
| `--color-danger` | Coral | `#FF6B6B` | Errors, destructive actions |

**Light theme (optional toggle, same names)**: `bg #F3F7F6`, `surface #FFFFFF`, `surface-2 #E8F0EE`, `line rgba(7,31,41,0.10)`, `text #0B2530`, `text-2 #47646B`, `text-3 #5E7A80`, `charity #0E8F73`, `reward #FFB627`, `on-reward #1A1200`, `danger #D93C3C`. Apply with `data-theme="light"`. Default is dark. Do not spend time on light theme until every dark-theme screen is done.

**Semantic mapping**

| Meaning | Colour |
|---|---|
| Active subscription, approved, paid, selected charity | Sea glass |
| Pending, awaiting proof, under review | Marigold |
| Inactive, lapsed, rejected, error | Coral |
| Neutral or informational | Tide |

Never rely on colour alone. Every status pill also carries an icon and a text label.

### 3.2 Tailwind v4 theme (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg: #071F29;
  --color-surface: #0D2E3B;
  --color-surface-2: #143C4B;
  --color-line: rgb(233 244 240 / 0.10);
  --color-text: #E9F4F0;
  --color-text-2: #A7C2C4;
  --color-text-3: #7C9BA0;
  --color-charity: #7DE0C3;
  --color-reward: #FFC145;
  --color-on-reward: #1A1200;
  --color-danger: #FF6B6B;

  --font-display: var(--font-bricolage), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-figtree), ui-sans-serif, system-ui, sans-serif;

  --radius-control: 14px;   /* inputs, selects, small controls */
  --radius-panel: 24px;     /* cards, panels */
  --radius-hero: 36px;      /* hero and spotlight surfaces */
  --radius-pill: 999px;     /* buttons, chips, status pills */

  --glow-charity: 0 0 0 1px rgb(125 224 195 / 0.35), 0 10px 40px -10px rgb(125 224 195 / 0.30);
  --glow-reward: 0 0 0 1px rgb(255 193 69 / 0.45), 0 10px 40px -10px rgb(255 193 69 / 0.35);
}

html { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); }
body { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }
:focus-visible { outline: 2px solid var(--color-charity); outline-offset: 3px; }
```

### 3.3 Typography

| Role | Family | Size (fluid) | Line height | Weight and axes | Tracking |
|---|---|---|---|---|---|
| Display XL (hero) | Bricolage Grotesque | `clamp(3rem, 2rem + 5vw, 6.5rem)` | 0.95 | 800, width 85 | -0.03em |
| Display L (section titles) | Bricolage Grotesque | `clamp(2.25rem, 1.6rem + 3vw, 4rem)` | 1.0 | 700, width 90 | -0.025em |
| Heading | Bricolage Grotesque | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | 1.1 | 650 | -0.015em |
| Subheading | Bricolage Grotesque | 1.25rem | 1.25 | 600 | -0.01em |
| Body large | Figtree | 1.125rem | 1.6 | 400 | 0 |
| Body | Figtree | 1rem | 1.6 | 400 | 0 |
| Small | Figtree | 0.875rem | 1.5 | 400 and 500 | 0 |
| Caption | Figtree | 0.75rem, sentence case | 1.4 | 500 | 0.01em |
| Numeric (scores, money) | Bricolage Grotesque | contextual | 1 | 700, `tabular-nums` | -0.02em |

Rules: line length under 70 characters for body text. Left-align all text; centre-align only single short lines (empty states, orb numbers). Headlines are set as one weight; do not colour a single word.

### 3.4 Spacing and layout

- 4 px base unit. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- 12-column grid, max width 1280 px, gutters 16 px (mobile) and 24 px (desktop), side padding 20 px (mobile) and 40 px (desktop).
- Section vertical rhythm on marketing pages: 96 px (mobile) and 128 px (desktop).
- Breakpoints: 360 (minimum supported), 640, 768, 1024, 1280.
- Touch targets: 44 x 44 px minimum.

### 3.5 Shape and depth

Radius depends on role, not on habit:

| Element | Radius |
|---|---|
| Buttons, chips, status pills, toggles | Pill |
| Inputs, selects, date and score fields | 14 px |
| Cards and panels | 24 px |
| Hero and charity spotlight surfaces | 36 px |
| Score slot, draw orb | Full circle |

Depth comes from surface colour steps, 1 px inner borders (`--color-line`), and coloured glows on focus, selection, and CTA. Do not use grey drop shadows. Use backdrop blur only on the top navigation, sheets, and dialogs.

### 3.6 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-instant` | 120 ms | Hover colour, press |
| `--dur-quick` | 200 ms | Toggles, chips, focus |
| `--dur-base` | 350 ms | Panels, sheets, list changes |
| `--dur-slow` | 600 ms | Number tweens, emphasis |
| `--dur-hero` | 900 to 1400 ms | Hero sequence, draw reveal only |
| Ease `soft` | `CustomEase "0.22, 1, 0.36, 1"` | Default GSAP ease |
| Ease `settle` | `power2.out` | Exits and fades |
| Ease `drop` | `bounce.out` | Draw orbs only |

---

## 4. Screen-by-Screen Design

### 4.1 Homepage (public)

**Blocks, in order (each answers a PRD requirement):**

| # | Block | Answers | Content |
|---|---|---|---|
| 1 | Hero | Charity impact + call to action | H1, sub, Subscribe button, ripple field |
| 2 | Impact strip | Charity impact | Live totals: raised for charities, current jackpot, active members |
| 3 | How it works (pinned scroll sequence) | What the user does | Three steps: choose a cause, log your latest five scores, enter the monthly draw |
| 4 | Charity spotlight | Charity impact | Featured charity (`/api/charities/featured`) with image, story, next event |
| 5 | How you win | How they win | Three prize tiers (5, 4, 3 matches at 40%, 35%, 25%), jackpot rollover, interactive sample draw |
| 6 | Plans | Call to action | Monthly and yearly toggle, savings, Subscribe |
| 7 | Charity directory preview | Charity impact | Draggable row of charity cards, link to the full directory |
| 8 | Final call to action and footer | Call to action | One sentence, Subscribe button |

**Hero copy**

- H1: **Give every month. Win some months.**
- Sub: **Subscribe, pick a charity, and log your latest golf scores. At least 10% of your fee goes to the cause you choose, and your scores enter the monthly prize draw.**
- Primary button: **Subscribe** (marigold fill). Secondary text link: **See how the draw works**.

**Hero wireframe (desktop 1280)**

```
+--------------------------------------------------------------------------+
| digital.HEROES        Charities   How it works   Prizes      Log in [Subscribe] |
|                                                                          |
|  Give every month.                          (  (  (  (   ) )  ) )        |
|  Win some months.                          concentric rings, drawn in,   |
|                                            reacting to the pointer;      |
|  Subscribe, pick a charity, and log        one small floating card:      |
|  your latest golf scores. At least 10%     "Featured: {charity name}"    |
|  of your fee goes to the cause you                                       |
|  choose...                                                               |
|                                                                          |
|  [ Subscribe ]   See how the draw works                                  |
+--------------------------------------------------------------------------+
```

Text is left-aligned and occupies columns 1 to 6. The ripple field occupies columns 7 to 12 and bleeds off the right and top edges. On mobile the ripple sits behind the text at 30% opacity, and the Subscribe button is full-width.

**Navigation:** sticky, transparent at the top, backdrop-blurred after 24 px of scroll. Subscribe pill always visible (in the header on desktop, in a persistent bottom bar on mobile until the user scrolls to the Plans block). Logged-in users see "Dashboard" in place of "Log in", and the Subscribe pill becomes "Manage plan" if already subscribed.

**How you win block (design detail)**

- Three horizontal "wells" of decreasing width represent the 40, 35, and 25 shares. The 5-match well is marigold-outlined with a small looping ripple to show the jackpot rolling forward if unclaimed.
- Below the wells, a **Try a sample draw** button plays the draw reveal (Section 6.4) with fixed sample numbers and a sample player card. It is clearly labelled as a demo and never touches real data.

**Plans block:** segmented Monthly and Yearly toggle (pill, sliding thumb animated with GSAP). Yearly shows the saving as a computed percentage. Example amounts are placeholders: ₹499 per month and ₹4,999 per year (about 17% saving). Real prices come from `platform_settings` and Stripe Prices. Under each plan, a plain-language split: "Of every payment: at least 10% to your charity, {prize_pool_pct}% to the prize pool, the rest runs the platform."

### 4.2 Charity directory and detail

**Directory (`/charities`)**

- Sticky search field (14 px radius) and filter chips (pill). Filters use a `category` value. Note for the agent: the first document's `charities` table has no `category` column. Add `category` (text) to the migration.
- Layout: an asymmetric grid. The featured charity spans two columns and is 36 px radius, image-led. The rest use 24 px cards. Card content: image, name, one-line mission, next event date if any.
- Results update as the user types (debounced 250 ms). List changes use GSAP Flip so cards glide to new positions instead of jumping.
- Empty result: "No charities match 'x'. Clear the search or try another category." with a **Clear filters** button.

**Detail (`/charities/[slug]`)**

- Full-bleed hero image with the charity name in Display L over a bottom gradient.
- Left column: description and image gallery (horizontal scroll with snap). Right column (sticky on desktop): "Support this charity" panel with **Subscribe and support {name}** (marigold) and **Make a one-off donation** (outline). The donation option is independent of gameplay (PRD §08.1) and is worded that way.
- **Upcoming events** list (for example golf days): date block, title, location. Empty state: "No events scheduled yet."

### 4.3 Signup and subscribe flow

A three-step wizard (this is a true sequence, so a step indicator is appropriate). Progress bar is a ripple ring that fills.

| Step | Name | Content |
|---|---|---|
| 1 | Your account | Full name, email, password. Inline validation, password strength meter. |
| 2 | Your cause | Charity grid (search and filter), then the percentage control. The charity is selected at signup, per PRD §08.1. |
| 3 | Your plan | Monthly or yearly, summary, **Subscribe** leading to Stripe Checkout |

**Percentage control (the emotional centre of this flow)**

- Range slider from **10%** (minimum, per the PRD) up to `max_charity_percent` from `platform_settings`. Quick-pick chips: 10%, 15%, 25%, 50%.
- Important dependency: charity percent and prize pool percent both come from the same payment. With a 50% default prize pool, the maximum charity percent cannot be 100%. Set `max_charity_percent` so that charity + prize pool never exceeds 100% (default 50). The first document's `CHECK charity_percent <= 100` should be tightened to match this setting.
- Live breakdown beside the slider, updated as it moves: "Of your ₹499: ₹50 to {charity}, ₹250 to the prize pool, ₹199 to the platform." The numbers tween (Section 6.7).
- On release, a coin travels along a curved path from "You" to the charity card (MotionPath). The charity card gets the `--glow-charity` ring.
- Below 10% is impossible (slider min). If the value is typed in a numeric field: "The minimum is 10% of your subscription."

**Charity selection micro-interaction:** the selected card draws a sea-glass check (DrawSVG) and takes the glow; the previously selected card releases it. Keyboard: radio-group semantics, arrow keys move, Space selects.

**Login (`/login`):** single centred card (24 px), email, password, **Log in**, link "Create an account". After login, route by role: subscribers to `/dashboard`, admins to `/admin`.

### 4.4 Subscriber dashboard (`/dashboard`)

All five PRD §10 modules are present on one screen, sized by importance rather than equally.

**Desktop layout (bento, 12 columns)**

```
+-------+---------------------------------------------------------------+
| Rail  | Good evening, Asha                       [Subscription: Active]|
|       |                                                               |
| Home  | +----------------------------+ +----------------------------+ |
| Scores| | 2. YOUR SCORES             | | 1. SUBSCRIPTION            | |
| Charity| | five slots, latest first  | | Active, renews 14 Oct      | |
| Draws | | [ Add score ]              | | Monthly plan  [Manage plan]| |
| Wins  | +----------------------------+ +----------------------------+ |
|       | +-------------+ +--------------------+ +------------------+ |
|       | | 3. CHARITY  | | 4. PARTICIPATION   | | 5. WINNINGS      | |
|       | | ring: 15%   | | Next draw in 9 days| | Total won ₹0     | |
|       | | {charity}   | | Draws entered: 4   | | Payment: none    | |
|       | +-------------+ +--------------------+ +------------------+ |
+-------+---------------------------------------------------------------+
```

(The numbers in the wireframe are the PRD's five required modules, listed for the agent. They are not shown on screen.)

Module specs:

| Module | Design |
|---|---|
| **1. Subscription status** | Status pill with icon. Mapping from internal states: `active` shows "Active" and the renewal date; `active` with `cancel_at_period_end` shows "Active, ends {date}"; `past_due`, `cancelled` (after period end), `lapsed`, `inactive` show "Inactive". Button: **Manage plan** (opens Stripe Customer Portal) or **Subscribe** if inactive. |
| **2. Scores** | Five circular slots in a row (wrap to 3 + 2 on mobile). Filled slots show the score (Numeric style) and the date beneath; empty slots are dashed rings inviting an entry. Ordered most recent first (PRD §05). Tap a slot to edit or delete. **Add score** opens the score sheet (below). A progress line reads "3 of 5 scores added" until five exist. |
| **3. Charity** | A ring gauge showing the contribution percentage, the charity name and logo, and **Change charity or percentage** (opens a sheet with the Section 4.3 control). |
| **4. Participation** | Countdown to the next draw (days and hours, text only, no ticking animation), "Draws entered: N", and a list of upcoming draws. |
| **5. Winnings** | Total won (Numeric, large). Below, the latest win as a two-step tracker: Payment pending, then Paid. If a win needs proof: a marigold **Upload proof** button. |

**Score sheet (add and edit)** (bottom sheet on mobile, right-side drawer on desktop):

- Date field: native date picker styled to tokens, defaults to today, future dates disabled (UI assumption U-1, since the PRD does not say).
- Score field: large Numeric input (1 to 45) with minus and plus stepper buttons. Typing outside 1 to 45 shows the range error immediately.
- Primary button: **Add score** (or **Save changes** when editing). Secondary: **Delete score** in coral text with a confirmation dialog.
- Duplicate date: inline error "You already have a score for 14 Sep. Edit that entry instead." with an **Edit entry** button that switches the sheet to that score.
- When a sixth score rolls the oldest off: toast "Score added. Your oldest score (12 Aug) was removed so your latest five stay on file." The motion is described in Section 6.5.
- Non-subscribers see the gated state (below) instead of the sheet.

**Gated state for non-subscribers** (PRD §04, restricted access): dashboard modules render as blurred previews behind one centred panel: "Subscribe to add scores and enter the monthly draw." with **Subscribe**. Non-subscribers can still browse charities and view profile settings.

**Subpages:** `/dashboard/scores`, `/dashboard/charity`, `/dashboard/draws`, `/dashboard/winnings`. They are focused, full-page versions of each module.

**Mobile:** the left rail becomes a bottom tab bar (Home, Scores, Charity, Draws, Wins) with 44 px targets. Modules stack in this order: Subscription, Scores, Participation, Charity, Winnings.

### 4.5 Draws and winnings (subscriber)

**Draws page (`/dashboard/draws`)**

- Latest published draw at the top: the five winning numbers as orbs (the signature moment), then the user's own five scores with matches highlighted, then the result line ("You matched 3 numbers" or "No match this month").
- Opening the page for a newly published draw plays the reveal once (Section 6.4). A **Replay** text button lets the user watch again. Past draws appear as a list of small static orb rows (no animation).
- Prize tier bars: 5, 4, and 3 matches with shares (40%, 35%, 25%), this month's pool per tier, and the jackpot carried in from previous months.
- Eligibility banner when the user has fewer than five scores: "Add 2 more scores to be eligible for the next draw."

**Winnings page (`/dashboard/winnings`)**

Each win is a row with the draw month, match type, prize amount, and two status pills (verification and payment).

| Verification state | Pill | Action shown |
|---|---|---|
| Awaiting proof (`pending_proof`) | Marigold, "Awaiting proof" | **Upload proof** |
| Under review (`submitted`) | Marigold, "Under review" | None |
| Approved (`approved`) | Sea glass, "Approved" | None |
| Rejected (`rejected`) | Coral, "Rejected" plus admin note | **Upload a new screenshot** |

| Payment state | Pill |
|---|---|
| Pending | Marigold, "Payment pending" |
| Paid | Sea glass, "Paid" with date |

Proof upload: drag-and-drop zone with helper text "Upload a screenshot of your scores from the golf platform." Accepts PNG, JPG, WebP up to 5 MB. Shows a thumbnail preview, a progress ring during upload, and a success check.

### 4.6 Admin dashboard (`/admin`)

**Shell:** collapsible left sidebar with the five PRD surfaces (Users, Draws, Charities, Winners, Reports), a top bar with a command palette trigger (Cmd or Ctrl + K) and the admin's avatar. Dense, calm, and fast: 14 px body text, 40 px rows, sticky table headers, no decorative motion. Lenis is off.

**Common patterns:** TanStack tables with column sorting, filter chips, and pagination. Row click opens a right-side drawer for details and edits (not a new page). Destructive actions use a dialog that names the thing being changed. Every admin write shows a toast and is recorded in the audit log.

| Surface | Design |
|---|---|
| **Users** | Table: name, email, plan, subscription status, charity, joined. Drawer tabs: **Profile** (view and edit), **Scores** (edit any of the five entries, same validation as the subscriber sheet), **Subscription** (status, plan, renewal, cancel or override). |
| **Draws** | List of monthly draws with status pills (Draft, Simulated, Published). Detail is a **four-step stepper**: Configure, Simulate, Review, Publish (a true sequence). See below. |
| **Charities** | Card-and-table hybrid. Create and edit in a drawer: name, description, category, featured toggle, image uploader (multiple), and an events sub-list. Delete requires confirmation; charities with contributions offer **Deactivate** as the safe alternative. |
| **Winners** | Table filtered by verification and payment status. Row drawer shows the proof screenshot (signed URL) beside the winner's `scores_snapshot` so the reviewer can compare. Buttons: **Approve**, **Reject** (requires a note), then **Mark as paid** (disabled until approved, with a tooltip: "Approve the proof before marking as paid."). |
| **Reports** | Four tiles matching the PRD exactly: **Total users**, **Total prize pool**, **Charity contribution totals**, **Draw statistics**. Total users and prize pool are large numbers. Charity totals are a horizontal bar chart by charity. Draw statistics is a small chart of winners per tier per month. |

**Draw stepper detail**

1. **Configure:** month, mode (Random or Algorithmic), and for Algorithmic the bias (most frequent or least frequent scores). Shows eligible subscriber count and the pool total per tier including the jackpot carried in.
2. **Simulate:** **Run simulation** shows the numbers, winners per tier, and payout per winner. A persistent marigold banner reads "Simulation. Nothing is published or paid." The admin can re-run as many times as needed.
3. **Review:** side-by-side summary of the last simulation and the pool math (rounding remainder, rollover out).
4. **Publish:** **Publish draw** opens a dialog: "Publish {month} draw? Winners are recorded and prizes are created. This can't be undone." The button is disabled for 1 second after the dialog opens to prevent accidental confirmation. After publish, the page shows the reveal once (same component as the subscriber view) and a success toast: "Draw published."

---

## 5. Component Specification

| Component | Spec |
|---|---|
| **Button, primary (Subscribe)** | Pill, 48 px tall (56 px in hero), marigold fill, Ink text, weight 650. Hover: brightness up 6% and `--glow-reward`. Press: scale 0.97 over 120 ms. Magnetic pull on desktop with a fine pointer (Section 6.6). Loading state: label replaced by a small ripple spinner and the width is locked. |
| **Button, secondary** | Pill, transparent, 1 px `--color-line` border, Foam text. Hover fills `--color-surface-2`. |
| **Button, quiet** | Text only, Tide colour, underline on hover. Used for links such as "See how the draw works". No arrow glyph. |
| **Button, destructive** | Coral text with coral border. Fills coral on hover only inside confirmation dialogs. |
| **Input, select, date** | 14 px radius, 48 px tall, `--color-surface` fill, 1 px line border. Focus: 2 px sea-glass outline. Error: coral border and message below in Small. Label above the field, always visible (no floating labels). |
| **Score stepper** | Numeric display 64 px, minus and plus 44 px circle buttons, arrow keys change value, holding a button repeats after 400 ms. |
| **Score slot** | 72 px circle (64 on mobile). Filled: `--color-surface-2`, score in Numeric, date in Caption beneath. Empty: 1.5 px dashed `--color-line` ring. |
| **Draw orb** | 64 px circle, `--color-surface-2` with a 1 px line border, number in Numeric. Matched state: sea-glass fill, Lagoon text, `--glow-charity`. Numbers are always in the DOM so screen readers read them without waiting for animation. |
| **Charity card** | 24 px radius. Image on top with a 4:3 crop, name (Subheading), one-line mission (Small, Tide). Selected: `--glow-charity` and a drawn check. Focus and hover change the border colour only. |
| **Percentage slider** | Track 6 px, thumb 28 px with a sea-glass ring, tick marks at 10, 25, 50. Keyboard: arrows step 1, Page Up and Down step 5. Announces "15 percent to {charity}". |
| **Plan toggle** | Segmented pill with a sliding thumb. |
| **Status pill** | Pill, icon plus text, semantic colour at 15% fill and full-colour text. |
| **Data table** | 40 px rows, sticky header, hover row `--color-surface-2`. On screens below 768 px each row becomes a stacked card with label and value pairs. |
| **Sheet and drawer** | Bottom sheet on mobile (drag handle, 85% max height), right drawer 480 px on desktop. Backdrop blur 12 px. |
| **Toast** | Bottom right (desktop) or top (mobile), 24 px radius, one-line message, optional action. Auto-dismiss after 4 seconds, pauses on hover. |
| **Skeleton** | Surface-coloured blocks with a slow horizontal sheen (CSS animation, 1.6 s). Route-level `loading.tsx` for every route group. |
| **Empty state** | Small ripple illustration, one sentence saying what is missing, one button that fixes it. |
| **Ripple loader** | Three concentric rings pulsing outward in sequence (CSS keyframes, 1.2 s). Used for buttons and full-page loads. |

---

## 6. Motion System (GSAP)

### 6.1 Rules

1. **Motion budget.** Unprompted motion is limited to: the homepage hero sequence (once per visit) and the pinned how-it-works sequence. Everything else is user-triggered.
2. **Only animate `transform`, `opacity`, and SVG stroke and attributes.** Never animate `width`, `height`, `top`, or `left`.
3. **Every animation lives in `useGSAP()` with a `scope`.** No global timelines. Cleanup is automatic.
4. **Reduced motion is a first-class path.** Every sequence has a `prefers-reduced-motion: reduce` branch that jumps to the end state or uses a short opacity fade (under 150 ms).
5. **Content must be readable without JavaScript.** Server-rendered HTML shows the final state. Elements that will be animated in start hidden through a `.pre-anim` class set in CSS and released by GSAP, with a `<noscript>` rule and a 2-second fallback that removes the class. This avoids a flash of content before the animation starts.
6. **Bundle discipline.** GSAP core and plugins load only on routes that need them. Dashboard routes load core, `Flip`, and `useGSAP` only. ScrollTrigger, SplitText, MotionPath, and Draggable load on marketing and signup routes. Target under 60 KB gzipped of animation code on the homepage.
7. **Mobile.** Disable scroll pinning below 1024 px, cap ripple rings at 4, no pointer-driven effects on touch devices.

### 6.2 Motion inventory

| # | Where | Trigger | What moves | Tool | Duration |
|---|---|---|---|---|---|
| M1 | Homepage hero | Page load (once) | Headline lines rise through a mask, sub and button fade in, ripple rings draw in | SplitText, DrawSVG, timeline | 1.4 s |
| M2 | Hero ripple field | Pointer move (desktop) | New ring spawns at pointer, expands, fades | `gsap.fromTo` on SVG circles | 2 s per ring |
| M3 | How it works | Scroll (desktop) | Section pins, three steps advance as the user scrolls, progress line grows | ScrollTrigger, scrub | Scroll-driven |
| M4 | Impact strip and pool totals | Enters viewport (once) | Numbers count up | `gsap.to` on a proxy object | 1.4 s |
| M5 | Draw reveal | User opens the draw or clicks Try a sample draw | Five orbs drop in sequence, matches pulse | Timeline, `bounce.out` | About 3 s |
| M6 | Score add, edit, delete | Form submit | Oldest chip exits, others shift, new chip enters | Flip, timeline | 0.55 s |
| M7 | Percentage slider | Slider release | Coin travels to the charity, breakdown numbers tween | MotionPath, tween | 1.1 s |
| M8 | Charity selection | Select | Check draws in, glow moves | DrawSVG | 0.4 s |
| M9 | Subscribe button | Pointer near (desktop) | Button drifts toward the pointer | `gsap.quickTo` | 0.4 s |
| M10 | Plan toggle | Toggle | Thumb slides, prices cross-fade | Flip or `x` tween | 0.3 s |
| M11 | Charity directory filter | Search or filter change | Cards glide to new positions | Flip | 0.5 s |
| M12 | Charity preview row | Drag | Momentum scroll | Draggable, InertiaPlugin | Physics |
| M13 | Route change | Navigation | Page content fades in | Opacity tween in `template.tsx` | 0.3 s |
| M14 | Sheets, dialogs, toasts | Open and close | Slide and fade | Radix state plus CSS transitions (GSAP not needed) | 0.2 to 0.35 s |
| M15 | Status change (for example Pending to Paid) | State change | Pill cross-fades, small check draws | DrawSVG | 0.4 s |

Hover states on cards and rows are colour changes only (CSS, 120 ms). They are not GSAP animations.

### 6.3 Setup: `lib/motion/gsap.ts`

```ts
'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase);

CustomEase.create('soft', '0.22, 1, 0.36, 1');
gsap.defaults({ ease: 'soft', duration: 0.6 });

export { gsap, useGSAP, ScrollTrigger, Flip, SplitText };
```

Split into two files in practice: `gsap-core.ts` (core, `useGSAP`, `Flip`, `CustomEase`) for the dashboard, and `gsap-marketing.ts` (everything else) for public routes, so the dashboard bundle stays small.

**Smooth scroll (marketing layout only)**

```ts
// components/motion/SmoothScroll.tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/motion/gsap-marketing';

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return null;
}
```

### 6.4 Draw reveal (the signature moment): `components/motion/DrawReveal.tsx`

Five orbs drop in one after another, land, and any orb that matches one of the user's scores lights up in sea glass. In the homepage demo the "user scores" are fixed sample values.

```ts
export function playDrawReveal(root: HTMLElement, matchedValues: number[]) {
  const orbs = gsap.utils.toArray<HTMLElement>('[data-orb]', root);
  const tl = gsap.timeline();

  // 1. Orbs drop in sequence
  tl.from(orbs, {
    y: -260, autoAlpha: 0, scale: 0.7,
    duration: 0.9, ease: 'bounce.out', stagger: 0.32,
  });

  // 2. Matches light up, one by one, after all orbs have landed
  const matched = orbs.filter((o) => matchedValues.includes(Number(o.dataset.value)));
  tl.to(matched, {
    backgroundColor: 'var(--color-charity)', color: 'var(--color-bg)',
    boxShadow: 'var(--glow-charity)', scale: 1.12,
    duration: 0.25, stagger: 0.2, yoyo: true, repeat: 1,
    // yoyo returns scale to 1, colours persist via onComplete
    onComplete: () => gsap.set(matched, { scale: 1 }),
  }, '+=0.2');

  // 3. Result line
  tl.from('[data-draw-result]', { autoAlpha: 0, y: 10, duration: 0.4 }, '+=0.1');
  return tl;
}
```

Note for the agent: because `yoyo` also reverts colour, apply the colour and glow in a separate `tl.set(matched, {...})` after the pulse, and keep only `scale` inside the yoyo tween. Verify visually.

Reduced motion: skip the timeline; render orbs in their final state with matches already highlighted.

### 6.5 Score list change: Flip

Pattern: capture state, exit the oldest, update React state, then Flip the rest. Keys must be the score `id` so React keeps elements stable.

```ts
const listRef = useRef<HTMLUListElement>(null);
const flipState = useRef<ReturnType<typeof Flip.getState>>();

// Called by the form before it updates state
async function addScore(input: NewScore) {
  const res = await postScore(input);            // server enforces the 5-score rule
  const oldest = res.removedId
    ? listRef.current?.querySelector(`[data-score-id="${res.removedId}"]`)
    : null;

  if (oldest) await gsap.to(oldest, { autoAlpha: 0, x: -24, duration: 0.25, ease: 'settle' });
  flipState.current = Flip.getState('[data-score-chip]', { props: 'opacity' });
  setScores(res.scores);                         // React re-renders
}

useGSAP(() => {
  if (!flipState.current) return;
  Flip.from(flipState.current, {
    duration: 0.55, ease: 'soft', absolute: true,
    onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.4 }),
  });
  flipState.current = undefined;
}, { dependencies: [scores], scope: listRef });
```

### 6.6 Magnetic Subscribe button

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const btn = ref.current!;
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.25);
    };
    const leave = () => { xTo(0); yTo(0); };
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerleave', leave);
    return () => { btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerleave', leave); };
  });
}, { scope: ref });
```

### 6.7 Hero sequence, ripples, count-up, coin path

**Hero timeline (M1)**

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'soft' } });
    SplitText.create('[data-hero-title]', {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => {
        gsap.set('[data-hero-title]', { autoAlpha: 1 });   // releases .pre-anim
        return tl.from(self.lines, { yPercent: 110, duration: 0.9, stagger: 0.09 });
      },
    });
    tl.from('[data-hero-sub]', { autoAlpha: 0, y: 12, duration: 0.6 }, '-=0.5')
      .from('[data-hero-cta]', { autoAlpha: 0, scale: 0.94, duration: 0.5 }, '-=0.4')
      .from('[data-ripple-ring]', { drawSVG: '0%', duration: 1.4, stagger: 0.12, ease: 'power2.inOut' }, 0.2);
  });
  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('[data-hero-title],[data-hero-sub],[data-hero-cta]', { autoAlpha: 1 });
  });
}, { scope: heroRef });
```

**Pointer ripple (M2)**: spawn into a dedicated `<g data-spawn>` group so the decorative rings are not counted.

```ts
export function spawnRipple(group: SVGGElement, x: number, y: number) {
  if (group.childElementCount >= 8) return;               // cap concurrent rings
  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', String(x));
  ring.setAttribute('cy', String(y));
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', 'var(--color-charity)');
  ring.setAttribute('stroke-width', '1.5');
  group.appendChild(ring);
  gsap.fromTo(ring, { attr: { r: 0 }, opacity: 0.5 },
    { attr: { r: 220 }, opacity: 0, duration: 2, ease: 'power2.out', onComplete: () => ring.remove() });
}
// Throttle the pointermove handler to one spawn per 120 ms.
```

**Count-up (M4)**: server-render the final value and set `aria-label` to it, then animate the visible text.

```ts
const proxy = { v: 0 };
gsap.to(proxy, {
  v: target, duration: 1.4, ease: 'power2.out',
  scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  onUpdate: () => { el.textContent = inr.format(Math.round(proxy.v)); },   // Intl.NumberFormat('en-IN')
});
```

**Charity coin (M7)**

```ts
function sendCoin() {
  gsap.fromTo('[data-coin]', { autoAlpha: 1 }, {
    motionPath: { path: '#flow-path', align: '#flow-path', alignOrigin: [0.5, 0.5] },
    duration: 1.1, ease: 'power1.inOut',
    onComplete: () => { gsap.to('[data-coin]', { autoAlpha: 0, duration: 0.2 }); pulseCharityCard(); },
  });
}
// Call on slider release, never on every tick. Breakdown numbers use gsap.to on a proxy, 0.35 s.
```

**Pinned "how it works" (M3)**

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current, start: 'top top',
        end: () => `+=${steps.length * 60}%`,
        pin: true, scrub: 0.6, anticipatePin: 1,
      },
    });
    steps.forEach((step, i) => {
      tl.from(step, { autoAlpha: 0, x: 40, duration: 1 })
        .to('[data-step-progress]', { scaleY: (i + 1) / steps.length, duration: 1 }, '<');
      if (i < steps.length - 1) tl.to(step, { autoAlpha: 0.25, duration: 1 });
    });
  });
  // Below 1024 px or with reduced motion, the three steps are simply stacked and visible.
}, { scope: sectionRef });
```

**Route transition (M13)**: `app/template.tsx`. Opacity only, because a transform on a wrapper would break `position: fixed` children.

```tsx
'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap-core';

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.from(ref.current, { autoAlpha: 0, duration: 0.3, clearProps: 'all' }); }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}
```

### 6.8 Motion QA checklist

- [ ] Every animation is inside `useGSAP` with `scope`, and no listener or ticker leaks after unmount (navigate 20 times and check).
- [ ] `ScrollTrigger.refresh()` is called after fonts and images load.
- [ ] Reduced motion tested in the OS setting: no pinning, no drop, no ripple spawn, content fully visible.
- [ ] 60 fps on a mid-range Android device (Chrome DevTools performance panel, 4x CPU throttle).
- [ ] No layout shift caused by animation (CLS under 0.1).
- [ ] Hero text is visible with JavaScript disabled.

---

## 7. Accessibility and Responsiveness

**Accessibility (WCAG 2.2 AA)**

- Contrast: body text on `--color-bg` exceeds 12:1; Mist text (`--color-text-3`) is used at 14 px and above only; marigold buttons use Ink text (above 10:1).
- Visible focus on every interactive element (2 px sea-glass outline, 3 px offset).
- Full keyboard operation: charity selection (radio group), percentage slider, score stepper, tables, drawers (focus trapped, Esc closes, focus returns to trigger).
- Status is never colour-only: icon plus text on every pill.
- The draw reveal is an enhancement. The numbers and result sentence are in the DOM in reading order and announced through an `aria-live="polite"` region after the animation ends.
- Forms: labels always visible, errors tied with `aria-describedby`, error summary focused on submit failure.
- Proof upload has a keyboard-accessible file input in addition to drag and drop.

**Responsive behaviour**

| Area | Below 768 px | 768 to 1023 px | 1024 px and above |
|---|---|---|---|
| Public navigation | Hamburger sheet, persistent bottom Subscribe bar | Inline links, Subscribe in header | Inline links, Subscribe in header |
| Hero | Text over faded ripple, full-width button | Two columns, smaller ripple | Two columns |
| How it works | Stacked steps, no pinning | Stacked steps, no pinning | Pinned scroll sequence |
| Dashboard | Bottom tab bar, single column modules | Left rail collapsed to icons, two columns | Left rail expanded, bento grid |
| Admin tables | Stacked cards per row, filters in a sheet | Table with horizontal scroll | Full table |
| Drawers | Bottom sheets | Right drawers 400 px | Right drawers 480 px |

Test widths: 360, 390, 768, 1024, 1280, and 1536.

---

## 8. Implementation Order (front end)

Work in vertical slices, in this order. It aligns with Phases 3 and 4 of the first document.

| Step | Deliverable | Done when |
|---|---|---|
| U1 | Tokens, fonts, Tailwind theme, base layout, focus styles | A style sheet page (`/dev/styleguide`) shows colours, type scale, and radii |
| U2 | Primitives: buttons, inputs, pills, sheet, dialog, toast, skeleton, empty state, ripple loader | Each has all states (default, hover, focus, disabled, loading, error) |
| U3 | Motion infrastructure: `gsap-core`, `gsap-marketing`, `SmoothScroll`, `useReducedMotion`, `template.tsx`, `.pre-anim` handling | Route fade works, reduced motion verified |
| U4 | Homepage blocks 1 to 8 including hero sequence, pinned steps, count-ups, sample draw | Lighthouse performance 90 or higher on mobile, hero visible without JS |
| U5 | Charity directory and detail pages with Flip filtering | Search and filter animate and remain keyboard accessible |
| U6 | Signup wizard, percentage control, plan selection, Stripe hand-off | 10% minimum enforced, breakdown numbers correct, coin animation plays once per release |
| U7 | Dashboard shell and five modules, score sheet with Flip, gated state | Every PRD §10 module works on mobile and desktop |
| U8 | Draws and winnings pages, draw reveal, proof upload | Reveal plays once, replay works, reduced motion path verified |
| U9 | Admin shell and five surfaces, draw stepper, winner review with proof beside snapshot | An admin can complete simulate, review, publish, verify, and mark as paid without leaving the UI |
| U10 | Polish and QA: motion checklist (6.8), accessibility audit, cross-browser (Chrome, Safari, Firefox), visual regression screenshots at 360, 768, 1280 | All checks pass |

**Additional folders (added to the earlier repo structure)**

```
/components
  /ui           restyled shadcn primitives
  /motion       DrawReveal, RippleField, MagneticButton, CountUp, PinnedSteps, SmoothScroll
  /marketing    Hero, ImpactStrip, HowItWorks, Spotlight, PrizeTiers, Plans, CharityRow
  /dashboard    ScoreSlots, ScoreSheet, CharityGauge, ParticipationCard, WinningsCard
  /admin        DataTable, DrawStepper, WinnerReview, ReportTiles
/lib/motion     gsap-core.ts, gsap-marketing.ts, use-reduced-motion.ts, tokens.ts
```

---

## 9. Content and Microcopy

Sentence case, active voice, plain words. A button keeps the same verb through the whole flow (the button says "Subscribe", the confirmation says "You're subscribed").

| Situation | Copy |
|---|---|
| Primary call to action | **Subscribe** |
| Non-subscriber gate | "Subscribe to add scores and enter the monthly draw." |
| Subscription confirmation | "You're subscribed. Add your latest five scores to enter the next draw." |
| Lapsed subscription | "Your subscription lapsed on 3 Sep. Renew to add scores and join the next draw." |
| Cancellation scheduled | "Your plan ends on 14 Oct. You can resubscribe any time before then." |
| Add score button and toast | **Add score** and "Score added." |
| Score rolled off | "Score added. Your oldest score (12 Aug) was removed so your latest five stay on file." |
| Duplicate date | "You already have a score for 14 Sep. Edit that entry instead." |
| Score out of range | "Enter a score from 1 to 45." |
| Fewer than five scores | "Add 2 more scores to be eligible for the next draw." |
| No scores yet | "No scores yet. Add your latest five to enter the next draw." |
| Charity percentage minimum | "The minimum is 10% of your subscription." |
| Charity split | "Of your ₹499: ₹50 to {charity}, ₹250 to the prize pool, ₹199 to the platform." (example values) |
| Independent donation | "Make a one-off donation. It's separate from your subscription and the draw." |
| Proof upload prompt | "Upload a screenshot of your scores from the golf platform." |
| Verification states | "Awaiting proof", "Under review", "Approved", "Rejected: {admin note}. Upload a new screenshot." |
| Payment states | "Payment pending", "Paid on {date}" |
| Draw result (win) | "You matched {n} numbers. You've won ₹{amount}. Upload proof to claim it." |
| Draw result (no win) | "No match this month. Your scores stay in for the next draw." |
| Simulation banner | "Simulation. Nothing is published or paid." |
| Publish dialog | Title: "Publish {month} draw?" Body: "Winners are recorded and prizes are created. This can't be undone." Buttons: **Publish draw**, **Cancel** |
| Publish success | "Draw published." |
| Mark as paid disabled | "Approve the proof before marking as paid." |
| Network or server error | "That didn't save. Check your connection and try again." with **Try again** |
| Upload error | "That file couldn't be uploaded. Use a PNG, JPG, or WebP under 5 MB." |
| 404 | "We can't find that page." with **Go to homepage** |

Errors state what happened and how to fix it, and never apologise. Empty states say what is missing and give one button that fixes it.

---

## 10. Design Acceptance Checklist (maps to PRD §16.1)

- [ ] Homepage shows what the user does, how they win, the charity impact, and a prominent Subscribe call to action (PRD §12).
- [ ] No fairway, plaid, or club imagery anywhere as primary design language.
- [ ] Signup includes charity selection with a 10% minimum; the breakdown math matches the payment snapshot.
- [ ] Subscription flow works for monthly and yearly with clear status, renewal date, and lapsed states.
- [ ] Score entry demonstrates the 5-score rolling behaviour, one score per date, range 1 to 45, reverse chronological order.
- [ ] Dashboard has all five PRD §10 modules.
- [ ] Draw reveal, tiers (40, 35, 25), and jackpot rollover are understandable at a glance.
- [ ] Winner flow shows proof upload, admin approve or reject, and Pending then Paid.
- [ ] Admin has all five surfaces: users, draws, charities, winners, reports.
- [ ] Subtle transitions and micro-interactions exist on every interactive surface (Section 6.2).
- [ ] Responsive on mobile and desktop at the widths in Section 7.
- [ ] Error handling and edge cases have designed states (Section 9).
- [ ] Reduced motion, keyboard, and contrast checks pass (Sections 6.8 and 7).

---

## 11. Open Design Assumptions (add to the README with A1 to A10)

| # | Assumption |
|---|---|
| U-1 | Future dates cannot be entered as a score date. |
| U-2 | Charity percentage has an upper bound (`max_charity_percent`, default 50%) so that charity plus prize pool never exceeds 100% of a payment. The PRD only sets the minimum. |
| U-3 | Example prices (₹499 monthly, ₹4,999 yearly) are placeholders for layout. Real prices come from Stripe and `platform_settings`. |
| U-4 | Charities have a `category` used by the directory filter (needs a migration column). |
| U-5 | Users see "Inactive" for `past_due`, `lapsed`, and expired `cancelled` subscriptions, since the PRD names only active and inactive. |
| U-6 | Proof screenshots accept PNG, JPG, or WebP up to 5 MB. |
