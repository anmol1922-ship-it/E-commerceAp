<!--
Sync Impact Report
- Version change: unratified scaffold -> 1.0.0
- Modified principles: placeholder principles -> 20 Bisleri Vasai Store principles
- Added sections: Engineering, Security, Architecture & Data Standards; Delivery,
	API, Quality, UX & Deployment Standards
- Removed sections: none; the scaffold placeholders were replaced with project governance
- Follow-up TODOs: TODO(RATIFICATION_DATE) requires confirmation of the original adoption date
-->

# Bisleri Vasai Store Constitution

## Core Principles

### I. Existing-System-First Development

Before proposing or implementing a change, contributors MUST inspect the existing
frontend, backend, Prisma schema, authentication, routing, payment, Android/Capacitor,
admin, and data flows. Existing working behavior, users, orders, addresses, carts,
payments, and End User/Distributor pricing MUST be preserved unless the approved
requirements explicitly change it. Rationale: production data and established
contracts are more valuable than a clean-slate design.

### II. Minimal and Incremental Change

Changes MUST be scoped to the approved requirement, reuse existing abstractions, and
avoid parallel systems or unrelated rewrites. Each change MUST have a reversible,
testable increment and MUST leave unrelated business rules unchanged. Rationale:
small changes reduce regression risk in a production-oriented commerce application.

### III. Mobile-First Product Experience

Customer workflows MUST be designed for touch-first mobile use, responsive layouts,
clear loading and error states, accessible controls, and the existing Capacitor Android
runtime. Desktop layouts MUST remain usable, but mobile checkout, authentication,
notifications, and tracking are the primary experience. Rationale: the target customer
will commonly order and receive updates on a phone.

### IV. Unified Passwordless Mobile Authentication

Customer login and registration MUST be one mobile-number entry flow: normalized
Indian phone number, OTP verification, existing-user sign-in or new-user profile
completion. Customer password login MUST NOT be required for the new flow. Admin
authentication MUST remain protected and separate from customer self-service. Rationale:
one flow prevents duplicate accounts and removes unnecessary customer friction.

### V. Secure OTP Lifecycle

OTP values MUST be six digits by default, hashed before persistence, short-lived,
single-use, attempt-limited, resend-cooled, and rate-limited. The API MUST NOT return
or log plaintext OTPs. A new OTP MUST invalidate earlier active OTPs, and expired or
exhausted verifications MUST fail closed. Rationale: OTP is an authentication secret,
not a user profile field.

### VI. Secure Secrets and Credential Isolation

SMS credentials, Firebase service credentials, JWT secrets, database credentials,
Razorpay secrets, and provider keys MUST be supplied through environment or secret
management configuration. They MUST NOT be committed, logged, bundled into the React
application, or exposed to clients. `.env.example` MAY contain placeholders only.
Rationale: provider credentials grant access to customer communications and money flows.

### VII. Backend-Controlled Business Logic

The backend MUST own authentication decisions, customer type resolution, product
pricing, cart validation, order totals, delivery rules, payment amounts, notification
eligibility, and authorization. Frontend values MAY be display hints but MUST NOT be
trusted as prices, roles, customer types, totals, or notification permissions.
Rationale: clients are mutable and cannot be the source of commercial or security truth.

### VIII. Order Status as the Source of Truth

An order status change MUST be the authoritative event. The backend MUST validate the
transition, update the order, create status history, and then trigger downstream
notification work. Notifications MUST never become the mechanism that decides or
represents the order state. Rationale: order data remains correct even when delivery
providers are unavailable.

### IX. Notification Reliability and Failure Isolation

Push and SMS notifications MUST be downstream effects of committed order/auth events.
Notification creation and delivery failures MUST be recorded and observable, but MUST
NEVER roll back or fail an otherwise valid order status update. External provider calls
SHOULD be asynchronous or isolated from the database transaction. Rationale: a provider
outage must not block fulfillment operations.

### X. Customer Data Isolation

