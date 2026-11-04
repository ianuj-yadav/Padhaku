# Implementation Status

**Updated:** 5 November 2026

## Implemented in this delivery

- Replaced the starter GitHub README with setup, architecture, limitations, and deployment guidance.
- Added a FastAPI service that initializes SQLAlchemy tables on startup, using SQLite locally and PostgreSQL through `DATABASE_URL`.
- Added email/password registration and sign-in, PBKDF2 password hashing, opaque random server-side sessions, HttpOnly cookies, `/api/me`, and logout.
- Added authenticated, owner-scoped note list/save/delete endpoints. Note create/edit/favorite/tag state is connected from the dashboard to the API.
- Added owner-scoped study task persistence for planner items and completion state.
- Added account-scoped persistence for submitted practice quiz attempts.
- Added authenticated PDF upload with type/signature checks, a 10 MB API cap, a 4 MB frontend cap, page text extraction, text chunk storage, and per-user document listing.
- Added owner-scoped lexical retrieval for questions and page citations. An optional server-side NVIDIA-compatible model can synthesize from those passages. Without the provider key, the API returns source excerpts and does not fabricate AI success.
- Added Next.js API proxies so the browser communicates with the web origin while the FastAPI service remains server-side.
- Disabled the anonymous WebSocket chat relay and replaced chat/video dashboard entry points with honest planned-feature notices.
- Removed hard-coded provider credential fallbacks, added `.gitignore`, `.env.example`, Docker support, and a Render blueprint.
- Pushed the GitHub README as a distinct first commit; application changes are kept in a separate follow-up commit.

## Still incomplete

- No email verification, password reset, account deletion, or rate limiting yet.
- Database tables are created at startup; this is not a versioned migration system. Add migrations before schema evolution in a long-lived deployment.
- Upload storage currently keeps extracted page chunks in the relational database and does not retain the original PDF file.
- PDF-only text extraction; image-only scans, DOCX, OCR, and vector embeddings are unsupported. Retrieval is lexical rather than pgvector semantic search.
- AI conversations, flashcards, and meetings are not fully persisted through the API.
- The available quiz set is still sample practice content; attempts are saved, but quizzes are not generated from a user's uploaded PDF. Flashcards and meeting screens are still prototype modules.
- Group chat, true E2EE, WebRTC, shared whiteboard, and meeting integration are not active. The unsafe anonymous relay is closed.
- There is no independently reviewed security assessment or automated test suite in the repository.
- Render/Vercel services have not been deployed. The project owner must configure provider credentials and deployment environment variables.

## Security boundary

The session cookie is HttpOnly and owner checks are applied in the API. This is a practical project foundation, not a production security certification. Use HTTPS in deployment, set `COOKIE_SECURE=true`, rotate any previously exposed provider credential, set a strong local PostgreSQL password, configure the exact deployed frontend origin, and add rate limiting, CSRF review, migrations, backups, and account recovery before real student data is used.

The current chat implementation must not be marketed as E2EE. The server relay is disabled until real membership authorization and a reviewed participant key agreement are implemented.
