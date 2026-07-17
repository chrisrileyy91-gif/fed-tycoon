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

## Architecture

Single `index.html` with all CSS and JS inline. GitHub Pages deployment. Client-side web app, no backend. localStorage persists unlock state (`chair_save_v1`).

## Six-deck progressive unlock system

Decks unlock sequentially by scoring 110+ credibility ("reappointment"). First deck unlocked by default. Deck picker UI with `backToPicker()` navigation.

| # | Deck | Difficulty | Starting Rate | Key Lesson |
|---|------|-----------|---------------|------------|
| 1 | AI Disruption | ★★☆ | 2.25 (accommodative) | Hold steady under pressure to act |
| 2 | The Housing Trap | ★★☆ | 4.75 (very restrictive) | Ease gradually; your tool makes housing worse |
| 3 | Tariff Shock | ★★★ | 2.75 (neutral) | Don't tighten into a supply shock |
| 4 | Geopolitical Fracture | ★★★ | 3.25 (mildly restrictive) | Multiple shocks hit different channels simultaneously |
| 5 | The Debt Reckoning | ★★★★ | 4.50 (very restrictive) | Rate hikes widen the deficit — your tool fights itself |
| 6 | Fiscal Dominance | ★★★★ | 5.25 (extremely restrictive) | Fiscal offset overwhelms monetary transmission |