Every customer-facing order, tracking, notification, device, address, and profile query
MUST be scoped to the authenticated user. Ownership MUST be checked server-side for
every read and mutation; client-supplied user IDs MUST be ignored for authorization.
Customers MUST NOT access another customer's data. Rationale: tenant isolation is a
non-negotiable privacy and security boundary.

### XI. Role-Based Authorization

Permissions MUST be derived from server-side role and ownership checks. Admin routes,
customer routes, and provider operations MUST use explicit authorization middleware.
Customers MUST NOT assign themselves an admin role or access admin notification/order
controls. Rationale: authentication proves identity; authorization determines allowed
actions.

### XII. Customer Type and Role Separation

Application role and commercial customer type MUST remain independent concepts. `ADMIN`
or customer permissions MUST NOT determine pricing. `END_USER` and `DISTRIBUTOR` MUST
resolve through the existing `CustomerType` and `ProductPrice` architecture, and
distributor pricing MUST remain server-controlled. Rationale: permissions and pricing
can evolve independently.

### XIII. Database Integrity and Safe Migrations

Schema changes MUST use reviewed Prisma migrations that preserve production data,
backfill deterministically, maintain foreign keys and unique constraints, and retain
historical order price/status snapshots. Destructive changes require an explicit data
migration and rollback or recovery plan. Rationale: orders, users, addresses, carts,
payments, and pricing are durable business records.

### XIV. Consistent API Contracts

API naming, authentication, response envelopes, validation, status codes, ownership
rules, and error shapes MUST follow existing project conventions. Product, cart,
checkout, order, tracking, notification, and admin responses MUST represent the same
server-side state across all stages. Contract changes MUST update consumers and tests
together. Rationale: inconsistent endpoints create hidden security and pricing defects.

### XV. Error Handling and Resilience

Inputs MUST be validated at boundaries, provider errors MUST be translated into safe
customer-facing messages, and internal details and secrets MUST remain private. APIs
MUST fail predictably for expired OTPs, invalid ownership, missing prices, unavailable
stock, provider outages, and invalid transitions. Recoverable notification failures
MUST not compromise core commerce operations. Rationale: graceful failure is part of
the customer experience and operational safety.

### XVI. Testability and Quality Gates

New services and contracts MUST be independently testable. Tests MUST cover OTP
security, existing and new customer flows, authorization, pricing by customer type,
order snapshots, status transitions, notification persistence, unread/read behavior,
provider failures, and ownership isolation. Builds, type checks, Prisma validation,
and relevant tests MUST pass before merge. Rationale: authentication and payment-adjacent
changes require evidence, not manual confidence.

### XVII. Observability and Auditability

Structured logs and durable records MUST cover authentication outcomes, order status
transitions, notification creation, SMS/FCM success or failure, and operational errors.
Logs MUST exclude OTP values, credentials, tokens, and private customer data. Order
status history and notification delivery state MUST support diagnosis without relying on
provider dashboards alone. Rationale: production incidents require traceable facts.

### XVIII. Performance and Asynchronous Work

Authentication and customer APIs MUST avoid unnecessary database round trips and remain
responsive under normal mobile latency. SMS and FCM delivery MUST NOT block order status
updates beyond the required database work. Pagination or bounded queries MUST be used
for notification history, orders, and admin reports. Rationale: responsiveness matters
while provider calls and mobile networks are variable.

### XIX. Accessibility and Inclusive UX

Authentication, OTP entry, notifications, tracking, checkout, and admin controls MUST
have labels, keyboard and screen-reader support, adequate contrast, clear focus states,
usable touch targets, understandable errors, and non-color-only status indicators.
OTP fields MUST support paste and accessible focus behavior. Rationale: a mobile-first
experience must remain usable for customers with different abilities and devices.

### XX. Extensible Modular Architecture

SMS, FCM, notification rules, OTP policy, order status transitions, and provider
integrations MUST be isolated behind focused services or adapters. New channels such as
WhatsApp and email, live delivery tracking, ETA, and driver workflows MUST be addable
without rewriting order, pricing, or authentication ownership logic. Rationale:
modularity preserves today's simplicity while keeping tomorrow's integrations feasible.

