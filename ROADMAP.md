# CHAIR — Development Roadmap

Sequential build plan. Each phase depends on the prior being complete and validated.

---

## Phase 0: Prove the Loop Diverges

**Status: ✅ COMPLETE**

- Simulation: +162.8 credibility gap between deliberate play and spam
- 100% spam fail rate
- Gate cleared for Phase 1

---

## Phase 1A: Engine Completion — Equity/Asset Market

**Status: ✅ COMPLETE**

- Three sub-indices (LRG/MID/SML) composited via `eqComposite()`
- Earnings channel (growth), discount-rate channel (rate stance), portfolio-balance channel (QE)
- Wealth effect feeds growth equation: `(composite-100)*0.02`
- Crash threshold (>20% below peak) triggers crisis alert
- Bubble threshold (>140 sustained 6+ months) triggers pressure event
- `bubbleIgnore` amplifies subsequent crash consequences
- Equity ticker UI (always visible, always reacting)
- Stakeholder reactions to equity moves

---

## Phase 1B: Deck Architecture — Content Framework

**Status: ✅ COMPLETE**

- Six-deck progressive unlock system with `DECK_ORDER` array
- Deck picker UI replaces intro screen; `backToPicker()` navigation
- `requires` field gates events for narrative dependency chaining
- `chair_save_v1` localStorage persistence for unlock state and best scores
- `recordBest()` and `unlockNext()` handle progression
- Engine loads deck-specific events into `ACTIVE_SHOCKS`/`ACTIVE_NEWS` at term start
- Universal events (FOMC, data prints, stakeholder anger, pressure tiers, equity events, praise cards) remain hardcoded in engine

---

## Phase 1C: Content — Core Decks

**Status: ✅ COMPLETE**

- AI Disruption (★★☆): 3 shocks, 11 news. Content-audited.
- The Housing Trap (★★☆): 3 shocks, 11 news. Content-audited.
- Tariff Shock (★★★): 3 shocks, 11 news. Content-audited.
- Geopolitical Fracture (★★★): 3 shocks, 11 news. Content-audited.
- The Debt Reckoning (★★★★): 3 shocks, 11 news. Content-audited.
- Fiscal Dominance (★★★★): 3 shocks, 11 news. Content-audited.
- Positive feedback system: 5 praise cards, streak visibility, warm data prints.
- Total: 18 shocks, 66 news events across all decks.

---

## Phase 2: Audit + App Store Preparation

**Status: 🔶 CURRENT**

Dependency: Phase 1C complete ✅

### 2A: Full Audit Pass

- [ ] Per-deck verification: starting conditions, dominant strategies, effect channels, narrative coherence, foreshadow integrity
- [ ] Positive feedback system verification: praise card conditions, firing order, `praiseFired` tracking, streak display, warm data print routing
- [ ] Regression check: all prior audit fixes still in place
- [ ] No double-counting (supplyShock + infPush never on same event)

### 2B: Capacitor Wrapper

- [ ] Capacitor project initialized, iOS platform added
- [ ] WebView loads index.html with full functionality
- [ ] Status bar and safe area handling (no content under notch)
- [ ] Haptic feedback on QE taps (Capacitor Haptics API)
- [ ] App icon (1024×1024) and splash screen
- [ ] localStorage persists across app updates
- [ ] Audio works in WebView (Web Audio API — critical to test on iOS)
- [ ] Offline capable (no network dependency)
- [ ] Performance profile on iPhone SE / iPhone 11 (target: 60fps, no audio glitches)

### 2C: App Store Submission

- [ ] Apple Developer account active
- [ ] App name: "CHAIR — The Fed Game"
- [ ] Category: Games → Strategy (primary), Education (secondary)
- [ ] Age rating: 4+
- [ ] Screenshots for 6.7" and 6.5" devices
- [ ] Privacy policy URL (GitHub Pages)
- [ ] TestFlight beta with external testers
- [ ] Submit for review

### Apple review risk mitigations

- "Minimum functionality" — 6 decks, praise system, persistence, haptics
- "Web app" rejection — native haptics, offline capability, local persistence
- Guideline 4.2 — distinctive visual identity, custom audio engine, polished interactions

---

## Post-Launch

**Status: Future**

Dependency: App Store approval

### Content updates

- [ ] Expansion decks: Wartime Economy, Dollar Crisis, The Soft Landing, Climate Emergency, Crypto Winter
- [ ] Seasonal/topical daily challenges

### Backend (when DAU justifies it)

- [ ] Supabase: profiles, cross-device sync, leaderboards
- [ ] Daily challenge: shared seed, global leaderboard
- [ ] Social share cards with deep links

### Monetization (decide based on traction)

- Premium paid app ($2.99-$4.99)
- Free + IAP deck packs ($0.99-$1.99 per expansion)
- Free + tip jar

---

## Dependency chain

Phase 0 ✅ → Phase 1A ✅ → Phase 1B ✅ → Phase 1C ✅ → Phase 2 🔶 → Post-Launch
