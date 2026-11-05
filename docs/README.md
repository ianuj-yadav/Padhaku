# PADHAKU Documentation

This folder records the product intent, implementation, proof-of-concept boundaries, requirements, deployment state, and test evidence as observed on 5 November 2026.

## Documents

- [Product Requirements Document](PRD.md): audience, product promise, scope, workflows, and success measures.
- [Software Requirements Specification](SRS.md): functional and non-functional requirements for an end-to-end release.
- [Proof of Concept and Current State](POC-and-current-state.md): what the repository demonstrates today and what it does not yet prove.
- [Gap Analysis and Delivery Plan](GAP-ANALYSIS.md): faulty or incomplete areas, priorities, deployment considerations, and a realistic path to a presentable release.
- [Implementation Status](IMPLEMENTATION-STATUS.md): capabilities implemented after approval and remaining boundaries.
- [Testing Report](TESTING-REPORT.md): local backend integration checks, Vercel smoke findings, and blocked production workflows.

## Current boundary

The original PRD, SRS, and POC assessment record product intent and the earlier prototype baseline. Implementation and deployment status are updated in Implementation Status and the Testing Report.

## Important repository observation

The active Git remote is `https://github.com/ianuj-yadav/Padhaku.git`. The frontend has a Vercel production deployment; the backend remains unhosted, as documented in the Testing Report.

## Security note

An earlier revision contained a provider credential in source defaults. It is not repeated here; treat any credential from that revision as exposed, rotate it with the provider, and use deployment secrets only. The current frontend is public on Vercel, so verify the repository history has no usable key before configuring AI.
