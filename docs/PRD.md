# PADHAKU — Product Requirements Document

**Status:** Draft for owner review
**Observed date:** 5 November 2026
**Product name:** PADHAKU / Padhaku Smart Study Hub

## 1. Product summary

Padhaku is intended to be a student workspace that turns personal course notes and documents into searchable, useful study material, then supports revision and peer study in one application. The strongest initial value is a grounded learning loop: add study material, ask questions with source citations, then generate and take revision quizzes. Collaboration, encrypted chat, and live study rooms extend that loop after the learning workflow is reliable.

The current repository is a visually developed prototype that presents many of these ideas. It is not yet an end-to-end product: much of its data is sample data, several screens are client-side demonstrations, and the backend does not yet provide the persistence, authorization, document processing, or complete services described in the concept.

## 2. Problem and opportunity

Students keep course material across PDFs, notes, chats, and separate tools. Finding an explanation in their own materials and converting it into practice takes time. Padhaku should reduce that friction by organizing student-owned content and giving traceable, course-contextual study assistance, while also making collaborative revision easier.

## 3. Intended users

- **Primary:** university/college students organizing subjects, notes, and exam revision.
- **Secondary:** small study groups coordinating discussion and scheduled study sessions.
- **Future:** instructors or cohort administrators sharing course material and group resources.

The first release should optimize for one student account and a small, invited study group, not institutional administration.

## 4. Product goals

1. A student can create an account, sign in, and see only their own data.
2. A student can create and edit notebooks/notes and upload supported study documents.
3. A student can ask questions against processed material and receive answers with real source/page citations, or a clear “not found in your material” response.
4. A student can create a quiz from selected material, submit it, and review results.
5. A student can save and revisit study activity across sessions and devices.
6. The project can be demonstrated from a fresh deployment with reproducible setup and no hidden demo-only dependencies.

## 5. Product principles

- Grounded AI should show where an answer came from and distinguish retrieved evidence from general knowledge.
- Privacy claims must match the actual data flow. Ordinary HTTPS, server-side database encryption, and end-to-end encryption are different guarantees.
- The first release should prove one complete learning workflow before expanding into many partially connected modules.
- Student data is private by default; every resource operation is authorized server-side.
- AI should not silently read encrypted group conversations. The user must explicitly share selected content, and the interface must make that disclosure clear.

## 6. Proposed scope

### First demonstrable release (P0)

- Authentication and protected user workspace.
- Dashboard navigation and empty/loading/error states.
- Notebook and note create/read/update/delete.
- PDF upload, storage, text extraction, document status, and ownership checks.
- Retrieval-grounded question answering with citations, per-user/document access control, and conversation history.
- Summary and quiz generation from a selected document; quiz taking and score review.
- PostgreSQL persistence and deployment configuration for frontend and backend.
- Basic operational logging, input validation, rate limiting, and a privacy/security explanation.

### Next release (P1)

- Search and tags, favorites, export, flashcards, and planner persistence.
- Study groups and real-time chat, with a deliberately selected security model.
- Real-time collaborative study-room signaling and/or a trusted video provider.

### Later or separately scoped (P2)

- Production-grade E2EE, verified member identities, key rotation, device recovery, and group key management.
- WebRTC P2P and SFU scale routing, shared whiteboard, OCR for handwritten notes, calendar/email integrations, institutional features.
- Semantic caching and multi-provider model routing after quality, privacy, invalidation, and cost behavior are measured.

## 7. Out of scope for the first release

- Claiming “zero knowledge” or production E2EE from the current cryptography demo.
- Building a custom video infrastructure/SFU under a one-day presentation deadline.
- Guaranteeing OCR accuracy for handwriting or support for every file format.
- Multi-tenant university administration, payments, mobile apps, or guaranteed AI correctness.
- Treating seeded sample records as user-created or persistent records.

## 8. Primary user journey

1. Student registers/signs in and lands in a private dashboard.
2. Student creates or selects a subject notebook and adds a note or uploads a PDF.
3. The application validates the file, stores it privately, extracts text, and shows processing state.
4. Student asks a question scoped to that document or notebook.
5. The system retrieves authorized passages, generates a grounded answer, and displays citations linked to document/page.
6. Student generates a quiz from that source, submits answers, and reviews score and explanations.
7. Student signs out and back in; their records remain available and isolated from other users.

## 9. Key product decisions requiring owner review

- **CMAT meaning:** the pasted idea assumes CMAT is the project's own chat module. Confirm whether it names an external service or a particular protocol before treating that assumption as final.
- **Privacy claim:** decide whether the presentation promises actual E2EE now or describes it as a future milestone. The observed implementation does not support the stronger claim.
- **AI provider:** source currently refers to NVIDIA and a model identifier, while the idea also mentions Gemini. Select one supported provider/model based on the actual account, access, and deployment budget.
- **Demo boundary:** one day is suitable for polishing a narrow, honest demo, not completing the entire platform and production security stack.
- **Deployment:** Vercel is suitable for Next.js; FastAPI and PostgreSQL require separately hosted services. Render is one possible hosting option, but exact service/database plans and current limits must be checked during implementation.

## 10. Product success measures

For a live presentation, success means the primary journey completes without manual database edits or seeded-data dependence; new users cannot access another account's data; uploaded content yields citations traceable to extracted pages; and failure states explain what action the student can take. Later product metrics may include upload completion, answer citation usefulness, quiz completion, repeat use, and cost per active learner.

## 11. Risks and assumptions

- AI responses may hallucinate; citations and abstention behavior reduce but do not eliminate this risk.
- Documents can contain sensitive data and malicious prompt instructions; file limits, safe extraction, retention policy, and prompt-injection defenses are needed.
- A browser-only mock does not prove multi-user or cross-device persistence.
- True E2EE conflicts with server-side search, moderation, backups, and AI access unless carefully designed.
- Hosting availability, provider credentials, database extensions, and quotas remain unverified in this workspace.
