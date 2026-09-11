# Implementation Plan: Mobile OTP Authentication, Notifications & Order Tracking

**Branch**: `001-mobile-otp-notifications-tracking` | **Date**: 2026-09-11 |
**Spec**: [spec.md](spec.md)

**Input**: Feature specification in [spec.md](spec.md), governing principles in
[constitution.md](../../.specify/memory/constitution.md), and the project PRD.

## Summary

Extend the existing Bisleri Vasai Store application with passwordless customer access
through a normalized Indian mobile number and OTP, while retaining protected admin access
and preserving existing commerce behavior. Add durable notification and order tracking:
status history commits with each accepted order transition, then SMS and push delivery run
as independently recoverable downstream work.

The design is additive and staged. It audits phone data before applying uniqueness, adds
OTP/session/notification/history entities, moves only customer entry UI to mobile OTP,
preserves password hashes for legacy administration/migration, and keeps End User and
Distributor pricing, order price snapshots, cart, address, and Razorpay behavior intact.

## Technical Context

**Language/Version**: TypeScript 5.6.x backend; TypeScript 6.0.x frontend; use the
deployment's supported Node.js LTS release and record the exact version before release.

**Primary Dependencies**: Existing Express, Prisma, PostgreSQL client, bcrypt, JWT,
Razorpay, React, Redux Toolkit, Capacitor, and Android project. Planned additions:
`firebase-admin` and `@capacitor/push-notifications`. SMS remains a provider-neutral
adapter with a safe mock provider outside production.

**Storage**: PostgreSQL through Prisma. Existing User, Address, Cart, Order, OrderItem,
CustomerType, and ProductPrice remain authoritative. New data covers OTP challenges,
sessions, devices, notifications/deliveries, preferences, batches, and status history.

**Testing**: Existing backend `node --test` suite plus new unit/service/integration/HTTP
contract tests. Add a project-compatible frontend test runner and test Android push flows
with a non-production mobile build.

**Target Platform**: Existing web app, Capacitor Android application ID
`com.bisleri.vasai`, and Node.js API. No application ID change is planned.

**Project Type**: Existing full-stack commerce web application with packaged Android
client and server API.

**Performance Goals**: Send-OTP under 2 seconds when SMS is responsive; verification
under 1 second excluding network latency; committed status updates/notification creation
under 1 second; tracking refresh visible under 2 seconds in normal mobile conditions.

**Constraints**: Six-digit OTP, five-minute expiry, five verification attempts,
30-second resend cooldown, 3 sends per phone per 15 minutes, and a separate IP abuse
limit. Plaintext OTPs and credentials cannot appear in source, responses, logs, or
client bundles. Provider failures cannot roll back accepted order transitions.

**Scale/Scope**: One customer mobile auth journey; End User and Distributor pricing;
multiple devices per customer; paginated notification/admin history; lifecycle
PLACED -> CONFIRMED -> PROCESSING -> OUT_FOR_DELIVERY -> DELIVERED with cancellation.
WhatsApp, email, ETA, live tracking, and delivery-agent workflows are out of scope.

## Constitution Check

_GATE: Passed before Phase 0 research. Re-checked after Phase 1 design: passed._

| Constitutional obligation                | Design response                                                                                                        | Result |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| Existing-system-first and minimal change | Extend existing backend/frontend and preserve pricing, orders, carts, payment, addresses, and Android identity.        | PASS   |
| Unified customer OTP and secure secrets  | Use normalized phone identity, hashed/limited OTPs, environment-only provider credentials, and no OTP logging.         | PASS   |
| Backend authority and data isolation     | Derive ownership, roles, customer type, prices, and notifications from authenticated server state.                     | PASS   |
| Order status is authoritative            | Commit order/status history and notification intents first; delivery occurs post-commit.                               | PASS   |
| Safe migration and resilience            | Audit phone data, add nullable fields/new tables, preserve ambiguous data, and record provider failures independently. | PASS   |
| Accessibility, observability, testing    | Include mobile OTP interaction, structured non-secret logs, contract/security tests, and Android validation.           | PASS   |

**Deployment gate**: Verify sensitive environment files are not tracked, rotate any
credentials exposed outside approved secret management, and supply SMS/Firebase
configuration through deployment secrets before production rollout.

## Phase 0: Research Decisions

All provider, migration, state, and security decisions are resolved in
[research.md](research.md). The selected design uses canonical `+91` identity,
provider-neutral SMS, Firebase push for the existing Android identity, scoped new-user
enrollment, truthful legacy status history, and a database-backed delivery outbox.

## Phase 1: Design Artifacts

- [data-model.md](data-model.md): additive entities, constraints, ownership relations,
  transaction boundaries, migration sequence, and status transitions.
- [contracts/http-api.md](contracts/http-api.md): customer, device, notification,
  tracking, and administrator request/response/authorization contracts.
- [quickstart.md](quickstart.md): non-production configuration, runnable validation,
  migration safety, provider-failure, commerce regression, and Android checks.

**Post-design gate result**: PASS. The design adds no parallel commerce/authentication
system, keeps delivery failures outside critical order transactions, preserves existing
customer pricing and history, and has a documented migration/validation path.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-otp-notifications-tracking/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── http-api.md
└── tasks.md                 # Created by /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── models/
│   ├── config/
│   ├── constants/
│   ├── services/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── workers/             # New notification delivery process
├── scripts/
└── test/

frontend/
├── android/
│   └── app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   └── api/
├── capacitor.config.ts
└── package.json
```

**Structure Decision**: Extend the existing `backend` and `frontend` applications. Add
focused services, routes, state slices, pages, and a notification worker inside their
existing ownership boundaries. Do not add a separate auth service, standalone mobile app,
duplicate pricing service, or external message queue for this feature.

## Implementation Outline

1. Audit and clean phone-data collisions, then apply an additive migration for normalized
   phone identity, OTP/session state, notification state, device state, preferences, and
   order status history. Backfill valid records and report unresolved rows.
2. Add shared phone normalization, OTP lifecycle, temporary enrollment authorization,
   session lifecycle, and a provider-neutral SMS service with fake-provider tests.
3. Replace customer Login/Register navigation with the mobile number, OTP verification,
   and profile-completion experience without removing protected admin access.
4. Add Firebase device registration, notification preferences, notification persistence,
   delivery worker, and safe provider outcome logging.
5. Introduce one centralized order-status transition operation. It validates transitions,
   writes history, creates notification intents, and schedules delivery after commit.
6. Add customer notification center, read/unread state, deep links, order tracking
   timeline, and administrator notification/status controls.
7. Run migration, security, contract, regression, web, Android, and provider-failure
   validation defined in [quickstart.md](quickstart.md) before release.