AI Disruption has 3 shocks and 24 news events (27 total, including 13 condition-gated late-game cards). The other five decks each have 3 shocks and 21 news events (24 total each, including 9-10 condition-gated late-game cards apiece — Tariff Shock's `tariff-normalization-debate` is deliberately unconditional). Across all six decks: 18 shocks + 129 news = **147 deck events total**, 62 of them condition-gated. Events use a `requires` field for dependency chaining within a four-act narrative structure. Each deck ends with a foreshadow card seeding the next deck's theme.

Foreshadow chain: AI Disruption → Housing Trap → Tariff Shock → Geopolitical Fracture → Debt Reckoning → Fiscal Dominance (no foreshadow, endgame).

---

## The macro engine (macroTick)

Real transmission chain, computed in causal order each tick:

**Expectations → Equities → Growth → Unemployment → Inflation**

### 1. Inflation expectations (self-fulfilling)
```
anchorW = clamp((cred - 15) / 135, 0.15, 1.0)
exp += (2 * anchorW + inf * (1 - anchorW) - exp) * 0.04
```
High credibility → anchored at 2%. Low credibility → drift toward actual inflation (1970s spiral). Floor of 0.15 = institutional inertia. Convergence 4%/month.

### 2. Rate transmission (lagged)
`transmitted += (stance - transmitted) * 0.10` where stance = rate - neutral (2.75).

Note: `transmitted` resets to 0 at term start regardless of starting rate stance. The engine re-ramps the growth drag from scratch over 12-24 months.

### 3. Equity indices (three sub-indices)

Three sub-indices composited via `eqComposite()`: `S.lrg * 0.6 + S.mid * 0.25 + S.sml * 0.15`.

- **LRG:** most QE-sensitive (portfolio balance flows into liquid large caps first). Target: `100 + (gr-2.5)*10 - transmitted*6 + qeBoost*1.5`
- **MID:** balanced sensitivity. Target: `100 + (gr-2.5)*14 - transmitted*10 + qeBoost*1.0`
- **SML:** most rate-sensitive (small caps borrow at floating rates). Target: `100 + (gr-2.5)*20 - transmitted*18 + qeBoost*0.5`

All converge at 12%/month with ±1.5 random noise. Wealth effect feeds growth via `(composite-100)*0.02`.

Crash/bubble system: crash fires when composite drops >20% below `equityPeak`. Bubble fires when composite >140 for 6+ consecutive months. `bubbleIgnore` amplifies subsequent crash consequences.

**NOT a trading minigame.** Player watches markets react to policy. Teaches that the stock market is a transmission channel, not a target.

### 4. Growth
`gr += (2.5 - transmitted*0.8 - supplyShock*0.6 + growthPush + (composite-100)*0.02 - gr) * 0.07`

### 5. Okun's Law (growth → unemployment)
`un += (4 + (2.5-gr)*0.8 + supplyShock*0.5 + unempPush - un) * 0.05`

### 6. Phillips Curve, non-linear (unemployment → inflation)
- Below NAIRU (un < 4): `phillips = pow(gap, 1.5) * 0.45` — accelerating
- Above NAIRU: `phillips = gap * 0.15` — flat
- `inf += (exp + phillips - transmitted*0.15 + supplyShock*1.2 + infPush - inf) * 0.06`

### Decay rates
- `supplyShock *= 0.92` (8%/month — slow, persistent cost-push)
- `infPush *= 0.8` (20%/month)
- `unempPush *= 0.8` (20%/month)
- `growthPush *= 0.8` (20%/month)
- `qeBoost *= 0.85` (15%/month)

**All coefficients are hypotheses.** Causal directions are economics; magnitudes are game design.

---

## Effect channel rules — non-negotiable

These rules have been enforced across all six decks:

- **supplyShock** — genuine supply disruptions (oil, tariffs, chip shortages, dollar depreciation). Produces stagflationary signature: growth down, unemployment up, inflation up. NEVER stack `infPush` on top of `supplyShock` on the same event.
- **infPush** — observed realized prices only (CPI prints, rent data, wholesale prices already in the pipeline).
- **growthPush** — demand-side effects (fiscal spending, investment changes, confidence shifts, fiscal offset from interest payments).
- **unempPush** — direct labor market shocks.
- **stress** — financial system / bank liquidity strain only. NOT for political or humanitarian events.
- **debt** — fiscal spending additions.
- **Political events** — approval + credibility only, never macro variables.

---

## QE/QT mechanics

**QE (`opQETap`):** All effects proportional to dollar amount, normalized to a $25B baseline. Per tap: `growthPush += 0.03 * (qePerTap/25)`, `reserves += qePerTap`, `stress -= 2 * (qePerTap/25)`, `qeBoost += qePerTap * 0.04`. Growth channel, NOT direct inflation.

- Toolbar QE: 50 taps, $4B/tap ($200B total). `S.qePerTap = 4`.
- Crisis QE: 100 taps, $5B/tap ($500B total). `S.qePerTap = 5`.

**QT:** `reserves -= min(200, reserves)`, `stress += 8`, `growthPush -= 0.06`, `qeBoost -= drained * 0.04`.

**QE cost scales with rate:** `min(5, floor((rate-1)*1.5))` credibility when rate > 1%. Free at zero bound (ZLB teaching).

**Inter-meeting penalty (both QE and QT):** additional 6 credibility cost.

## FOMC decisions

Hike +25bp, Hike +50bp, Hold, Cut -25bp, Cut -50bp. fx = `{rate: X}` only. No bypass pushes.

## Scoring

Base drain -1.5/month. On-mandate: inf ±0.5 of 2%, un ±0.8 of 4%. Streak bonus up to +2.2/month (`min(2.2, 0.5 + streak * 0.18)`). Angry factions (<25 approval): -0.8 each. Term ends at month >48. Cred ≤ 0 = removed. Cred ≥ 110 at term end = reappointed (unlocks next deck).

Four ending tiers: fail (<110), steady (110-125), good (125-150), master (150-200). Three random narratives per tier.

## Condition system (late-game branching)

Events can carry a `condition` field — an array of clauses evaluated by `checkCondition()`, checked *in addition to* `requires`/turn-window/`fired` gating. Each clause is `{var, op, val}`, or `{var, op, ref}` to compare two live state variables against each other instead of a fixed number. Clauses resolve through the `COND_VARS` accessor map: `inf`, `un`, `rate`, `growth`, `cred`, `equities`, `balance`, `people`, `congress`, `banks`, `treasury` — never raw `S.*` state directly. Multiple clauses in an array are ANDed; wrap alternatives in `{or:[...]}` for OR logic.

Example: `condition:[{var:'inf',op:'>',val:3.5},{var:'rate',op:'<',ref:'inf'}]` — inflation above 3.5% AND the policy rate below inflation (behind the curve).

`checkCondition()` is consulted everywhere an event is filtered for eligibility: the shock roll and both news-eligibility filters (the probabilistic domestic-news roll and the spacing-forced pick below).

### Condition-gated card design

Late-game cards (turn windows generally within `[26,46]`) use `condition` to branch the back half of every deck on how the player actually played the front half, not on a fixed script. A well-played game (anchored expectations, credibility 90+, inflation near target, low unemployment) unlocks "prosperity dilemma" cards — soft landings, neutral-rate debates, asset-price disconnects, debt-sustainability windows: decisions about how *not* to blow up a good position. A poorly-played game (elevated inflation, high rates, high unemployment, low credibility) unlocks "compounding crisis" cards — hysteresis, deflation scares, bond vigilantes, currency crises, monetization pressure: decisions about how to survive a bad one. This is the core cause-effect branching system: the same 48-month term produces a structurally different second act depending on player performance, with no explicit difficulty setting.

63 new late-game cards were added across the six decks this way (13 AI Disruption + 10 each in the other five); 62 carry a `condition` field. The one exception — Tariff Shock's `tariff-normalization-debate` — is deliberately unconditional, firing on its turn window regardless of economic state, the same way an FOMC meeting does.

## Universal mechanics (fire on all decks)

These are hardcoded in the engine, not in deck-specific arrays:

- FOMC decisions: 8 per year (bimonthly: Jan, Mar, May, Jul, Sep, Nov), 5 options
- Data prints: fallback when no shock/news/universal event claims the month. `makeDataPrint()` fires CPI when `termMonth%4===0`; every other data-print month is NFP. Not a fixed monthly alternation — FOMC, shocks, news, and stakeholder/pressure cards all compete for the same one-event-per-month slot, so realized counts vary by playthrough (observed ~4-7 CPI and ~5-7 NFP prints per 48-month term).
- Spacing mechanism: `S.consecutiveUniversals` counts consecutive months resolved by a universal event (FOMC, data print, stakeholder anger, pressure escalation). Resets to 0 whenever a shock or news event fires. At ≥3, the *next* month bypasses the normal probability roll and forces an eligible deck news event (still respects `requires`/`condition`/turn-window/`fired` gating) — guarantees deck content isn't crowded out by a long universal-only stretch. Equity crash/bubble events and praise cards are neutral: they neither increment nor reset the counter.
- Stakeholder anger cards: Fire when a faction drops below 28 approval, with cooldowns (4-month per faction, 3-month global spacing via `lastStakeholderMonth`)
- Pressure tier escalation: Three tiers. Heat = `(cred<75 ? 1 : 0) + (cred<55 ? 1 : 0) + (congress or people < 32 ? 1 : 0)`. Escalates when heat > current tier.
- Equity crash/bubble events: Crash fires on composite >20% below peak (6-month cooldown). Bubble fires on composite >140 sustained 6+ months (6-month cooldown).
- Praise cards: 5 condition-gated positive events (streak-6, streak-12, cred-130, all-factions-55, exp-anchored). Fire once per term via `S.praiseFired`. Checked in `nextTurn()` after equity events and before shocks.
- Streak visibility: `S.streak` displayed as 🔥N in topbar when ≥ 3
- Warm data prints: Green `.positive` styling when on-mandate (streak ≥ 3) and data confirms

---

## Plumbing (balance sheets)

Fed: Securities (= reserves + TGA) | Reserves owed + TGA owed. Banks: Reserves + Loans | Deposits. Government: Debt + Stress.

Note: `S.debt` is not read by macroTick. The fiscal offset (Debt Reckoning / Fiscal Dominance core mechanic) exists only through deck event effects (growthPush from specific cards), not as a continuous engine variable.

## Audio

Audio8 engine: sine/triangle wave synthesis at lower frequencies with soft attack envelopes. Crisis alarm targets EAS emergency broadcast frequencies. QE tap SFX kept under 150ms. Background music loop at gain 0.45. SFX types: win, bad, register, gavel, alarm.

## Key architecture notes

- `backToPicker` is exposed globally via `window.backToPicker=backToPicker;` (IIFE scope)
- `applyPassive` handles `equitiesDelta` by distributing across sub-indices
- Scripted market crash events must move the equity ticker via `equitiesDelta` in `applyPassive`
- Fallout card uses floating card style (blurred scrim); full-screen takeover reserved for crisis alert cards only
- `requires` gating is a one-line check: `if(ev.requires && !S.fired[ev.requires]) return;`
- `condition` gating is `checkCondition(ev.condition)` — see "Condition system" above for clause format and `COND_VARS`

---

## Project status

**Phase 0: ✅ CLEARED.** +162.8 credibility gap deliberate vs spam. 100% spam fail rate.

**Phase 1A: ✅ COMPLETE.** Equity/asset market integration — three sub-indices, wealth effect, crash/bubble events, ticker UI.

**Phase 1B: ✅ COMPLETE.** Deck architecture — six-deck progressive unlock system, deck picker UI, localStorage persistence (`chair_save_v1`), `requires` dependency gating.

**Phase 1C: ✅ COMPLETE.** All six decks built and content-audited (AI Disruption, Housing Trap, Tariff Shock, Geopolitical Fracture, Debt Reckoning, Fiscal Dominance). 18 shocks, 66 news events total. Positive feedback system (praise cards, streak visibility, warm data prints) added as final content layer.

**Phase 2A: ✅ COMPLETE.** Full audit pass across all six decks + positive feedback system. 22 dominant strategies fixed, 168 response headlines added. Zero economics violations, zero double-counting, zero broken requires chains. All code paths for praise cards, streak visibility, and warm data prints verified correct.

**Engine upgrades: ✅ COMPLETE.** Condition system (`checkCondition`, `COND_VARS`), CPI/NFP data-print fix, spacing-forcing mechanism (`S.consecutiveUniversals`) — see "Condition system" and "Universal mechanics" above.

**Late-game content: ✅ COMPLETE.** 63 new late-game cards added across all six decks (13 AI Disruption, 10 each in the other five); 62 are condition-gated. Deck totals now 147 events (18 shocks + 129 news), up from the original 84 (18 shocks + 66 news).

**Next: Phase 2B (App Store Preparation).** See ROADMAP.md for the checklist.

---

## The working rules — not optional

1. **Edit surgically; never rewrite from scratch.** Targeted edits to `index.html`.
2. **Verify before claiming done.** Syntax-check, grep for function calls, trace data flow.
3. **Economics first, always.** Reject any shortcut that violates the real transmission chain.
4. **Distrust enthusiasm.** Excitement ≠ validation. Test the thing.
5. **Push back on scope.** Flag untested changes, premature infrastructure, and scope creep.
6. **Tuning is hypothesis.** State what would falsify it.
7. **Protect the identity.** Accounting reconciles. Retention = mastery. No partisan politics. Dopamine from real tradeoffs, not fake rewards.