## Engineering, Security, Architecture & Data Standards

- The implementation MUST continue using the existing React/Vite/TypeScript/Capacitor,
  Node/Express/TypeScript, Prisma, PostgreSQL/Supabase, and Razorpay architecture unless
  an approved decision record justifies a change.
- Customer phone numbers MUST be normalized consistently, stored uniquely, and used as
  the authentication identifier. Existing users without a usable phone number MUST be
  identified and handled by an explicit migration plan; phone numbers MUST NOT be
  invented.
- Customer passwords MAY remain as nullable legacy data during migration, but customer
  authentication MUST use mobile number plus OTP. Admin access MUST retain a secure,
  explicitly authorized path.
- The OTP model MUST record only a hash, expiration, attempt count, verification state,
  and timestamps. OTP request and verification limits MUST be configurable.
- `UserDevice`, `Notification`, `OrderStatusHistory`, and notification preference data
  MUST preserve ownership relations and support multiple devices per user.
- Database transactions MUST cover order state and durable history creation where
  possible. SMS and FCM delivery MUST occur outside the critical transaction or through
  an isolated job mechanism.
- Existing `CustomerType`, `ProductPrice`, Razorpay, order, cart, address, and account
  deletion behavior MUST remain compatible with the migration and new authentication.

## Delivery, API, Quality, UX & Deployment Standards

- New APIs MUST document request validation, authentication requirements, ownership scope,
  success responses, safe error responses, and rate limits. Required route families
  include OTP/profile authentication, device registration, notification history,
  order tracking, and protected admin status/notification controls.
- Notification payloads MUST carry only the minimum deep-link data, such as notification
  type and an authorized order identifier. Tapping a notification MUST navigate to an
  ownership-checked order or notification view and fall back safely when unavailable.
- Order status transitions MUST use one centralized backend operation. Admin interfaces
  MUST request a status update only; they MUST NOT directly send trusted SMS or push
  messages.
- UI work MUST preserve existing components and routing where possible, provide loading,
  empty, retry, and error states, and avoid exposing provider implementation details.
- Deployment MUST use separate development, staging, and production provider credentials.
  Firebase Android configuration, SMS/DLT templates, database migrations, and required
  environment variables MUST be documented before production release.
- A release MUST include migration review, backend build/type checks, frontend build,
  Prisma validation, focused unit/integration tests, and an Android/Capacitor check when
  native notification behavior changes.
- Production rollouts MUST be backward-aware: apply additive schema changes and backfills
  before removing legacy paths, preserve existing sessions/data where possible, and
  provide an operational recovery plan for migration or provider failures.

## Governance

This constitution is the governing engineering contract for Bisleri Vasai Store.
Specifications, plans, task lists, issues, pull requests, code reviews, migrations,
and releases MUST demonstrate compliance with the applicable principles. When a lower-
level document conflicts with this constitution, the constitution takes precedence.

Amendments MUST be proposed as a reviewed documentation change containing the rationale,
affected principles, compatibility impact, migration or rollout requirements, and updated
validation expectations. Maintainers MUST approve amendments before implementation work
that depends on them is merged. Exceptions MUST be explicit, narrowly scoped, time-bound,
and recorded with an owner and follow-up date.

The constitution uses semantic versioning. The initial project-specific constitution is
`1.0.0`. A MAJOR increment is required for backward-incompatible governance changes or
principle removal. A MINOR increment is required for a new principle or materially new
governance obligation. A PATCH increment is required for clarification, wording, or
non-semantic correction. Every amendment MUST update the Sync Impact Report, version,
and last-amended date.

Compliance MUST be reviewed at specification, plan, implementation, migration, and
release checkpoints. Reviewers MUST verify security boundaries, customer ownership,
pricing isolation, data preservation, notification failure isolation, test evidence,
and secret handling. The project constitution MUST be revisited when authentication,
payments, customer pricing, order lifecycle, notification providers, or native mobile
capabilities materially change.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm the original adoption date | **Last Amended**: 2026-09-11
