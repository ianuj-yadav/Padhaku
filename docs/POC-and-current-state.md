# PADHAKU — Proof of Concept and Current State

**Assessment basis:** repository files inspected on 5 November 2026, before implementation work began. This is a static baseline, not a runtime or security test. After the owner authorized implementation, account/session, notes, PDF extraction, and source retrieval were connected; see [Implementation Status](IMPLEMENTATION-STATUS.md) for the current state.

## 1. What the current project is

The workspace contains a Next.js 15 / React 19 / TypeScript frontend with a substantial dark-themed study-hub UI, sample course data, module components, a small Next.js API layer, and a minimal FastAPI service plus PostgreSQL/pgvector schema proposal. The experience is best described as an interactive UI/architecture proof of concept. Some controls demonstrate local interactions, but the major product flows are not yet connected to durable backend services.

## 2. What is present

| Area | Observed implementation | Current evidence boundary |
|---|---|---|
| Frontend | Routes for landing, login/register, dashboard, documents, notebooks, quizzes, planner, meetings, groups, AI, and settings; modular dashboard components | Several route pages are thin wrappers; dashboard and modules use seeded data and local React state. |
| Sample study content | `lib/study-store.ts` seeds user/profile, notebooks, notes, documents/chunks, quiz/flashcards, meetings, tasks | Demonstration data is not a persisted account database. |
| AI UI/API | Next.js `/api/ai` route includes token overlap retrieval over static chunks, a hardcoded semantic-cache example, an NVIDIA call, and canned fallback answers | Does not implement pgvector retrieval or connect to the FastAPI route; custom chunks are client-provided and trusted. Cache is process memory and fallback may present canned content as if grounded. |
| FastAPI | `/health`, `/api/ai/ask`, and `/ws/chat/{room_id}` | AI uses a sample passage; no DB, auth, document, or embedding service is wired. WebSocket is in-memory broadcast and not persisted. |
| SQL proposal | `backend/schema.sql` outlines users, notes, documents, chunks/vector, cache, groups, messages, conversations, quizzes, flashcards, sessions, tasks | No observed migration/ORM integration or runtime database connection. Schema is aspirational, not proof these tables power the UI. |
| E2EE demonstration | `lib/crypto-e2ee.ts` uses browser Web Crypto AES-GCM, local MiniSearch, and IndexedDB storage helpers | `ensureRoomKey` generates two keypairs in one browser and derives a local key; it does not exchange real member keys or establish a shared room key. Keys are held in memory. It is not production E2EE. |
| Chat UI | `CmatE2eeChatModule.tsx` presents groups, ciphertext inspection, search, message selection, and AI mention actions | UI behavior is not evidence of an authenticated, durable, multi-client group chat service. AI endpoint also accepts client-provided chat context. |
| Study rooms | Live room UI includes session cards, local Pomodoro/whiteboard controls, camera/mic/screen buttons | No observed RTCPeerConnection, WebRTC signaling, or actual media stream setup in the cited module; buttons do not establish live calls. Sample links are static. |
| Auth | Next.js `/api/auth` handles OTP/login/register actions | OTP has deterministic demo behavior and accepts any six-character OTP; login fabricates a token and user rather than verifying/storing credentials. It returns the OTP and a password-hash preview. Client stores token/profile in localStorage. Not real authentication. |
| Persistence | localStorage used for demo user; other modules rely heavily on initial constants/local state | No end-to-end PostgreSQL persistence is evidenced. Data may reset on reload/navigation or be shared as static defaults. |
| Deployment/repo | `package.json`, Python requirements, Docker Compose and schema are present | Workspace root did not show `.git`; Git commands report this is not a Git repository. No remote was available to verify the provided GitHub destination. Compose references a backend build context, but no `backend/Dockerfile` appeared in the listed files. |

## 3. POC flows that can be presented honestly

- Product vision and navigation across a study dashboard, notebooks, AI analysis, quizzes, groups, and study rooms.
- Local notebook interactions and seeded examples.
- An AI/RAG concept demonstration using sample study chunks and either a provider call or canned fallbacks.
- Browser-side cryptographic primitives and local message-search concepts, with the explicit warning that key exchange and multi-party E2EE are not complete.
- PostgreSQL data model proposal for future integration.

These should be described as prototype/demo behaviors. Do not present them as production account authentication, persistent multi-user services, real PDF RAG, active video calling, deployed infrastructure, or validated E2EE.

## 4. What it is intended to do

The intended product is specified in [PRD.md](PRD.md): a private student workspace that ingests a student's own study materials and supports grounded Q&A, citations, summaries, quizzes, and eventually collaborative study. The architecture should share durable user identity and data while keeping access checks on the server. The recommended end-to-end initial journey and acceptance criteria are in [SRS.md](SRS.md).

## 5. Critical gaps and faulty claims

1. **Credentials:** a provider key is hard-coded as a default in the LLM service and compose config, and another fallback exists in the Next.js AI route. Treat the credential as exposed and rotate it. No credential value is repeated in this document.
2. **Authentication:** OTP and login are bypassable/demo-only; token structure is not cryptographically validated; no persistent user records or server-enforced identity exist.
3. **Authorization:** APIs have no authenticated principal or user ownership checks. Client-selected IDs/context are not safe authorization inputs.
4. **AI privacy and correctness:** static retrieval plus untrusted client-supplied chunks/context can lead to fabricated citations or cross-scope answers. The generic fallback can return canned content even when it does not match the query.
5. **No actual ingestion/RAG:** no observed upload route, text extraction pipeline, embedding generation, vector query, or document processing status integration.
6. **E2EE overclaim:** locally generated “Alice” and “Bob” keys are both created on the same client; no participant key registration/agreement, identity verification, rotation, or group protocol is implemented.
7. **WebSocket safety:** no auth/membership checks, unrestricted room join, no origin/size/rate validation, no persistence, and disconnect removal can fail if connection state is inconsistent. Multiple server workers would not share this in-memory map.
8. **Deployment blockers:** Docker Compose points at a build but no Dockerfile was observed; secrets are committed into defaults; no `.env.example`, migrations, deployment docs, or repository metadata were found at workspace root.
9. **Tests and verification:** no test suite was identified in the listed tree. This review did not run builds/tests; no verification result should be inferred.

## 6. Architecture interpretation

The refined architecture (single PostgreSQL with JSONB and pgvector, external model API, private file storage, browser cryptography, optional WebRTC) is a plausible target, but the repo does not implement it end to end. The existence of a SQL schema and a FastAPI description string does not mean services are connected. The one-database design is reasonable if vector extension availability, backup/restore, embedding dimension, index behavior, and query isolation are validated on the chosen host.

Semantic caching is an optimization, not a first-release requirement. Correct cache scope must include authenticated user, selected document set/version, prompt/model configuration, and relevant permissions; document changes/deletion must invalidate entries. Client-provided `scopeHash` is not a security boundary.

## 7. Local state of source control

At the original inspection, the workspace had no Git metadata. The user-provided GitHub repository was subsequently inspected; it contained only its starter README. The project was connected to that repository, and a new project README was pushed as a separate first commit. Application implementation is being prepared as a follow-up change. No provider credential value is present in the current source tree; any previously exposed provider key should still be rotated before real use.
