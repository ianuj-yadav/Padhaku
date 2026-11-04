# PADHAKU — Software Requirements Specification

**Status:** Draft target specification for owner review
**Scope:** First end-to-end demonstrable release, with later modules identified separately.

## 1. Purpose and system context

Padhaku is a web application for private student study workspaces. The target architecture is a Next.js/TypeScript web client, a FastAPI service, PostgreSQL (pgvector only if the selected embedding dimensions and deployment support it), a private file/object store, and an external LLM/embedding provider. The current implementation is not yet equivalent to this target; see [POC and Current State](POC-and-current-state.md).

## 2. Actors

- **Visitor:** views public landing/product information.
- **Student:** owns notebooks, notes, documents, conversations, quizzes, tasks, and profile.
- **Group member:** joins an authorized study group and may exchange messages.
- **Administrator/operator:** configures deployment and investigates service health; has no routine need to inspect private student content.
- **External services:** email/OTP provider, AI/embedding provider, object storage, and optionally video/signaling services.

## 3. Functional requirements

Priority legend: **M** = required for first release; **S** = should follow; **L** = later.

### Identity and access

- **FR-001 (M):** The system shall allow a user to register with validated email and password and persist a unique account.
- **FR-002 (M):** The system shall authenticate users using a supported secure session mechanism and shall not treat client-supplied identity as authorization.
- **FR-003 (M):** The system shall provide logout and session expiration/revocation.
- **FR-004 (M):** Protected routes and API operations shall reject unauthenticated requests.
- **FR-005 (M):** Every user-owned record read/write shall enforce ownership or explicit membership on the server.
- **FR-006 (S):** Email verification, password reset, and refresh-session rotation shall be supported when delivery infrastructure is configured.

### Profile and dashboard

- **FR-010 (M):** The student shall view and update profile/course metadata.
- **FR-011 (M):** The dashboard shall load persisted counts/recent items and clearly display empty, loading, and error states.
- **FR-012 (S):** The student shall search their own notebooks, notes, and documents.

### Notebooks and notes

- **FR-020 (M):** A student shall create, list, read, update, and delete notebooks.
- **FR-021 (M):** A student shall create, list, read, update, and delete notes within an authorized notebook.
- **FR-022 (M):** The system shall preserve ownership consistency between note and notebook.
- **FR-023 (S):** Notes shall support tags, favorites, and search.
- **FR-024 (S):** The student shall export a note in a supported format and receive a clear error if export fails.

### Documents and AI study support

- **FR-030 (M):** A student shall upload supported PDF files subject to size/type limits; the server shall validate content rather than trusting filename or browser MIME type.
- **FR-031 (M):** The system shall store each document with owner, status, content hash/version, and processing error state.
- **FR-032 (M):** The system shall extract text and page attribution from supported PDFs and make processing status visible.
- **FR-033 (M):** The system shall chunk extracted text and associate each chunk with its document, owner, page, and version.
- **FR-034 (M):** The AI query shall retrieve only chunks the signed-in user is authorized to access.
- **FR-035 (M):** The AI response shall include citations that map to actual retrieved document passages/pages. It shall return a low-evidence/abstain response when retrieval is inadequate.
- **FR-036 (M):** The user shall choose the material scope for a question; the system shall not silently use another user's material.
- **FR-037 (M):** AI conversations and messages shall be stored per user and remain available after a new session.
- **FR-038 (M):** The user shall generate a summary or quiz from an explicitly selected document/material scope.
- **FR-039 (M):** Quiz answers and scores shall be persisted and associated with the owning user and source.
- **FR-040 (S):** Embeddings and semantic caching may be used only with explicit user/document/version scoping and cache invalidation when source material changes or is deleted.
- **FR-041 (S):** AI provider errors, timeouts, quota exhaustion, and malformed output shall be handled with safe user-facing errors and no secret leakage.

### Groups, chat, and study sessions

- **FR-050 (L):** A group owner/member shall create, join, leave, and list groups subject to authorization.
- **FR-051 (L):** Real-time chat shall authenticate the WebSocket handshake, authorize room membership, validate payload size/schema, and handle disconnects/reconnects.
- **FR-052 (L):** The privacy model shall be explicit. If E2EE is offered, message plaintext and keys shall remain client-side except when a user deliberately shares selected content with AI.
- **FR-053 (L):** A WebRTC implementation shall include authenticated signaling, room membership validation, ICE configuration, permission handling, and cleanup; a UI toggle alone shall not be represented as an active media connection.
- **FR-054 (L):** Study sessions shall store actual scheduled metadata and join links, not fixed demo URLs.

### Planner, flashcards, support

- **FR-060 (S):** Students shall create/update/complete planner tasks and persist them to their account.
- **FR-061 (S):** Students shall create/review flashcards and persist review status.
- **FR-062 (S):** Platform support answers shall be kept distinct from academic tutor conversations and shall not claim to be generated from a live FAQ unless a maintained knowledge source exists.

## 4. External interface requirements

