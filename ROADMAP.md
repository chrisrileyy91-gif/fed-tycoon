# CHAIR — Development Directive Map

This is the sequential build plan. Each phase depends on the prior phase being complete and validated. Do not skip ahead — the dependency chain is structural, not arbitrary.

---

## PHASE 1A: Engine Completion — Equity/Asset Market
**Status:** ⬜ Not started
**Dependency:** Phase 0 cleared ✅
**Why this comes first:** Every deck uses the same engine. Adding the equity channel AFTER building decks means retrofitting equity reactions into every deck's events. Engine completes before content scales.

### Deliverables
- [ ] Add `S.equities` variable to state (baseline 100, represents index level)
- [ ] Equity pricing equation in macroTick:
  - Reacts to growth expectations (earnings channel)
  - Reacts to rate stance (discount rate channel — hikes push equities down)
  - Reacts to QE/QT (portfolio balance effect — QE lifts asset prices directly)
  - Mean-reverts slowly (markets overshoot and correct)
  - Random noise (markets are volatile)
- [ ] Wealth effect feeds growth equation: `(equities - 100) * coefficient` modifies growth
- [ ] Equity crash threshold: drop >20% from trailing peak triggers financial stress event
- [ ] Equity bubble threshold: sustained >140 triggers "irrational exuberance" pressure event
- [ ] Equity gauge in UI (visible, always updating, delta arrows)
- [ ] At least one crash event card and one bubble event card with response options
- [ ] Stakeholder reactions to equity moves (Banks care about portfolios, People care about 401k)
- [ ] End-of-term report includes final equity level

