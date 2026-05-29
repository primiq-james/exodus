# Exodus Chatbot Frontend

This is the Exodus coding-agent chatbot frontend, copied from the CivIQ demo app and narrowed to a full-screen chat experience plus a focused LLM admin page.

## Local development

```bash
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173` by default. In this workspace we have been running it on `http://localhost:5174/demo` with:

```bash
npm run dev -- --port 5174
```

## Environment

| Variable | Purpose |
|---|---|
| `VITE_CHATBOT_API_BASE` | API Gateway base URL for all chatbot and admin backend calls. Defaults in code to `https://mgq245mb03.execute-api.us-east-1.amazonaws.com`. |
| `VITE_COGNITO_DOMAIN` | Cognito hosted UI domain for normal user login, if enabled. |
| `VITE_COGNITO_CLIENT_ID` | Cognito app client ID for normal user login, if enabled. |
| `VITE_ADMIN_COGNITO_DOMAIN` | Optional admin-specific Cognito hosted UI domain. Falls back to `VITE_COGNITO_DOMAIN`. |
| `VITE_ADMIN_COGNITO_CLIENT_ID` | Optional admin-specific Cognito app client ID. Falls back to `VITE_COGNITO_CLIENT_ID`. |
| `VITE_ADMIN_ALLOWED_EMAILS` | Comma-separated admin email allowlist. |
| `VITE_ADMIN_ALLOWED_SUBS` | Comma-separated Cognito subject allowlist. |
| `VITE_ADMIN_ALLOWED_GROUPS` | Comma-separated Cognito group allowlist. |
| `VITE_CHATBOT_STARTER_PROMPTS_CONFIG` | Optional JSON override for quick-question starter prompts. |

## Frontend routes

| Route | Purpose |
|---|---|
| `/demo` | Full-screen Exodus chatbot. |
| `/admin` | Focused LLM/admin page. |
| `/demo/admin` | Same focused LLM/admin page for demo-path access. |
| `/admin/login` | Cognito admin login flow, if protected admin access is used. |

## Required backend API / Lambda responsibilities

The frontend only knows the API Gateway routes. These can be implemented as one router Lambda or separate Lambdas. If splitting them, the logical Lambda names below are the recommended boundaries.

| Feature | Frontend call | Suggested Lambda responsibility |
|---|---|---|
| Ask coding questions | `POST /chat` with `{ question, url, chatId, language }` | `chat-router` Lambda. Runs the LLM request, applies prompt/tone rules, retrieves codebase/document context, returns `answer`, `citations`, `confidence`, optional `handoff`, and optional source-health warnings. |
| Load chat config | `POST /chat` with `action: "config"` | `chat-config` or shared `chat-router` action. Returns greeting, quick-question config, and proactive nudges such as the work-survey alert. |
| Feedback buttons | `POST /chat` with `action: "feedback"` | `chat-feedback` Lambda. Stores helpful/not-helpful/flag feedback with the answer and previous user message for review. |
| Citation click analytics | `POST /chat` with `action: "citation_click"` | `chat-analytics-events` Lambda. Records citation title/url clicks. |
| UI metrics | `POST /chat` with `action: "ui_metric"` | `chat-analytics-events` Lambda. Records widget open, send success/error, and escalation-click events. |
| Rate-limit logging | `POST /chat` with `action: "rate_limit"` | `chat-analytics-events` Lambda. Records rate-limit events and reason strings. |
| Browser chat history | No backend call in current UI | Currently saved in browser `localStorage`, including guest users. If server-side sync is needed later, add a `chat-history` Lambda with create/list/update/delete routes. |
| Prompt config load/save | `GET /admin/prompt-config`, `PUT /admin/prompt-config` | `admin-prompt-config` Lambda. Reads/writes system prompt, tone rules, concise mode, and optimistic concurrency timestamp. |
| Admin stats | `GET /admin/chat-analytics?days=30` | `admin-chat-analytics` Lambda. Aggregates feedback counts, failure rates, model usage, citation metrics, and related dashboard stats. |
| Guardrail stats | `GET /admin/guardrail-monitor?days=N` | `admin-guardrail-monitor` Lambda. Aggregates escalations, refusals, flagged answers, and trigger reasons. |
| Hallucination queue | `GET /admin/hallucination-queue?...` | `admin-hallucination-queue` Lambda. Lists answer-quality/hallucination review items by status, limit, and time window. |
| Hallucination status update | `POST /admin/hallucination-queue/update` | `admin-hallucination-queue` Lambda. Updates status, severity, notes, and reason metadata. |
| Feedback queue | `GET /admin/feedback-queue?days=30&limit=20` | `admin-feedback-queue` Lambda. Lists recent feedback items for answer-quality review. |

## Additional infra needed

| Infra | Needed for |
|---|---|
| API Gateway HTTP API or REST API | Hosts `/chat` and `/admin/*` routes, handles CORS for the frontend origin. |
| Cognito User Pool + Hosted UI | Optional normal-user auth and recommended admin auth. Admin requests send a Bearer ID token when available. |
| DynamoDB or equivalent event store | Chat events, feedback records, citation clicks, UI metrics, rate-limit events, prompt config, and review queues. |
| OpenSearch, vector DB, or code/document index | Retrieval for codebase-grounded answers and citations. |
| LLM provider access | The chat router needs model credentials/config for answer generation. |
| Secrets Manager / SSM Parameter Store | Stores LLM keys, GitHub tokens if used, integration credentials, and any private config. |
| CloudWatch Logs + metrics/alarms | Lambda logs, API errors, latency, downstream health, and alerting. |
| S3 + CloudFront | Static hosting for the built frontend if deployed outside local dev. |
| IAM roles/policies | Lambda access to DynamoDB, index/search service, logs, Secrets Manager/SSM, and any admin integrations. |

## Notes

- The current frontend is wired to a coding-agent persona, but several inherited filenames and package names still reference CivIQ.
- The admin page is intentionally focused on LLM chatbot controls: prompt config, repo-change breakdown, guardrails, analytics, feedback, and hallucination review.
- Guest and signed-in chat history both work in-browser today. Server-side history requires adding backend routes.