- **UI:** Responsive web interface with accessible labels, keyboard interaction, understandable validation, empty/loading/success/error states, and clear source citations.
- **HTTP API:** Versioned JSON API, validated request/response schemas, consistent error shape, auth, and documented endpoints.
- **WebSocket (later):** Authenticated, origin-restricted, membership-checked connection; no wildcard unauthenticated room broadcast.
- **Storage:** PostgreSQL for structured user data; private object storage for uploaded files. Do not store large file content in unbounded request memory.
- **AI provider:** Server-to-server calls with credentials only in server environment; send only necessary material and document the provider's data handling/retention before production use.
- **Deployment:** Frontend and backend have distinct environment configuration, health/readiness checks, HTTPS, CORS restricted to the deployed frontend, and compatible database migrations.

## 5. Data requirements

Core entities: User, Session/RefreshToken, Notebook, Note, Document, DocumentChunk, AIConversation, AIMessage, Quiz, QuizQuestion/Attempt, StudyTask. Later entities: StudyRoom, RoomMember, EncryptedChatMessage, StudySession, Flashcard, SemanticCacheEntry.

Each owned entity shall have stable identifiers, creation/update timestamps where relevant, deletion behavior, and an ownership relationship. Document version/hash shall scope embeddings and cached responses. Deleting a document shall remove or invalidate its chunks, embeddings, summaries, and dependent cached answers according to the retention policy. Passwords shall be stored only as an adaptive password hash; tokens shall not be stored in plaintext when persistence is required.

## 6. Non-functional requirements

- **NFR-001 Security:** secrets are environment-managed; passwords use a current adaptive hash; sessions use secure, HttpOnly, SameSite cookies or an equivalently reviewed pattern; CSRF protections apply where relevant.
- **NFR-002 Authorization:** every API query is constrained by authenticated owner/membership; IDs are not capabilities.
- **NFR-003 Privacy:** data collection and AI-provider disclosures are documented; file retention and deletion behavior are defined.
- **NFR-004 Reliability:** transient provider/database errors do not corrupt records; retries are bounded and idempotent where applicable.
- **NFR-005 Performance:** normal CRUD interactions should feel responsive; document/AI work is bounded by file and request limits and can expose processing state.
- **NFR-006 Accessibility:** core workflows can be completed by keyboard and have semantic controls and adequate contrast.
- **NFR-007 Maintainability:** configuration, schemas, services, migrations, and API routes are separated; setup steps are reproducible.
- **NFR-008 Observability:** health/readiness, request/error logs, and provider failures are observable without logging passwords, tokens, document text, or plaintext encrypted messages.
- **NFR-009 Portability:** the frontend can run on Vercel or an equivalent host; backend and database are deployable independently on a compatible service.
- **NFR-010 AI quality:** answers must be source-grounded, citations verifiable, and unsupported questions handled transparently. This is not a guarantee that model output is always correct.

## 7. Security and privacy requirements

1. Remove and rotate exposed provider credentials before pushing/deploying.
2. Remove deterministic and permissive OTP acceptance; verification must use cryptographically random codes, expiry, attempt throttling, single-use semantics, and a durable/appropriate store.
3. Do not return tokens or password-derived previews in JSON; do not keep auth tokens in localStorage for production sessions.
4. Restrict CORS to known origins; enforce HTTPS; add request size/rate limits and input validation.
5. Parse PDFs defensively, limit pages/bytes/time, and treat extracted text as untrusted prompt content.
6. Prevent prompt injection from document text from overriding system rules or causing cross-user retrieval.
7. Do not claim E2EE until keys are exchanged among actual users with identity binding and tested lifecycle management. The current local demo key generation is not a shared participant protocol.
8. If E2EE chat is later implemented, use a reviewed protocol/library where feasible; design for group membership changes, device addition/removal, recovery, replay, key verification, and secure backups.
9. Define data deletion, provider retention, and backup handling. Encryption at rest is not E2EE.

## 8. Acceptance criteria for first release

- A newly registered user signs in, creates a notebook and note, and sees them after logout/login.
- A second account cannot fetch, modify, or infer the first account's note/document/conversation by changing IDs or request data.
- An uploaded supported PDF transitions through processing to ready or a meaningful failure state.
- A question over that PDF returns passages/pages actually present in the document, or explicitly states that evidence was insufficient.
- A quiz can be generated from selected content, submitted, scored, and revisited after reload.
- Missing AI credentials/database do not make the UI fabricate a successful real answer or reveal secrets.
- Deployed frontend calls deployed backend over HTTPS with restricted CORS and no hard-coded credentials.
- Documentation lists supported setup, configuration variables, limitations, and demo steps.

## 9. Traceability

The P0 scope in the PRD maps to FR-001–006, FR-010–011, FR-020–022, FR-030–039 and NFR-001–010. Groups/real-time chat map to FR-050–053. Video scheduling maps to FR-053–054. Existing screens are not evidence of requirement completion; verification must be against deployed behavior and persisted data.
