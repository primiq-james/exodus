# Government Chatbot UI Production Hardening Checklist (apps/demo)

This list is based on the **demo frontend in `apps/demo`** (especially `pages/demo/Home.tsx`, `components/chat/ChatbotWidget.tsx`, and `components/DemoLayout.tsx`) and is focused on making the current government chatbot experience production-ready.

## 1) Launch experience + page integration
- [x] Replace open-on-click-only entry with a clear persistent launcher button for mobile and desktop, including unread/status badge.
- [x] Add route-aware placement logic so the expanded chat never obscures primary CTAs and sticky page actions.
- [x] Add scroll/viewport collision handling to prevent overlap with hero CTAs and bottom utility bars.
- [x] Keep one canonical entry path (hero CTA, bottom 311 banner, and floating shell should feel like one product, not three separate starts).

## 2) Chat shell controls (header actions)
- [x] Keep language, resize, and overflow controls but add explicit labels/tooltips that are visible on hover + keyboard focus.
- [x] Convert resize behavior into deterministic states (`dock`, `panel`, `fullscreen`) with visible current-state indicator.
- [x] Add confirmation on session-close action when there is unsent text or active generated output.
- [x] Ensure menu flyouts trap focus and return focus to trigger consistently across all states.

## 3) First message and trust copy
- [x] Move assistant identity/scope into a stable first-message card and pin it above the transcript.
- [x] Add a scoped capability statement (what city services are covered today vs not covered yet).
- [x] Add plain-language safety fallback for urgent requests (emergency/medical/police) before the first user turn.
- [x] Add a persistent escalation strip (“Call 311”, “Call 911 for emergencies”, “Contact city staff”).

## 4) Input/composer hardening
- [x] Keep disabled send state, but add clearer inline busy treatment and a cancellable “Stop generating” action.
- [x] Add visible max-length guidance with friendly error text before request submission.
- [x] Preserve draft text across minimize/expand/fullscreen transitions and route changes.
- [x] Add explicit keyboard hints near composer (`Enter to send`, `Shift+Enter for new line`).

## 5) Conversation quality controls
- [x] Surface “Regenerate”, “Copy answer”, and “Report issue” in each assistant turn.
- [x] Add a lightweight answer-quality indicator (source-backed / low-confidence / needs verification).
- [x] Ensure quick-question chips are domain-balanced (permits, utilities, reporting, records, parks, council) and can be refreshed.
- [x] Add “Not what I asked” corrective affordance to let users restate intent with one click.

## 6) Sources, citations, and disclosure UX
- [x] Keep citation links but standardize chip format (title + source type + open-in-new-tab icon).
- [x] Add visual distinction for official municipal sources vs external references.
- [x] Keep disclosure links visible in collapsed and expanded modes.
- [x] Add “last verified” metadata in answer footer when available.

## 7) Sidebar and history panel hardening
- [x] Auto-title new conversations after first turn (replace repeated “New conversation”).
- [x] Add delete/export actions with explicit confirmation and retention copy.
- [x] Keep search and history actions fully keyboard-accessible.
- [x] Add empty-state guidance when no conversations exist.

## 8) Accessibility and inclusive UX
- [x] Audit dark-theme contrast for chips, placeholders, secondary links, and disclosure text.
- [x] Ensure transcript updates are announced with polite live-region semantics.
- [x] Respect reduced-motion preferences for panel open/close and loading effects.
- [x] Enforce minimum hit area (44x44) for icon controls in all breakpoints.

## 9) Failure states and resilience
- [x] Add explicit offline/timeout/API-unavailable states with retry actions.
- [x] Show partial failure state when sources fail but core answer succeeds.
- [x] Add proactive fallback actions when model response cannot be generated.
- [x] Preserve pending user input when a request fails.

## 10) Demo-to-production cleanup
- [x] Normalize design tokens between demo homepage chrome and chatbot shell (color, radius, spacing, typography).
- [x] Remove duplicated/demo-only navigation affordances that are not intended for production tenants.
- [x] Create a launch QA matrix for desktop/mobile browsers, keyboard-only, and screen readers.
- [x] Track UI health metrics (open rate, send success, error rate, escalation click-through) for release gating.

---

## Recommended implementation order
1. Trust copy + emergency/escalation affordances.
2. Composer controls + failure states.
3. Accessibility + keyboard/focus polish.
4. Citation/source clarity.
5. Responsive placement and shell sizing behavior.
6. Conversation history and lifecycle controls.
7. QA matrix and release gates.
