# Padhaku Testing Report

**Date:** 5 November 2026  
**Scope:** responsive UI corrections, local API workflow, current Vercel deployment  
**Production URL:** [Padhaku on Vercel](https://padhaku-cbpi1spcx-anuj-yadav-s-projects7.vercel.app/)

## Summary

The Next.js application builds, the public Vercel homepage loads, and the local FastAPI integration path passes. Responsive fixes and the report are pushed to GitHub commit `42bd388`, but the Vercel project is still serving the earlier import at `b88849b`; it has no Git repository connection, so the latest layout has not been rebuilt. The deployed application is **not end to end yet**: its production API proxy returns HTTP 503 because `BACKEND_URL` is not configured and FastAPI/PostgreSQL are not deployed. Production authentication and saved study data therefore remain unavailable.

## Checks run

| Area | Check | Result | Evidence |
|---|---|---|---|
| Frontend | `npm run build` | PASS | Next.js 15 production build compiled, type validation completed, and all app/API routes generated. |
| Frontend lint | `npm run lint` | BLOCKED | The repository's `next lint` script opens an interactive ESLint setup prompt because no ESLint configuration is present; the non-interactive command exits without linting. |
| Local API | `python -m unittest discover -s tests -v` from `backend/` | PASS | One integration test exercises health, unauthenticated access, registration/session, profile, notes, tasks, quiz attempts, a text PDF upload, page-cited Q&A, cross-account note isolation, logout, and session invalidation using a temporary SQLite database. |
| Production UI | Open Vercel homepage | PARTIAL | The public homepage loads, but Vercel's production deployment still points to `b88849b`; commit `42bd388` with the responsive fixes is pushed but not deployed. Vercel project overview shows “Connect Git Repository.” |
| Production API | `GET /api/me` on Vercel | BLOCKED | Returns `503` with `The Padhaku API is not reachable. Start the backend or configure BACKEND_URL.` |
| Production auth/data | Registration, login, notes, PDF upload, Q&A | BLOCKED | These flows depend on the unavailable production API and were not represented as passing. |
| Responsive layout | Code review of narrow/tablet breakpoints plus production build | PARTIAL | The landing nav now collapses below 1400px, the hero stacks at 900px, and dashboard module buttons use a two-column phone layout. An automated browser viewport sweep was not available in this environment. |
| Optional AI synthesis | Provider-backed answer generation | NOT CONFIGURED | The backend integration test verifies extractive source-grounded Q&A. Provider synthesis requires a server-side `NVIDIA_API_KEY`. |
| Group chat / video | E2EE and live rooms | NOT IMPLEMENTED | Chat relay remains disabled; real group key exchange and video calls are not active. |

## Local integration coverage

The test source is [backend/tests/test_api_flow.py](../backend/tests/test_api_flow.py). It creates a temporary database, registers two independent users, and verifies that one account cannot overwrite another account's note. Its PDF fixture includes selectable text so the retrieval response can be checked for the correct source page.

The Python test client emits a Starlette deprecation warning that the bundled `httpx` integration will change in a future version. It does not fail the current test run; update the test-client dependency when upgrading the backend stack.

## UI changes included in this report

- Replaced the always-wide floating navigation with a centered, width-constrained dock.
- Hid the full desktop navigation before it can collide with the action buttons; smaller viewports get a menu with the same destinations.
- Added phone-specific compact CTA sizing and moved the landing hero to a stacked layout at tablet widths.
- Changed the dashboard module selector to two columns on phone widths and hid its scrollbar while retaining horizontal scrolling at larger widths.
- Removed a login-page header button that submitted an authentication request without credentials, and replaced inaccurate JWT/E2EE status claims with the implementation's actual limits.

## Required to finish production deployment

1. Deploy the FastAPI service and managed PostgreSQL database (the repository includes a Render blueprint).
2. Set Vercel `BACKEND_URL` to the public HTTPS API origin.
3. Set API `FRONTEND_ORIGINS` to the production Vercel origin and `COOKIE_SECURE=true`.
4. Redeploy and rerun registration → login → note persistence → PDF upload → page-cited Q&A → logout against production.

Connect the Vercel project to `ianuj-yadav/Padhaku` (requires GitHub access approval) or manually deploy commit `42bd388`, then verify its production build. Until that is done, the public link still serves the older UI. Complete steps above before presenting it as a working hosted learning service.
