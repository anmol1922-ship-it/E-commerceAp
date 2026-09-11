# Quickstart: Validate Mobile OTP, Notifications & Order Tracking

## Purpose

Use this guide in a non-production environment to validate [spec.md](spec.md),
[data-model.md](data-model.md), and [contracts/http-api.md](contracts/http-api.md).
Never use production customer numbers, payment credentials, Firebase credentials, or SMS
templates in development or automated tests.

## Prerequisites

1. Non-production PostgreSQL configured through `DATABASE_URL` and `DIRECT_URL`.
2. Existing backend/frontend dependencies installed from their package manifests.
3. Non-production JWT secret and Razorpay test credentials when payment regression is run.
4. `SMS_PROVIDER=mock` or an approved non-production provider. Tests inject fake delivery;
   they do not return or log OTP values.
5. For Android push validation, a non-production Firebase project matching application ID
   `com.bisleri.vasai`, a locally installed `google-services.json`, and a test device. Do
   not commit the Firebase configuration file.

## Required Backend Environment Contract

Add placeholders only to the environment example. Supply actual values through local secret
storage or deployment secrets.

```text
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_EXPIRE=7d

OTP_LENGTH=6
OTP_TTL_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=30
OTP_SEND_WINDOW_MINUTES=15
OTP_SEND_MAX_REQUESTS=3
OTP_VERIFY_WINDOW_MINUTES=15
OTP_VERIFY_MAX_REQUESTS=15

SMS_PROVIDER=mock
SMS_API_KEY=
SMS_SENDER_ID=
SMS_TEMPLATE_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NOTIFICATION_WORKER_POLL_MS=1000
NOTIFICATION_MAX_ATTEMPTS=3
```

Before production rollout, verify sensitive local environment files are not tracked and
rotate credentials that have been exposed outside approved secret management.

## Build and Test Commands

Install, generate, build, and test the backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run build
npm test
```

Validate schema and deploy an approved non-production migration:

```bash
cd backend
npx prisma validate
npm run migrate:deploy
```

For local migration authoring only:

```bash
cd backend
npm run prisma:migrate
```

Build and lint the frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
```

Start the existing services in separate terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

After implementation adds the notification delivery worker, start it through its documented
non-production command and confirm it uses only mock/test targets.

## Data Migration Validation

1. Back up non-production data before migration.
2. Run the phone audit before uniqueness enforcement.
3. Confirm valid unique existing numbers become canonical `+91` identities.
4. Confirm duplicate, blank, and invalid legacy values remain unchanged and are reported for
   support review; no synthetic numbers are assigned.
5. Confirm User IDs keep the same Orders, Addresses, Cart, CustomerType, ProductPrice, and
   historical price relationships.
6. Confirm existing orders receive one truthful mapped-status history entry, not invented
   milestones.

## Authentication Scenarios

1. **Existing customer**: Submit a valid existing phone, use a fake-provider test OTP,
   verify it, and confirm customer type, orders, addresses, cart, and server-resolved pricing
   are retained.
2. **New customer**: Submit an unused valid phone, verify it, complete name/address/pincode,
   and confirm one End User customer and one address. Repeat the phone flow and confirm no
   duplicate customer exists.
3. **Invalid phone**: Test short, alphabetic, international, and invalid Indian prefixes.
   Confirm no challenge or delivery is created.
4. **OTP security**: Test invalid OTP, expiration, five failed attempts, replacement
   invalidation, resend cooldown, phone rate limit, and IP abuse limit. Confirm test logs and
   persistence contain no plaintext OTP.
5. **Session/logout/deletion**: Confirm `/auth/me` is server-derived, logout revokes only
   the active session/device, and deleted/inactive accounts fail protected requests.
6. **Admin compatibility**: Confirm customer OTP flow never grants admin role and protected
   administrator credentials/session continue working during migration.

## Order, Tracking, and Pricing Regression

1. Sign in as an End User and Distributor. Confirm listing, details, cart, checkout, order
   snapshots, Razorpay amount, and totals use server-resolved price.
2. Place an order and confirm exactly one `PLACED` history item.
3. As an administrator, move it through `CONFIRMED`, `PROCESSING`, `OUT_FOR_DELIVERY`, and
   `DELIVERED`. Confirm exactly one chronological history item per accepted transition.
4. Repeat/skip transitions and confirm no contradictory history or duplicate event is created.
5. Cancel only from an allowed state and confirm correct timeline and notification policy.
6. Try another customer's order/detail/tracking identifiers and confirm no protected data
   is returned.

## SMS and Push Scenarios

1. With mock SMS, verify OTP, Out for Delivery, and Cancellation delivery intents and channel
   classification without sending external messages.
2. Simulate SMS failure for Out for Delivery/Cancellation. Confirm order and history succeed
   while only delivery is `FAILED`.
3. Register two device tokens for one user, refresh one, unregister one, and confirm the
   other remains active with no duplicates.
4. On Android, test notification permission grant/deny, foreground receipt, background
   receipt, and notification-tap navigation with non-production Firebase messages.
5. Send Out for Delivery and confirm one visible history notification, one Push attempt per
   active device, and configured SMS attempt.
6. Simulate an invalid Firebase token. Confirm token deactivation while order and history
   remain correct.
7. Alter an order deep-link payload and confirm the app rechecks ownership and falls back
   safely.

## Notification Center and Preferences

1. Create at least 25 test notifications. Confirm newest-first stable pagination, timestamps,
   empty/loading/error states, unread count, mark-one-read, and mark-all-read.
2. Attempt notification list/read/count operations as another customer. Confirm denial without
   data disclosure.
3. Disable marketing Push/SMS and send an admin marketing batch. Confirm exclusion.
4. Trigger required transactional events and confirm marketing preferences cannot suppress
   the required policy.
5. As administrator, send Push/SMS batches to all customers, End Users, Distributors,
   selected customers, and active-order customers. Confirm audience selection and aggregate
   delivery history.

## Android Validation

After implementation and web build:

```bash
cd frontend
npx cap sync android
cd android
./gradlew assembleDebug
```

Install the debug build on a test device, complete OTP sign-in, register token, verify
permission/deep link behavior, then repeat checkout and order-tracking regression tests.

## Release Checklist

- Non-production migration review and restore test complete.
- Backend build, tests, and Prisma validation pass.
- Frontend build and focused lint/test checks pass.
- Contract tests cover OTP limits, authorization, status idempotency, and provider failures.
- Android debug validation covers permission, token lifecycle, and deep links.
- SMS templates/sender identity and Firebase credentials are configured outside source control.
- Production rollout has migration recovery and delivery-failure monitoring procedures.
