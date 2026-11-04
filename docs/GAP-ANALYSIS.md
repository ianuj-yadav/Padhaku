# PADHAKU — Gap Analysis and Delivery Plan

**Purpose:** make the current prototype's distance from a functional presentation/deployment clear. This document is a recommendation for review; it does not authorize implementation before the owner says “nyx.”

## 1. Readiness snapshot

| Capability | Current state | Needed for a trustworthy release |
|---|---|---|
| Product UI | Broad, visually developed prototype | Connect key screens to real flows; add empty/loading/error states. |
| Authentication | Demo OTP and fabricated login/session | Persistent accounts, password verification, secure sessions, logout, server-side identity. |
| Data layer | SQL schema proposal plus seeded client data | Database connection, migrations, repositories, ownership constraints, backups. |
| Notes | Mostly local state | CRUD API, owner checks, reliable reload behavior. |
| PDF/RAG | Static chunks and heuristic retrieval; no observed upload pipeline | Private upload, extraction, chunking, embeddings, authorized vector retrieval, real citations, abstention. |
| AI | Provider call with hardcoded fallback credential and canned fallback | Managed secrets, bounded calls, safe errors, provider selection, prompt/data safeguards, cost/rate limits. |
| Quiz | Seeded questions/local interaction | Generate from selected source, persist attempt/score, validate model output. |
| Chat/E2EE | Local cryptography and demo relay/UI | Real participant identity/key distribution, auth/member enforcement, durable encrypted transport, lifecycle review—or defer E2EE claim. |
| Video | Room UI and controls | Actual WebRTC/SFU or external meeting integration; signaling, permissions, network handling. |
| Deployment | Partial package/compose files | Buildable services, production env/secrets, migrations, health/readiness, CORS/HTTPS, deployed smoke walkthrough. |
| Source control | Workspace not detected as Git repo | Verify repository, review diffs/secrets, connect intended remote, then commit/push. |

## 2. Priority plan

### P0 — Before public push/deployment

- Revoke/rotate the exposed AI provider credential; remove all hard-coded defaults and inspect source history before publication.
- Remove demo auth shortcuts, deterministic/bypassable OTP behavior, fake session tokens, and password-derived response fields.
- Establish the actual backend/frontend contract, database connection, migrations, and trusted server-side user identity.
- Implement and persist the core learning journey: account → notebook/note → document upload/process → cited question → quiz attempt.
- Add resource ownership checks to every operation; constrain retrieval by the authenticated user's accessible documents.
- Replace fake fallback answers with explicit unavailable/low-evidence behavior.
- Make deployment reproducible and verify a fresh deployment without sample state masquerading as user data.
- Add project setup, environment variable template without secrets, API contract, limitations, and demo script.

### P1 — After core flow is stable

- Persist planner, flashcards, favorites, and search.
- Add robust upload storage lifecycle, retention/deletion, document replacement/versioning, background processing where needed.
- Add rate limits, audit-safe logs, monitoring, backup/restore practice, accessibility pass, and security review.
- Decide and implement chat's actual security model; authenticate WebSocket and enforce membership.

### P2 — Separate milestones

- Production-grade group E2EE with reviewed protocol and threat model.
- WebRTC media or SFU integration, signaling hardening, larger rooms, reconnect behavior.
- OCR, calendar integration, semantic caching, model routing, and expanded collaboration.

## 3. One-day presentation strategy

Because the user wants a presentation tomorrow, the practical target is a narrow functional demo, not every aspirational module. First inspect how much can be safely completed after authorization; prioritize a single real path and label unfinished items accurately. If infrastructure credentials or an accessible database are unavailable, present a local prototype with a transparent boundary rather than claiming production deployment. Do not expose a provider key to make the demo appear live.

Suggested demo narrative:

1. Explain the problem and product promise (student materials → grounded revision).
2. Show account/workspace and create a note or choose a real uploaded sample PDF.
3. Ask one question that has a verifiable page citation.
4. Generate and complete a small quiz, then show saved result.
5. Briefly show collaboration/security concepts as prototype/future milestones, with explicit limits.
6. Close with deployment architecture and remaining work.

## 4. Deployment outline (to validate during implementation)

- **Frontend:** Next.js on Vercel or another Node-compatible host. Configure only public API base URL in client-exposed variables; never prefix provider secrets with `NEXT_PUBLIC_`.
- **Backend:** FastAPI on Render or another Python ASGI-compatible service. Provide a production start command, health/readiness endpoints, allowed frontend origin, and secret environment variables.
- **Database:** managed PostgreSQL with pgvector only if the provider supports the extension and chosen embedding dimension/index. Apply versioned migrations rather than relying on one-time init SQL.
- **Files:** private object storage with access controlled by backend-issued authorization, size/type limits, and retention/deletion policy.
- **Networking:** HTTPS only, restrictive CORS, bounded upload/request bodies, request timeouts, and no unauthenticated WebSocket relay.
- **Operations:** check actual host pricing/limits and regional availability before choosing. Confirm build/start commands, secrets, extension availability, persistent storage, and logs on the target plans.

## 5. Environment/configuration inventory to establish

The implementation should define and document exact variables after choosing providers. Expected categories include database URL, session/signing secret, allowed frontend origin(s), AI provider API key/base URL/model, object storage credentials/bucket, email provider key/from address, and optional ICE/SFU credentials. Provide `.env.example` containing names and safe placeholders only. Startup should fail clearly for required missing production settings, while local development should have an explicit documented mode.

## 6. Definition of “end to end”

The first end-to-end acceptance path is complete only when a new account's own inputs travel through frontend, authenticated backend, persistent database/file storage, document processing and retrieval, AI generation, and back to the correct client with verifiable citations—and remain available on a later login. A screen interaction, endpoint stub, table definition, mocked response, or service health string alone does not meet this definition.

## 7. Review checkpoints

Before implementation begins, the owner should review the PRD scope, SRS acceptance requirements, current-state findings, the intended meaning of CMAT, and whether E2EE is an immediate demo requirement or a later milestone. Work remains paused until the owner says **“nyx.”**
