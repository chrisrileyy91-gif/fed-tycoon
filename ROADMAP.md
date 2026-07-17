# CHAIR — Development Roadmap

---

## Completed phases

**Phase 0 — Divergence simulation** ✅
Proved the credibility loop diverges: +162.8 credibility gap between deliberate play and spam, 100% spam fail rate.

**Phase 1A — Equity market** ✅
Three sub-indices (LRG/MID/SML) via `eqComposite()`, wealth effect feeding growth, crash/bubble events, equity ticker UI.

**Phase 1B — Deck architecture** ✅
Six-deck progressive unlock system (`DECK_ORDER`), deck picker UI, `chair_save_v1` localStorage persistence, `requires` dependency gating.

**Phase 1C — Core deck content** ✅
All six decks built and content-audited: AI Disruption, The Housing Trap, Tariff Shock, Geopolitical Fracture, The Debt Reckoning, Fiscal Dominance. 84 original events (18 shocks + 66 news). Positive feedback system (5 praise cards, streak visibility, warm data prints).

**Phase 2A — Positive feedback + full audit** ✅
Full audit pass across all six decks and the positive feedback system. 22 dominant strategies fixed, 168 response headlines added. Zero economics violations, zero double-counting, zero broken `requires` chains.

**Engine upgrades — condition system, CPI fix, spacing** ✅
`checkCondition()` / `COND_VARS` condition-gating system (AND clauses, `{or:[...]}`, `ref` state-vs-state comparisons). CPI/NFP data-print fix (`termMonth%4===0` → CPI, else NFP). Spacing-forcing mechanism (`S.consecutiveUniversals`) guaranteeing deck content after 3 consecutive universal-only months.

**Late-game content — 63 condition-gated cards** ✅
13 added to AI Disruption, 10 each to the other five decks (Housing Trap, Tariff Shock, Geopolitical Fracture, The Debt Reckoning, Fiscal Dominance). 62 of the 63 carry `condition` fields branching the back half of each term on player performance; deck totals now 147 events (18 shocks + 129 news). See CLAUDE.md → "Condition system" for design detail.

---

## Current phase — Phase 2B: App Store Preparation

- [ ] Apple Developer enrollment ($99/year) — start immediately
- [ ] App icon (1024×1024 PNG, no transparency, no rounded corners)
- [ ] Splash screen (2732×2732 PNG, centered content, dark background)
- [ ] Privacy policy page (GitHub Pages, game collects zero data)
- [ ] App Store listing draft (name: CHAIR, subtitle: Master the Federal Reserve, category: Games → Strategy + Education)
- [ ] Keywords (100 chars max): federal reserve, economics, strategy, simulation, fed, interest rates, monetary policy, inflation, education, finance game

### Capacitor code prep (all on Windows)

- [ ] Persistence abstraction (Capacitor Preferences with localStorage fallback)
- [ ] Safe area CSS (`env(safe-area-inset-*)`, `viewport-fit=cover`)
- [ ] Haptic feedback on QE taps (Capacitor Haptics behind `window.Capacitor` guard)
- [ ] WebView hygiene (`overscroll-behavior:none`, `-webkit-user-select:none`, `-webkit-touch-callout:none`)
- [ ] AudioContext guard (verify Audio8 creates context on user gesture, not parse time)
- [ ] Capacitor project init (npm, `@capacitor/core`, cli, ios, preferences, haptics)

### Mac session

- [ ] `npx cap sync ios`, `npx cap open ios`
- [ ] Configure signing with Apple Developer account
- [ ] Build to simulator — verify audio, haptics, persistence
- [ ] Build to physical device via TestFlight
- [ ] Take App Store screenshots (deck picker, crisis card, end-of-term, QE tapping)
- [ ] Archive and upload to App Store Connect
- [ ] Submit for review

---

## Future phases

**Post-launch:** expansion decks (Wartime Economy, Dollar Crisis, The Soft Landing, Climate Emergency, Crypto Winter), seasonal/daily challenges, Supabase backend (profiles, cross-device sync, leaderboards) once DAU justifies it, monetization decided from traction (premium paid app, IAP deck packs, or tip jar).

---

## Key risks

- **Web Audio on iOS WebView** — Audio8 must create its `AudioContext` on a user gesture, not at parse time, or it silently fails in WKWebView.
- **Safe area insets** — no content under the notch/home indicator; needs `env(safe-area-inset-*)` + `viewport-fit=cover` verified on-device, not just in simulator.
- **localStorage persistence in WKWebView** — can be evicted more aggressively than desktop Safari; mitigated by wrapping save/load in a Capacitor Preferences layer with localStorage as fallback.
- **Apple Guideline 4.2 rejection ("minimum functionality" / "web app in a wrapper")** — mitigate with native haptics, offline capability, local persistence, and a visibly distinctive, polished interaction layer (QE tapping, custom audio engine) — not just a browser tab in a shell.
