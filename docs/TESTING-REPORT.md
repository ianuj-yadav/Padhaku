# Padhaku Testing Report

**Date:** 5 November 2026  
**Scope:** responsive UI corrections, local API workflow, current Vercel deployment  
**Production URL:** [Padhaku on Vercel](https://padhaku-three.vercel.app/)

## Summary

The Next.js application builds, the public Vercel homepage loads, and the local FastAPI integration path passes. The responsive UI fix at `92bfdfa` deployed successfully; the docs-only follow-up at `fd8982c` also built and is serving from the stable production alias. The deployed application is **not end to end yet**: its production API proxy returns HTTP 503 because `BACKEND_URL` is not configured and FastAPI/PostgreSQL are not deployed. Production authentication and saved study data therefore remain unavailable.

## Checks run

| Area | Check | Result | Evidence |
|---|---|---|---|
| Frontend | `npm run build` | PASS | Next.js 15 production build compiled, type validation completed, and all app/API routes generated. |
| Frontend lint | `npm run lint` | BLOCKED | The repository's `next lint` script opens an interactive ESLint setup prompt because no ESLint configuration is present; the non-interactive command exits without linting. |
| Local API | `python -m unittest discover -s tests -v` from `backend/` | PASS | One integration test exercises health, unauthenticated access, registration/session, profile, notes, tasks, quiz attempts, a text PDF upload, page-cited Q&A, cross-account note isolation, logout, and session invalidation using a temporary SQLite database. |
| Production UI | Open `padhaku-three.vercel.app` and inspect the header/menu | PASS | UI fix commit `92bfdfa` and docs-only follow-up `fd8982c` are both ready on Vercel; compact navigation and the expandable menu render at the current 1123px browser viewport. Login/sign-up stay inside the menu at this width. |
| Production API | `GET /api/me` on Vercel | BLOCKED | Returns `503` with `The Padhaku API is not reachable. Start the backend or configure BACKEND_URL.` |
| Production auth/data | Registration, login, notes, PDF upload, Q&A | BLOCKED | These flows depend on the unavailable production API and were not represented as passing. |
| Responsive layout | Review breakpoint rules and compact navigation at 1123px | PARTIAL | The landing header collapses, desktop links are replaced by a menu, and the menu opens with all destinations. The hero's ≤900px stack and dashboard's ≤640px grid breakpoints were build-checked but not run at those viewport widths. |
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

The UI is deployed; complete the API/database steps above and rerun the production workflow before presenting the link as a working hosted learning service.
