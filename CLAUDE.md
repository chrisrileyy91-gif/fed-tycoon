# CHAIR — The Fed Game · Co-Developer Brief

## The product

CHAIR is an educational Federal Reserve tycoon game built for the App Store. The player is Fed Chair for a 4-year term, managing inflation, unemployment, and growth through rate decisions, QE/QT operations, and stakeholder relationships — with credibility as the master metric. It teaches real monetary economics through play, not lectures.

**Genre:** Strategy-card hybrid. The strategy layer is the macro engine (real transmission chains, lagged effects, tradeoffs). The card layer is the event system (themed decks of situations that force decisions). The tactile layer is QE tapping (the signature dopamine mechanic). Think Reigns meets Civilization's economy, built on real economics.

**Cardinal rule: economics all the way down.** Every cause-and-effect must be truthful to real-world monetary economics. Coefficients can be tuned for gameplay; causal directions cannot be invented. The game's educational value and its differentiation both depend on this.

**Objective:** Ship to the App Store. The game must be engaging enough to retain casual players AND accurate enough that an economics professor would endorse it. Those aren't in tension — the real tradeoffs are inherently dramatic.

## Workflow

We work in **VS Code with Claude Code**. Repo: `chrisrileyy91-gif/fed-tycoon` (main branch, GitHub Pages). Claude Code edits `index.html` directly. After edits, here are the PowerShell commands:

```powershell
cd C:\Users\chris\Dev\fed-tycoon
git add -A
git commit -m "description of changes"
git push origin main
```

Syntax-check before every commit: extract the `<script>` block, run through `vm.Script`. The single `index.html` is the code source of truth — orient from it at session start. ROADMAP.md has the phased build plan with dependencies and validation criteria.

---

## The macro engine (macroTick)

Real transmission chain, computed in causal order each tick:

**Expectations → Growth → Unemployment → Inflation**

### 1. Inflation expectations (self-fulfilling)
```
anchorW = clamp((cred - 15) / 135, 0.15, 1.0)
exp += (2 * anchorW + inf * (1 - anchorW) - exp) * 0.04
```
High credibility → anchored at 2%. Low credibility → drift toward actual inflation (1970s spiral). Floor of 0.15 = institutional inertia. Convergence 4%/month. Expectations replace the hard-coded "2" in the inflation equation — they ARE the inflation anchor.

### 2. Rate transmission (lagged)
`transmitted += (stance - transmitted) * 0.10` where stance = rate - neutral (2.75).

### 3. Growth
`gr += (2.5 - transmitted*0.8 - supplyShock*0.6 + growthPush - gr) * 0.07`

### 4. Okun's Law (growth → unemployment)
`un += (4 + (2.5-gr)*0.8 + supplyShock*0.5 + unempPush - un) * 0.05`

### 5. Phillips Curve, non-linear (unemployment → inflation)
- Below NAIRU (un < 4): `phillips = pow(gap, 1.5) * 0.45` — accelerating
- Above NAIRU: `phillips = gap * 0.15` — flat
- `inf += (exp + phillips - transmitted*0.15 + supplyShock*1.2 + infPush - inf) * 0.06`

**All coefficients are hypotheses.** Causal directions are economics; magnitudes are game design.

## QE/QT mechanics

- **QE:** `growthPush += 0.03` per tap, `reserves += 25`. NOT direct inflation — works through growth→employment→Phillips chain.
- **QT:** `growthPush -= 0.06`, drains ≤$200B reserves, adds stress.
- **QE cost scales with rate:** `min(5, floor((rate-1)*1.5))` credibility when rate > 1%. Free at zero bound (ZLB teaching).
- **Inter-meeting:** additional 6 credibility penalty.

## FOMC decisions

Hike +25bp, Hike +50bp, Hold, Cut -25bp, Cut -50bp. fx = `{rate: X}` only. No bypass pushes.

## Effect rules

- **Supply shocks** (war, oil, strikes, tariffs): `supplyShock`. Never add `infPush` on top.
- **Demand shocks** (pandemic, fiscal): `growthPush` / `unempPush`. Let Phillips/Okun transmit.
- **Direct infPush only for:** observed realized prices, expectations-anchoring communication, small fiscal friction.
- **Political events:** approval + credibility only, never macro.

## Scoring

Base drain -1.5/month. On-mandate: inf ±0.5 of 2%, un ±0.8 of 4%. Streak bonus up to +2.2/month. Angry factions (<25): -0.8 each. Political pressure from Congress/People anger only (Banks/Treasury have their own stakeholder cards). Term ends at month >48. Cred ≤ 0 = removed.

## Plumbing (balance sheets)

Fed: Securities (= reserves + TGA) | Reserves owed + TGA owed. Banks: Reserves + Loans | Deposits. Government: Debt + Stress.

---

## Current content inventory

**3 scenarios/decks:** AI Boom (inf=4.2, un=3.8, rate=2.50), Slowdown (inf=1.9, un=5.8, rate=4.75), Election Year (inf=2.6, un=4.5, rate=3.75).

