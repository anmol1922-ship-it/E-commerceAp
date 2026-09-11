# HTTP API Contracts

## Common Rules

- All routes are rooted at `/api` and preserve the existing `{ success: boolean, ... }`
  response envelope.
- Protected routes use the existing bearer session convention. The backend derives customer
  identity and role from the session; a client never supplies an authoritative user ID,
  role, customer type, price, or order total.
- Missing/invalid sessions return `401`. Ownership failure returns `404` or `403` without
  exposing another customer's data. Admin-only routes return `403` for non-admins.
- Validation failure returns `400`; throttling returns `429`; safe provider/configuration
  failure returns `503`.
- OTP values, credentials, service-account material, and raw provider errors never appear
  in responses.

## Authentication

### `POST /auth/send-otp`

Starts unified customer sign-in/enrollment.

Request:

```json
{ "phone": "9876543210" }
```

Success response:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "resendAvailableInSeconds": 30
}
```

The server normalizes the Indian phone number, does not reveal account existence, replaces
prior active challenges, enforces rate limits, and sends the OTP through the configured
SMS service.

### `POST /auth/verify-otp`

Consumes a valid OTP for the normalized phone identity.

Request:

```json
{ "phone": "9876543210", "otp": "123456" }
```

Existing-customer success:

```json
{
  "success": true,
  "nextStep": "AUTHENTICATED",
  "token": "customer-session-token",
  "user": {
    "id": "user-id",
    "name": "Customer Name",
    "phone": "+919876543210",
    "role": "customer",
    "customerType": { "code": "END_USER", "name": "End User" }
  }
}
```

New-customer success:

```json
{
  "success": true,
  "nextStep": "COMPLETE_PROFILE",
  "enrollmentToken": "short-lived-profile-token",
  "phone": "+919876543210"
}
```

Expired, invalidated, used, malformed, rate-limited, or exhausted challenges fail safely.
The backend records attempts and does not issue normal customer access for a new phone.

### `POST /auth/complete-profile`

Creates a new customer after verified OTP enrollment. Requires the enrollment token and
never accepts role or customer type as authoritative client input.

Request:

```json
{
  "name": "Customer Name",
  "email": "optional@example.com",
  "address": {
    "street": "12 Main Road",
    "area": "Vasai West",
    "city": "Vasai",
    "pincode": "401201"
  }
}
```

Success response:

```json
{
  "success": true,
  "token": "customer-session-token",
  "user": {
    "id": "user-id",
    "name": "Customer Name",
    "phone": "+919876543210",
    "role": "customer",
    "customerType": { "code": "END_USER", "name": "End User" }
  }
}
```

The operation validates address/service area, creates one customer/address atomically,
defaults customer type to End User, and handles normalized-phone collisions without
duplicating data.

### `GET /auth/me`

Returns the current customer's safe server-derived profile, active status, customer type,
and addresses. Clients use this to refresh stale stored identity information.

### `POST /auth/logout`

Requires authentication. Revokes the active session and may deactivate the explicitly
registered current device. It does not deactivate other owned devices.

### `DELETE /auth/delete-account`

Requires authenticated ownership. The server derives the current customer, revokes active
sessions/deactivates devices, and applies the existing deletion retention policy. It never
uses an arbitrary user ID or unverified email as authority.

## Device and Notification Contracts

### `POST /notifications/register-token`

Requires authentication.

```json
{ "fcmToken": "device-token", "deviceType": "android" }
```

Registers or refreshes a token for the authenticated user, updates liveness, and supports
multiple owned active devices.

### `DELETE /notifications/unregister-token`

Requires authentication.

```json
{ "fcmToken": "device-token" }
```

Deactivates only that owned token.

### `GET /notifications?page=1&limit=20`

Returns newest-first, stable paginated notification history for the authenticated customer
only. Each item includes identifier, type, title, message, optional order ID, created time,
and read time.

### `GET /notifications/unread-count`

Returns unread notification count for the authenticated user only.

### `PATCH /notifications/:id/read`

Idempotently marks one owned notification read.

### `PATCH /notifications/read-all`

Marks all unread notifications owned by the caller as read.

### `GET /notifications/preferences` and `PUT /notifications/preferences`

Read/update the caller's permitted push and marketing settings. Required transactional
communication policies remain server controlled.

## Order Tracking Contracts

### `GET /orders/my-orders`

Preserves existing paginated customer order history, including current status, payment,
totals, customer type, and price snapshots.

### `GET /orders/my-orders/:id`

Preserves existing owned order-detail behavior. The user can read only orders whose owner
matches the authenticated session.

### `GET /orders/:id/tracking`

Requires an authenticated owner.

```json
{
  "success": true,
  "tracking": {
    "orderId": "order-id",
    "currentStatus": "OUT_FOR_DELIVERY",
    "paymentStatus": "paid",
    "totalAmount": 450,
    "history": [
      {
        "status": "PLACED",
        "description": "Order placed",
        "createdAt": "2026-09-11T10:05:00.000Z"
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "description": "Your delivery is on the way",
        "createdAt": "2026-09-11T10:45:00.000Z"
      }
    ]
  }
}
```

History is chronological and durable. Unauthorized requests do not reveal order existence.

## Administrator Contracts

### `PUT /orders/admin/:id/status`

Preserves the existing admin route while delegating to the centralized transition operation.

```json
{
  "status": "OUT_FOR_DELIVERY",
  "description": "Your delivery is on the way"
}
```

The server validates the transition, updates order state, writes one history item, creates
notification delivery intents under policy, and returns after durable order work commits.
External delivery outcomes never turn an accepted order update into a failure.

### `POST /admin/notifications/send`

Requires server-derived administrator authorization.

```json
{
  "audience": {
    "type": "CUSTOMER_TYPE",
    "customerType": "DISTRIBUTOR"
  },
  "classification": "MARKETING",
  "channels": ["PUSH", "SMS"],
  "title": "Delivery update",
  "message": "Service update for Vasai customers."
}
```

Audience types are `ALL_CUSTOMERS`, `CUSTOMER_TYPE`, `SELECTED_CUSTOMERS`, and
`ACTIVE_ORDERS`. The backend validates selected customers and applies marketing preferences.

### `GET /admin/notifications?page=1&limit=20`

Returns bounded administrator notification-batch history: audience, chosen channels,
aggregate delivery outcomes, creation time, and safe failure summaries only.

## Event and Deep-Link Contract

- Each order event has an idempotency key and creates at most one customer-visible history
  notification per recipient/event.
- Push payloads contain notification ID, type, and optional order ID only. The app re-fetches
  authorized data before rendering it.
- Taps open tracking only after ownership checks. Missing/deleted/inaccessible orders fall
  back to customer order history.
- Delivery state is `PENDING`, `PROCESSING`, `SENT`, or `FAILED`; only `readAt` indicates
  that a customer has opened a notification.
