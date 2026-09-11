# Research: Mobile OTP Authentication, Notifications & Order Tracking

## Existing-System Findings

- Customers currently use separate email/password login and registration routes. `User`
  requires a unique email, a password hash, and a non-unique phone field.
- Existing JWTs identify a user; authorization middleware reloads that user from the
  database. Customer type is already server-derived, and `CustomerType`/`ProductPrice`
  must remain independent from application role.
- Orders already hold customer ownership, customer type and price snapshots, Razorpay
  references, and a current status. Administrators update status directly, but no
  timeline or notification effect exists yet.
- The mobile client has existing Capacitor Android configuration for application ID
  `com.bisleri.vasai` and conditionally applies Google services when local Firebase
  configuration exists. It has no runtime token/notification integration.
- No SMS/FCM service, notification persistence, preference data, or delivery worker
  currently exists.

## Decision 1: Canonical Phone Identity

**Decision**: Store customer authentication identity as E.164 `+91` followed by one
valid 10-digit Indian mobile number beginning with 6-9. Remove presentation spaces and
punctuation, a leading local `0`, and one country prefix before validation. Preserve the
existing raw phone value and add a nullable unique normalized phone value, backfilled
only when valid and non-colliding.

**Rationale**: Existing phone strings are neither unique nor normalized. An additive
canonical field avoids duplicate identities while preserving ambiguous records for
support resolution.

**Alternatives considered**:

- Reusing raw phone as unique: rejected because historical formats can collide or be
  invalid.
- Inventing replacement values for missing/duplicate records: rejected because it
  corrupts identity and order ownership.
- Supporting arbitrary international formats: rejected because the approved experience
  is India-first with +91 as the default.

## Decision 2: Customer OTP Cutover and Legacy Credentials

**Decision**: Replace customer-facing Login/Register with the unified phone/OTP flow.
Keep email as an optional unique contact field and retain password hashes as optional
legacy/admin credentials. Existing signed sessions remain usable until their normal
expiry. Protected administrator credential access remains available during migration.

**Rationale**: This delivers passwordless customer access while preserving existing
records, active sessions, and administrative operation.

**Alternatives considered**:

- Deleting email/password data immediately: rejected because it breaks existing users
  and administrator access.
- Keeping customer password login as a permanent equal path: rejected because it
  violates the unified customer experience.
- Putting phone verification state in trusted client claims: rejected because the server
  must remain authoritative for identity and authorization.

## Decision 3: OTP Lifecycle and Enrollment

**Decision**: Generate OTPs cryptographically and persist only a bcrypt hash, canonical
phone, purpose, expiry, resend time, attempt count, verification time, invalidation time,
and sanitized delivery outcome. After a new phone verifies, issue a short-lived,
purpose-scoped enrollment token that permits profile completion only.

Default policy: 6 digits, 5-minute expiry, 5 verification attempts, 30-second resend
cooldown, 3 sends per phone per 15 minutes, and separate IP request/verification limits.
All values are deployment-configurable.

**Rationale**: Challenges are single-use, bounded, non-replayable, and never create an
incomplete customer or normal commerce session before profile completion.

**Alternatives considered**:

- Storing plaintext OTPs: rejected by the constitution and feature requirements.
- Returning OTPs in development responses: rejected because it normalizes unsafe API
  behavior; tests inject a fake SMS adapter instead.
- Creating a user before profile completion: rejected because abandonment creates
  incomplete customer data.

## Decision 4: SMS Provider Boundary

**Decision**: Define a provider-neutral SMS service with a mock provider for local and
automated tests. `SMS_PROVIDER` selects the production adapter, whose templates, sender
identity, and response parsing remain inside the adapter.

**Rationale**: The business needs SMS without binding OTP/order logic to a vendor and
must support provider-specific Indian template/DLT onboarding later.

**Alternatives considered**:

- Direct provider calls in controllers: rejected because it spreads credentials and
  failure behavior.
- Hard-coding a provider before operations provide an approved account/templates:
  rejected because production delivery cannot be accepted safely.