**6 global shocks:** War, Pandemic, FX Crisis, Oil Cartel, Chinese Economic Crisis, European Sovereign Debt Crisis.

**10 domestic events:** Grocery prices [2-14], Congress spending [4-18], Presidential pressure [10-30], Housing bubble [8-28], Tech layoffs [6-26], Debt ceiling [24-46], Auto strike [14-38], Consumer confidence [20-42], Trade war [26-46], Wage spike [3-20].

**4 stakeholder anger cards, 3 pressure tiers, 5 FOMC options, 4 ending tiers (3 narratives each).**

**UI:** Expectations gauge (⚓), balance-sheet plumbing drawer, iOS AudioContext resume, display-toggle toasts.

---

## Phase 1A design spec: Equity/Asset Market

The equity index is an amplifier embedded in the existing transmission chain — not a parallel system. It reads from the engine's state variables and feeds back into them through channels that already exist.

### Wiring diagram

**Inputs to equities (what moves the market):**
- Growth → equity earnings (positive: strong economy = strong profits)
- Rate stance → discount rate (negative: hikes push valuations down)
- QE → portfolio balance effect (positive: direct asset price support)
- Random noise (markets are volatile — ±1.5 points/month)
- Mean reversion (markets overshoot and correct)

**Outputs from equities (what the market causes):**
- Wealth effect → growth equation: `(equities - 100) * coefficient` modifies growth. Equities above baseline boost consumption; below baseline drag it. This connects equities to the ENTIRE downstream chain: growth → Okun's → unemployment → Phillips → inflation → expectations → credibility.
- Crash threshold → financial stress: equities down >20% from trailing peak adds stress and fires a crisis event card.
- Bubble threshold → pressure event: equities sustained >140 for 6+ months fires an "irrational exuberance" event.

### Pricing equation (hypothesis)
```javascript
const eqTarget = 100 + (S.gr - 2.5) * 15 - S.transmitted * 12 + qeBoost;
S.equities += (eqTarget - S.equities) * 0.12 + (Math.random() - 0.5) * 3;
S.equities = clamp(S.equities, 20, 250);
```
Convergence 12%/month (faster than macro — markets move before the economy). Noise ±1.5/month. Policy signal dominates noise on a 3-month horizon — a 25bp hike should reliably move equities down 3-5 points over a quarter.

### Crash and bubble events

**Correction (10-15% below peak):** No event card. Automatic stress addition. Plumbing quietly tightens.

**Crash (>20% below peak):** Full-screen crisis alert. Two responses:
- Provide emergency liquidity: reserves up, stress down, banks love it — but moral hazard (you taught markets the Fed will always rescue them). Small credibility cost.
- Let markets find a bottom: stress stays elevated, banks/people angry — but credibility rises for not panicking. Discipline over comfort.

**Bubble (>140 sustained 6+ months):** Pressure event. Two responses:
- Warn about valuations: equities dip from jawboning, banks angry, but you're on record.
- Stay silent: no immediate consequence — but if a crash later fires, the consequences AMPLIFY because you ignored the warning. This teaches the 2006-2007 lesson.

### UI placement

NOT a desk gauge (that implies a policy target — equities have no target). Instead: a dedicated ticker element between the FOMC pill and QE/QT toolbar. Slim bar, always visible, mono font, green/red color shifts on movement. Signals "I'm a market reaction, not a policy variable." Always moving, always reacting — the player's peripheral awareness that markets are watching.

### Economics audit
- Rate → equity valuation via discount rate: real, well-documented
- Equity → consumption → growth via wealth effect: real (0.3-0.5% consumption per 10% equity change)
- QE → asset prices via portfolio balance: real (this IS how QE transmits)
- Crash → credit tightening → recession: real (2008 mechanism)
- Equity is NOT a Fed target: real (the game must never imply it is)

---

## Product vision & roadmap

See ROADMAP.md for the phased build plan. Summary:

### The deck system

Scenarios become **decks** — themed card packs selected before each term. Each deck has unique starting conditions, curated event cards, themed crises, a narrative arc, and a difficulty rating.

**Core decks (build these):**
| Deck | Theme | Difficulty | Key mechanic |
|------|-------|-----------|-------------|
| AI Boom | Tech spending, hot inflation, predecessor behind curve | ★★☆ | Must tighten into euphoria |
| The Slowdown | Overtightened predecessor, recession risk | ★★☆ | Must ease without re-igniting inflation |
| Election Year | Political pressure vs independence | ★★☆ | Stakeholder management under fire |
| Pandemic | Lockdowns → stimulus → inflation hangover | ★★★ | Emergency tools, then fighting what you created |
| The Volcker Test | 1970s stagflation, un-anchored expectations | ★★★★ | Must deliberately cause recession to break spiral |
| Financial Crisis | Housing collapse, bank runs, zero bound | ★★★ | QE is your only tool |
| Trade War | Tariffs, supply chains, retaliation | ★★☆ | Supply shocks you can't fix with rates |

