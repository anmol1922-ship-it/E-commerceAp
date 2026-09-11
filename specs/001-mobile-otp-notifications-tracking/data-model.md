# Data Model: Mobile OTP, Notifications & Order Tracking

## Existing Entities Preserved

| Entity | Existing responsibility | Required preservation |
|---|---|---|
| User | Customer/admin identity, profile, role, customer type | Preserve IDs, role, customer type, associated orders, addresses, cart, and lifecycle. |
| CustomerType and ProductPrice | End User/Distributor commercial pricing | Do not move pricing fields or rules into auth/notification records. |
| Product, Cart, CartItem | Catalog, stock, cart | Preserve server-side stock and price behavior. |
| Address | Delivery address ownership | Preserve existing addresses; create a first address only for a new customer profile. |
| Order and OrderItem | Ownership, payment, delivery, totals, price snapshots | Preserve payment/order IDs and historical unit/total prices. |

## User Identity Changes

### User

| Field/change | Rules and migration behavior |
|---|---|
| `phone` | Preserve raw historical value. New/updated values use the accepted canonical presentation. |
| `normalizedPhone` | Nullable, unique E.164 identity. Required for OTP customer authentication after verification. Null is permitted for unresolved legacy records. |
| `phoneVerifiedAt` | Set only after successful OTP verification. |
| `email` | Optional but unique when present; existing values remain unchanged. |
| `password` | Optional for OTP-only customers; existing password hashes stay intact for legacy/admin access. |
| `isActive` | Defaults active; inactive/deleted users cannot authenticate or access protected data. |
| Relationships | Add sessions, devices, notifications, preference, and status-change actor relations without removing existing relations. |

**Canonical Indian mobile validation**: Strip spaces/punctuation, optional single leading
`0`, and optional `91`/`+91`; require exactly ten remaining digits beginning 6-9; persist
as `+91` plus those digits. Reject every other input.

## New Entities

### OTPVerification

| Field | Purpose and validation |
|---|---|
| `id` | Opaque challenge identifier. |
| `phone` | Canonical phone identity; indexed. |
| `purpose` | `CUSTOMER_AUTH` or `PROFILE_ENROLLMENT`. |
| `otpHash` | Bcrypt hash only; plaintext OTP is never persisted/logged. |
| `expiresAt` | Five minutes by default. |
| `resendAvailableAt` | 30 seconds by default. |
| `attempts` | Starts at zero; verification stops at five by default. |
| `verifiedAt` | Set once after successful verification. |
| `invalidatedAt` | Set when superseded, expired, exhausted, or consumed. |
| `deliveryStatus` | `PENDING`, `SENT`, or `FAILED`. Failed delivery cannot authenticate a user. |
| `deliveryProvider`, `deliveryError` | Sanitized operational outcome only. |
| `createdAt` | Supports rate-limit windows and audit. |

**Constraints**: One active challenge per phone/purpose. Creating a replacement challenge
invalidates previous active challenges. Attempts update atomically. Expired, verified,
invalidated, or exhausted challenges cannot be reused.

### AuthSession

| Field | Purpose and validation |
|---|---|
| `id` | Opaque session/JWT identifier. |
| `userId` | Required owner relation. |
| `expiresAt` | Matches the authenticated session lifetime. |
| `revokedAt` | Null while active; set on scoped logout/revocation. |
| `createdAt`, `lastSeenAt` | Audit and lifecycle. |
| `deviceLabel` | Optional safe display metadata only. |

**Constraints**: New OTP tokens include a session identifier checked by the backend. Legacy
tokens without that identifier remain accepted only in the migration compatibility window.

### UserDevice

| Field | Purpose and validation |
|---|---|
| `id` | Opaque device record ID. |
| `userId` | Required owner relation. |
| `fcmToken` | Globally unique push token; client never supplies a user ID. |
| `deviceType` | Supported platform value, initially Android. |
| `isActive` | False after logout, account removal, or provider-invalid token. |
| `lastSeenAt`, `createdAt`, `deactivatedAt` | Registration/lifecycle audit. |

**Constraints**: One user can have multiple active devices. Token re-registration refreshes
liveness and avoids duplicates. One logout only deactivates its associated token.

### NotificationPreference

| Field | Purpose and default |
|---|---|
| `userId` | Unique owner relation. |
| `orderPushEnabled` | True by default. |
| `paymentPushEnabled` | True by default. |
| `deliveryPushEnabled` | True by default. |
| `marketingPushEnabled` | False by default. |
| `marketingSmsEnabled` | False by default. |
| timestamps | Preference audit. |

**Constraints**: Preferences control optional marketing/nonessential channels only. They do
not disable required OTP, Out for Delivery, or Cancellation SMS policy.

### NotificationBatch