- Real SMS in automated tests: rejected because it is costly, nondeterministic, and risks
  contacting customers.

## Decision 5: Firebase Push and Android Integration

**Decision**: Use Firebase Cloud Messaging for server delivery and Capacitor push
notifications for Android permission, token, refresh, foreground/background, and tap
handling. Keep application ID `com.bisleri.vasai`; install the matching Firebase
configuration manually outside source control. Server Firebase credentials come only from
deployment secrets.

**Rationale**: This completes the existing Android Google-services preparation without
changing mobile application identity.

**Alternatives considered**:

- Browser-only notifications: rejected because native background/tap behavior is needed.
- Frontend Firebase server credentials: rejected by the constitution.
- Changing application ID: rejected because it breaks release identity and configuration
  continuity.

## Decision 6: Durable Notification Delivery

**Decision**: Commit customer-visible notification events and per-channel/per-device
pending delivery records with the order transition. A database-backed worker claims
pending deliveries after commit, sends them, and records sent/failed outcomes with bounded
retries.

**Rationale**: The project database provides a durable outbox without adding Redis or a
separate broker. Provider failure or process restart cannot roll back or silently discard
an order-state event.

**Alternatives considered**:

- Sending SMS/FCM inside the order transaction: rejected because provider latency/failure
  would affect order correctness.
- In-process fire-and-forget only: rejected because process restarts lose work.
- A new external queue/broker: rejected because the database outbox satisfies the current
  reliability requirement with less infrastructure.

## Decision 7: Notification Policy

**Decision**: Centralize event-to-channel policy rather than scattering conditions.

| Event | Push | SMS | Preference class |
|---|---:|---:|---|
| OTP | No | Required | Transactional |
| Order placed | Required | Off by default | Transactional |
| Payment successful | Required | Off by default | Transactional |
| Confirmed | Required | No | Transactional |
| Processing | Required | No | Transactional |
| Out for delivery | Required | Required | Transactional |
| Delivered | Required | Off by default | Transactional |
| Cancelled | Required | Required | Transactional |
| Promotion | Opt-in | Opt-in | Marketing |
| General | Explicitly classified | Explicitly classified | Policy-selected |

**Rationale**: Marketing preferences cannot accidentally disable essential communication,
and policy changes stay auditable.

**Alternatives considered**: Per-screen toggles and per-controller checks were rejected
because they create contradictory behavior.

## Decision 8: Status Transition and Legacy History

**Decision**: Use canonical statuses `PLACED`, `CONFIRMED`, `PROCESSING`,
`OUT_FOR_DELIVERY`, `DELIVERED`, and `CANCELLED`. Map legacy `dispatched` to
`OUT_FOR_DELIVERY`. Backfill one history entry per existing order representing its mapped
current state and explaining that earlier milestones were unavailable.

**Rationale**: The tracking timeline stays truthful without fabricating historical events.

**Alternatives considered**:

- Retaining both dispatched and Out for Delivery: rejected because it causes conflicting
  transitions.
- Inventing a full sequence for historical orders: rejected because those timestamps and
  transitions were never recorded.

## Decision 9: Session and Deletion Behavior

**Decision**: New OTP sessions include a server-checked session identifier, allowing one
mobile session/device logout without invalidating all devices. Legacy tokens without that
identifier remain accepted only through the migration compatibility window. Account
delete revokes sessions and deactivates device registrations by authenticated ownership.

**Rationale**: Device-scoped logout needs server revocation while existing session
continuity is preserved during cutover.

**Alternatives considered**: Client-only logout was rejected because it cannot invalidate
a lost token; global user token version was rejected because it logs out every device.

## Decision 10: Configuration Hygiene

**Decision**: Documentation contains placeholders only. Add OTP, SMS, Firebase, and
worker configuration to environment examples; correct the database example to match the
PostgreSQL deployment; require secret-audit/rotation before production release.

**Rationale**: Authentication, messaging, payments, and databases require strict
credential handling.

**Alternatives considered**: Hard-coded fallbacks and frontend provider configuration were
rejected by the constitution.
