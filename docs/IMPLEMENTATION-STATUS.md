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
- Improved landing-page and dashboard responsiveness: compact menu on smaller screens, stacked tablet hero, and a two-column dashboard module selector on phones. Removed an auth-looking control that incorrectly submitted login without credentials and corrected inaccurate security claims.
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
- There is no independently reviewed security assessment. A local API integration test now covers the core account-to-document Q&A path; it does not replace full browser, security, or production database testing.
- The Next.js frontend and responsive fixes are deployed to [Vercel](https://padhaku-three.vercel.app/); UI fixes at `92bfdfa` and the docs-only follow-up at `fd8982c` were built successfully through the connected GitHub repository. The FastAPI API and database are not deployed or connected yet. `BACKEND_URL` is not configured; production `/api/me` returns HTTP 503, so deployed login, notes, uploads, and Q&A cannot work end to end until an API service and database are provisioned and the URL is configured.
- The standalone local integration checks are in `backend/tests/test_api_flow.py`; results and production smoke findings are in [TESTING-REPORT.md](TESTING-REPORT.md).

## Security boundary

The session cookie is HttpOnly and owner checks are applied in the API. This is a practical project foundation, not a production security certification. The Vercel web tier uses HTTPS, but the production API is not connected. Before real student data is used, deploy the API with PostgreSQL, set `COOKIE_SECURE=true`, configure the exact Vercel origin in `FRONTEND_ORIGINS`, rotate any previously exposed provider credential, and add rate limiting, CSRF review, migrations, backups, and account recovery.

The current chat implementation must not be marketed as E2EE. The server relay is disabled until real membership authorization and a reviewed participant key agreement are implemented.