| Field | Purpose |
|---|---|
| `id` | Groups one manual administrator send. |
| `createdByUserId` | Authorized initiating administrator. |
| `audienceType`, `audienceCriteria` | Audience choice and safe serialized criteria for audit. |
| `title`, `message`, `classification` | Content and transactional/marketing classification. |
| `createdAt` | Audit timestamp. |

### Notification

| Field | Purpose |
|---|---|
| `id` | Customer-visible event ID. |
| `userId` | Required recipient owner relation. |
| `orderId` | Optional related order. |
| `batchId` | Optional manual notification batch. |
| `type` | Approved OTP/order/payment/promotion/general taxonomy. |
| `title`, `message` | Customer-safe visible content. |
| `eventKey` | Idempotency key for one recipient/event. |
| `createdAt`, `readAt` | Customer history and unread state. |

**Constraints**: `readAt` is independent from delivery. Customers can only list/read their
own records. Newest-first pagination uses stable creation-time and ID ordering.

### NotificationDelivery

| Field | Purpose |
|---|---|
| `id` | One delivery target/attempt. |
| `notificationId` | Required parent notification relation. |
| `userDeviceId` | Optional Push target; null for SMS. |
| `channel` | `PUSH` or `SMS`, extensible later. |
| `status` | `PENDING`, `PROCESSING`, `SENT`, or `FAILED`. |
| `attemptCount`, `nextAttemptAt` | Bounded retry schedule. |
| `provider`, `providerMessageId` | Sanitized delivery correlation. |
| `sentAt`, `failedAt`, `lastError` | Observability without secrets/OTP values. |
| `lockedAt`, `lockOwner` | Durable worker claim/lease. |

**Constraints**: A notification has at most one delivery per channel/device target. Only the
worker claims pending deliveries. Provider failure updates the delivery outcome and never
changes the parent order's status.

### OrderStatusHistory

| Field | Purpose |
|---|---|
| `id` | Opaque history item ID. |
| `orderId` | Required order relation. |
| `previousStatus` | Null for initial/migrated entry; otherwise canonical prior state. |
| `status` | Canonical resulting state. |
| `description` | Optional customer-safe explanation. |
| `changedByUserId` | Optional administrator/system actor audit. |
| `eventKey` | Idempotency key for a transition. |
| `createdAt` | Authoritative transition time. |

**Constraints**: History is append-only. Every accepted transition creates one item. Invalid
or repeated transitions create neither history nor notification intent.

## Order Status State Model

```text
PLACED -> CONFIRMED -> PROCESSING -> OUT_FOR_DELIVERY -> DELIVERED
             |              |
             +--------------+-> CANCELLED
```

- `CANCELLED` is terminal and is allowed only from `PLACED`, `CONFIRMED`, or `PROCESSING`.
- `DELIVERED` is terminal.
- Repeating current state is idempotent and produces no duplicate history/message.
- Existing `dispatched` maps to `OUT_FOR_DELIVERY`; future records use canonical states.

## Transaction Boundaries

### Customer OTP verification

1. Lock/select active challenge by canonical phone and purpose.
2. Validate expiry, invalidation, cooldown, and attempt policy.
3. Compare the hash and atomically consume a valid challenge or record a failed attempt.
4. Create an active customer session for an existing account or a scoped enrollment token for
   a new phone.
5. Commit before returning the next authenticated/enrollment state.

### New customer profile completion

1. Validate the enrollment token and its verified challenge.
2. Create customer, address, default `END_USER` relation, notification preference, and active
   session together.
3. Enforce unique normalized phone; resolve collisions to the existing-account path rather
   than creating duplicates.

### Order status update

1. Validate administrator role, order existence, current status, and requested transition.
2. Update `Order.status` and status timestamp.
3. Add one `OrderStatusHistory` item.
4. Create one customer-visible `Notification` and pending Push/SMS deliveries under policy.
5. Commit. The worker handles external delivery after commit.

## Migration Sequence

1. Audit existing phone values and report valid canonical entries, duplicates, missing values,
   and invalid values.
2. Add nullable identity fields, OTP/session tables, notification/timeline tables, and indexes
   without deleting existing columns or relations.
3. Backfill valid, unique normalized phones. Flag invalid/duplicate records for support; never
   fabricate a phone number.
4. Relax email/password only after OTP profile completion can create valid new users. Preserve
   existing email uniqueness and password hashes.
5. Backfill default preferences for existing users.
6. Canonicalize current order statuses and add one truthful mapped-status history record per
   order. Preserve historical price/customer type data unchanged.
7. Deploy server flow and customer UI, then disable customer-facing password entry only after
   phone-data readiness and regression validation pass.

## Retention and Deletion

- Retain OTP hashes and sanitized delivery outcomes only for an approved bounded security/audit
  period; plaintext OTPs never exist in stored data.
- Account deletion revokes sessions and deactivates device registrations. Customer notification
  access stops immediately. Existing order retention follows the established legal/business
  policy and is not silently changed by this feature.
- Notification/status history remains auditable while access stays constrained by owner role and
  customer ownership.