**Expansion decks (later):**
- Wartime Economy — military spending, sanctions, commodities
- Dollar Crisis — EM contagion, capital flight, swap lines
- The Soft Landing — perfection maintenance (★☆☆)
- Climate Emergency — disaster spending, energy transition
- Crypto Winter — stablecoin run, digital contagion

**Unlock progression:** Complete a term (any tier) → unlock the next deck. Master-tier → unlock bonus/harder decks. Progression through skill, not grinding.

### Asset/equity market integration

An equity index that reacts to conditions and decisions. Economically truthful — the stock market IS a real transmission channel:

**The real economics (and the game mechanic):**
- Rate hikes → higher discount rate → equities fall → wealth effect drags consumption → growth slows (this is HOW hikes reach Main Street)
- Rate cuts → equities rally → wealth effect boosts spending
- QE → pushes asset prices up (portfolio balance effect — this is how QE actually works in practice)
- Growth → earnings → equities rise
- Equity crash → financial stress → credit tightens → recession risk (2008)
- Equity bubble → overconfidence → overheating → the Fed's dilemma

**Game integration:**
- Visible equity ticker (always moving, always reacting)
- Wealth effect feeds growth equation
- Crashes trigger stress events + stakeholder reactions
- Bubbles create pressure events ("irrational exuberance")
- "Fed put" tension: markets expect you to cut when stocks fall (moral hazard)
- Banks care about asset prices (their portfolios). People care about 401k.

**NOT a trading minigame.** Player watches markets react to their policy. Learns that the stock market is a transmission channel, not a target.

### Engagement architecture

Addictive WITHOUT violating economics-first:

**Within a term:**
- Streak counter (exists) — visible on-mandate streak
- Historical comparisons — "Your trajectory matches Volcker's 1982"
- Breaking news moments — full-screen crisis alerts (exists, needs variety)
- QE tap feedback — money flying, counter climbing (exists)
- Equity ticker — always moving, always reacting (planned)
- Mini-milestones — "First year survived," "Inflation below 3%"

**Between terms:**
- Deck unlocks — complete terms to access new scenarios
- Achievement badges — "Survived a pandemic," "Volcker'd the spiral"
- Personal records — best credibility per deck, longest streak
- Share cards — "I served during the AI Boom. Credibility: 167. Beat my term?"
- Daily challenge — same random seed for everyone, leaderboard

**Retention = mastery, not grinding.** Return because you want a better term or a harder deck, not because a number goes up.

### Animation & UI priorities

- Transmission chain visualization (animated flow: rate → growth → un → inf)
- Sparkline history in each gauge (last 12 months)
- Card flip animations for event reveals
- Equity ticker (always visible, always moving)
- Better QE tap feedback (particles, sound escalation)
- Crisis atmosphere (red vignette, tension music, screen shake)
- End-of-term cinematic (newspaper front page or historical assessment)
- Mobile-first everything

---

## Architecture notes

**Current:** Single `index.html`, all inline, GitHub Pages.

**App Store path:** WebView wrapper (Capacitor) — game logic unchanged, just the shell. Local storage for persistence initially, Supabase/Firebase for cross-device sync and leaderboards when ready.

**Backend (when ready):** Thin/managed. Stores: profiles, deck unlocks, achievements, daily seeds, leaderboards. Never touches accounting core or macro engine — those stay client-side permanently.

---

## Project status

**Phase 0: ✅ CLEARED.** +162.8 credibility gap deliberate vs spam. 100% spam fail rate.

**Phase 1: IN PROGRESS.**
- ✅ Inflation expectations variable
- ✅ Non-linear Phillips Curve
- ✅ Rate-dependent QE cost
- ✅ 9 new events + spacing fix
- ✅ -50bp cut, balance-sheet drawer, AI Boom rebalance
- ✅ Political anger fix, bug fixes, iOS audio
- ✅ Asset/equity market integration
- ⬜ Deck system architecture
- ⬜ Achievement/unlock system
- ⬜ Sparkline history gauges
- ⬜ Animation polish
- ⬜ New decks (Pandemic, Volcker, Financial Crisis, Trade War)

**Phase 2: APP STORE**
- ⬜ Capacitor wrapper
- ⬜ Local persistence (deck unlocks, records)
- ⬜ Backend (Supabase — profiles, leaderboards, daily challenges)
- ⬜ App Store assets (screenshots, description, preview video)

---

## The working rules — not optional

1. **Edit surgically; never rewrite from scratch.** Targeted edits to `index.html`.
2. **Economics first, always.** "Is this how it actually works?" Reject shortcuts that violate the transmission chain.
3. **Verify before claiming done.** Syntax-check, grep, trace. State what you couldn't verify.
4. **Distrust enthusiasm.** My excitement ≠ validation.
5. **Push back on scope.** Untested changes or premature infrastructure get flagged.
6. **Tuning is hypothesis.** State expected behavior and what falsifies it.
7. **Protect the identity.** Accounting reconciles. Retention = mastery. No partisan politics. Dopamine from real tradeoffs.