### Validation
- [ ] Hike aggressively → equities fall → growth drags through wealth effect (amplifies tightening)
- [ ] Cut aggressively → equities rally → growth boosts through wealth effect (amplifies easing)
- [ ] QE visibly lifts equities
- [ ] Sharp equity crash triggers stress event
- [ ] Re-run Phase 0 simulation: divergence still holds (equity channel doesn't break it)
- [ ] All equity effects use economically truthful channels (no invented mechanics)

### Economics audit
- Rate → equity valuation: real (discount rate on future earnings)
- Equity → consumption → growth: real (wealth effect, well-documented)
- QE → asset prices: real (portfolio balance effect)
- Crash → credit tightening: real (2008 mechanism)
- Equity is NOT a Fed target, just a transmission channel and feedback signal

---

## PHASE 1B: Deck Architecture — Content Framework
**Status:** ⬜ Not started
**Dependency:** Phase 1A complete (engine is feature-complete)
**Why this comes second:** Decks need the full engine (including equities) so every deck can use every mechanic. Building decks on an incomplete engine means rebuilding them.

### Deliverables
- [ ] Define deck data structure:
  ```
  {
    id, title, subtitle, difficulty (1-4),
    locked (bool), unlockCondition,
    narrative (intro text),
    state (starting macro conditions),
    shocks (deck-specific crisis events),
    news (deck-specific domestic events),
    // Universal events stay in engine: FOMC, data prints, stakeholder cards, pressure tiers
  }
  ```
- [ ] Refactor existing 3 scenarios into deck objects
- [ ] Deck picker UI replaces random-scenario intro screen
  - [ ] Visual cards with title, difficulty stars, narrative preview
  - [ ] Locked decks visible but grayed, unlock condition shown
  - [ ] Best credibility score displayed on completed decks
- [ ] Engine loads deck-specific events into SHOCKS/NEWS arrays at term start
- [ ] Universal events (stakeholder anger, pressure, FOMC, data prints) remain hardcoded in engine
- [ ] Clean separation verified: adding a deck = adding one data object, zero engine changes

### Validation
- [ ] All 3 existing scenarios play identically to pre-refactor (no regression)
- [ ] Can add a stub deck (empty events, just starting conditions) and it loads without errors
- [ ] Deck picker displays correctly on mobile viewport
- [ ] Unlock state persists (localStorage for now — placeholder, will be formalized in Phase 2)

---

## PHASE 1C: Content — Core Decks
**Status:** ⬜ Not started
**Dependency:** Phase 1B complete (deck architecture in place)
**Why this comes third:** Each deck is a data object dropped into the architecture. No engine changes. Content is parallelizable once the framework exists.

### Deck build order (by educational value × distinctiveness)

#### Deck 4: Pandemic
- [ ] Starting conditions: rates at 1.5%, growth 2.2%, un 3.9%, inf 1.8% — calm before the storm
- [ ] 8-12 themed events: lockdown announcement, stimulus bill, vaccine timeline, reopening surge, supply chain crisis, labor shortage, "transitory" debate, fiscal cliff
- [ ] 2-3 crises: pandemic declaration (alert event), stimulus-fueled overheating, supply chain collapse
- [ ] Narrative arc: emergency → rescue → "did we overdo it?" → fighting what you created
- [ ] Difficulty: ★★★

#### Deck 5: The Volcker Test
- [ ] Starting conditions: inf 8%, expectations 6%+, un 6%, rate 8%, growth 0.5% — deep stagflation
- [ ] 8-12 themed events: oil embargo, union wage demands, "whip inflation now" pressure, bond market revolt, congressional threats to abolish Fed, public rage at rates
- [ ] Crises: second oil shock, expectations spiral acceleration
- [ ] Key mechanic: only beatable by hiking to 12-15%+ and holding through a recession. Tests the expectations system.
- [ ] Difficulty: ★★★★

#### Deck 6: Financial Crisis
- [ ] Starting conditions: rates 5.25%, inf 2.8%, un 4.5%, equities 140+ (bubble), stress rising
- [ ] 8-12 themed events: housing data collapse, bank failure, money market freeze, TARP debate, auto bailout, foreclosure wave
- [ ] Crises: Lehman-style bank collapse (alert event), money market breaking the buck
- [ ] Key mechanic: rates go to zero, QE is the only tool. Tests the zero lower bound.
- [ ] Difficulty: ★★★

#### Deck 7: Trade War
- [ ] Starting conditions: inf 2.2%, un 3.9%, growth 2.4%, rate 2.5% — deceptively calm
- [ ] 8-12 themed events: tariff announcement, retaliation, supply chain rerouting, farmer bailout, currency manipulation accusation, trade deal speculation
- [ ] Crises: tariff escalation (supplyShock), allied trade bloc retaliation
- [ ] Key mechanic: supply shocks you can't fix with rates — must manage second-round effects
- [ ] Difficulty: ★★☆

### Validation per deck
- [ ] Phase 0 simulation for each deck: deliberate play beats spam by 30+ credibility
- [ ] The Volcker Test is NOT solvable by passive play (expectations spiral makes inaction fatal)
- [ ] Financial Crisis is NOT solvable without QE (rates hit zero, conventional tools exhausted)
- [ ] Each deck feels distinct — different starting tension, different decision pressure

---

## PHASE 2A: Persistence and Progression
**Status:** ⬜ Not started
**Dependency:** Phase 1C complete (we know what to persist)
**Why this comes fourth:** The schema depends on knowing the full content structure — decks, achievements, records.

### Deliverables
- [ ] localStorage wrapper with migration-ready schema:
  ```
  {
    version: 1,
    decks: { [deckId]: { unlocked, bestCred, bestStreak, completions } },
    achievements: { [achievementId]: { earned, date } },
    stats: { totalTerms, totalMonths, bestOverallCred }
  }
  ```
- [ ] Deck unlock logic: complete any term → unlock next deck. Master tier → unlock bonus decks.
- [ ] Achievement system (15-20 badges):
  - [ ] Per-deck: "Survived [deck name]," "Master of [deck name]"
  - [ ] Cross-deck: "5 terms completed," "3 master tiers," "All decks unlocked"
  - [ ] Skill-based: "On-mandate for 24 consecutive months," "Zero financial stress all term," "All stakeholders above 60%," "Broke the Volcker spiral," "Never used QE"
- [ ] Personal records displayed on deck picker cards
- [ ] Achievement display screen (accessible from deck picker)
- [ ] State survives browser close/reopen

### Validation
- [ ] Close browser, reopen → all unlocks, records, achievements persist
- [ ] Complete a term → next deck unlocks immediately
- [ ] Earn achievement → displays correctly
- [ ] Clear localStorage → resets to clean state (for testing)
- [ ] Schema is forward-compatible (adding fields doesn't break existing saves)

---

## PHASE 2B: UI and Animation Polish
**Status:** ⬜ Not started
**Dependency:** Phase 2A complete (UI is stable — no more structural layout changes)
**Why this comes fifth:** Polishing UI that's still being restructured wastes effort. By now the layout, gauges, deck picker, and achievement screen are all in place.

### Priority order (by information value, not decoration)

#### High impact
- [ ] Sparkline history in each gauge (last 12 months of that variable as a mini line chart)
- [ ] Equity ticker — always visible, always animating between ticks
- [ ] Card flip animation on event reveals
- [ ] QE tap improvements: escalating particle density, progressive sound pitch, subtle screen pulse on final tap

#### Medium impact
- [ ] End-of-term cinematic: newspaper front page layout with your final numbers, faction reactions, and a "historical assessment" quote
- [ ] Crisis atmosphere: red vignette overlay intensifies with stress level, tension music responds to crisis state (already partially exists)
- [ ] Transmission chain visualization: animated dotted-line flow showing rate → growth → un → inf when a rate decision is made (educational, shows the pipeline)

#### Lower priority (post-launch candidates)
- [ ] Smooth transitions between events (current: instant swap)
- [ ] Deck picker animations (card fan, selection zoom)
- [ ] Share card visual design (for "Beat my term?" social feature)
- [ ] Achievement unlock celebration animation

### Validation
- [ ] Show game to someone unfamiliar with it. Can they read the sparklines and understand trend direction without explanation?
- [ ] QE tapping feels satisfying on a phone — haptic feedback ready for Capacitor
- [ ] End-of-term screen makes the player want to screenshot and share
- [ ] No animation blocks or delays user interaction (all visual, never modal)

---

## PHASE 3A: Capacitor Wrapper — App Store Build
**Status:** ⬜ Not started
**Dependency:** Phase 2B complete (UI is polished and stable)
**Why this comes sixth:** Wrapping a product still being overhauled visually means re-testing the wrapper repeatedly. Wrap once, wrap right.

### Deliverables
- [ ] Capacitor project initialized, iOS platform added
- [ ] WebView loads index.html with full functionality
- [ ] Status bar and safe area handled correctly (no content under notch)
- [ ] Haptic feedback on QE taps (Capacitor Haptics API)
- [ ] App icon (1024×1024) and splash screen
- [ ] localStorage persists across app updates
- [ ] Audio works in WebView (Web Audio API — test on iOS specifically)
- [ ] Offline capable (no network dependency for core gameplay)
- [ ] Performance profiled on iPhone SE / iPhone 11 (target: 60fps, no audio glitches)

### Validation
- [ ] Install on physical iPhone via TestFlight
- [ ] Play full term — all features work identically to web version
- [ ] Close app, reopen — persistence intact
- [ ] Haptics fire on every QE tap
- [ ] No WebView artifacts (rubber-banding, address bar flash, white flash on load)
- [ ] Audio doesn't cut out when phone locks briefly

---

## PHASE 3B: App Store Submission
**Status:** ⬜ Not started
**Dependency:** Phase 3A validated on physical device

### Deliverables
- [ ] Apple Developer account active
- [ ] App Store Connect listing created:
  - [ ] App name: "CHAIR — The Fed Game" (verify availability)
  - [ ] Category: Games → Strategy (primary), Education (secondary)
  - [ ] Age rating: 4+ (no objectionable content)
  - [ ] Description (emphasize educational value + gameplay)
  - [ ] Keywords (10 keyword slots, max 100 chars total)
  - [ ] Privacy policy URL (can be a GitHub Pages page)
- [ ] Screenshots: minimum 4, for 6.7" (iPhone 15 Pro Max) and 6.5" (iPhone 11 Pro Max)
- [ ] App preview video (optional but high-impact — 30 second gameplay clip)
- [ ] TestFlight beta with 5+ external testers, feedback collected
- [ ] Submit for review

### Apple review risks and mitigations
- **"Minimum functionality" rejection:** Mitigate with 7 decks, achievement system, persistence, haptics, sparklines — clearly not a thin wrapper
- **"Web app" rejection:** Mitigate with native haptics, offline capability, local persistence — things a website can't do
- **Guideline 4.2 (minimum design):** The game has a distinctive visual identity, custom audio engine, and polished interactions — this should be fine

---

## POST-LAUNCH: Live Operations
**Status:** Future
**Dependency:** App Store approval

### Content updates (keep the app alive in rankings)
- [ ] Expansion deck: Wartime Economy
- [ ] Expansion deck: Dollar Crisis
- [ ] Expansion deck: The Soft Landing
- [ ] Expansion deck: Climate Emergency
- [ ] Expansion deck: Crypto Winter
- [ ] Seasonal/topical daily challenges

### Backend (when DAU justifies it)
- [ ] Supabase project: profiles, cross-device sync, leaderboards
- [ ] Daily challenge: shared seed, global leaderboard
- [ ] Social share cards with deep links
- [ ] Push notifications for daily challenges

### Monetization options (decide based on traction)
- Premium paid app ($2.99-$4.99) — simplest, aligns with educational positioning
- Free + IAP deck packs ($0.99-$1.99 per expansion deck) — higher ceiling
- Free + tip jar — lowest friction, relies on goodwill

---

## Quick reference: dependency chain

```
Phase 0 ✅ (divergence proven)
  └→ Phase 1A: Equity market (engine completion)
       └→ Phase 1B: Deck architecture (content framework)
            └→ Phase 1C: Core decks (content build)
                 └→ Phase 2A: Persistence (unlocks, achievements, records)
                      └→ Phase 2B: UI polish (sparklines, animations, ticker)
                           └→ Phase 3A: Capacitor wrapper (native shell)
                                └→ Phase 3B: App Store submission
                                     └→ Post-launch (expansion decks, backend, monetization)
```

Each phase has a clear "done" state. Don't start the next phase until the current one's validation criteria pass. This isn't bureaucracy — it's the lesson from Phase 0: building on unproven foundations costs more than building right.
