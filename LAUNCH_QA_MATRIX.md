# Demo Chatbot Launch QA Matrix

This matrix is the release gate for the productionized demo chatbot experience.

## Platforms

| Area | Requirement | Status |
|---|---|---|
| Desktop browsers | Latest Chrome, Edge, Safari, Firefox | Pending |
| Mobile browsers | iOS Safari, Chrome Android | Pending |
| Keyboard only | Full conversation lifecycle without mouse | Pending |
| Screen readers | NVDA + Firefox, VoiceOver + Safari | Pending |

## Core scenarios

| Scenario | Desktop | Mobile | Keyboard-only | Screen reader |
|---|---|---|---|---|
| Open launcher and start conversation | ☐ | ☐ | ☐ | ☐ |
| Send message + receive answer | ☐ | ☐ | ☐ | ☐ |
| Retry after failure state | ☐ | ☐ | ☐ | ☐ |
| History search, export, delete | ☐ | ☐ | ☐ | ☐ |
| Escalation links (311/911/contact) | ☐ | ☐ | ☐ | ☐ |
| Resize modes (dock/panel/fullscreen) | ☐ | ☐ | ☐ | ☐ |

## Accessibility checks

- [ ] Focus order remains logical across launcher, shell controls, menus, and composer.
- [ ] Live-region announcements are spoken for send, receive, error, and retry events.
- [ ] Contrast passes WCAG AA for dark and light modes.
- [ ] Icon buttons maintain at least 44x44 touch target across breakpoints.
- [ ] Reduced-motion preference disables non-essential animation.

## Telemetry gate checks

- [ ] `ui_metric: widget_open` events emitted from launcher entry paths.
- [ ] `ui_metric: send_success` emitted on successful assistant responses.
- [ ] `ui_metric: send_error` emitted for offline/timeout/unavailable failures.
- [ ] `ui_metric: escalation_click` emitted for safety-strip and fallback escalations.
