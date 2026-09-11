---
description: "Task breakdown for Bisleri Vasai Store mobile OTP, notifications, and order tracking"
---

# Tasks: Mobile OTP Authentication, Notifications & Order Tracking

**Input**: Design documents from `specs/001-mobile-otp-notifications-tracking/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/http-api.md`, and `quickstart.md`

**Implementation rule**: Complete tasks in dependency order. Do not modify unrelated
commerce behavior. Every task below includes its purpose, dependencies, affected paths,
data/API/frontend/backend impact, acceptance criteria, and testing expectation.

## Phase 1: Setup and Repository Inspection

**Purpose**: Establish the current-system baseline before any schema, authentication, or
notification change.

- [ ] T001 [P] Inspect the existing authentication, User schema, JWT middleware, Login/Register pages, auth Redux state, account deletion, and local-storage keys; Purpose: document compatibility constraints; Deps: none; Files: `backend/src/controllers/authController.ts`, `backend/src/middleware/auth.ts`, `backend/prisma/schema.prisma`, `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx`, `frontend/src/store/slices/authSlice.ts`, `frontend/src/pages/DeleteAccount.tsx`; DB: read-only audit; API: record current auth routes; Frontend: record current auth routes/state; Backend: record current session/role behavior; Accept: baseline lists legacy email/password, phone, role, JWT, and deletion behavior; Test: attach a repeatable manual/API baseline to the task notes.
- [ ] T002 [P] Inspect existing order, cart, address, ProductPrice, Razorpay, admin status, and customer-type flows; Purpose: protect pricing and checkout contracts; Deps: none; Files: `backend/src/controllers/orderController.ts`, `backend/src/controllers/cartController.ts`, `backend/src/controllers/productController.ts`, `backend/src/controllers/adminController.ts`, `backend/prisma/schema.prisma`, `frontend/src/pages/Checkout.tsx`, `frontend/src/pages/Cart.tsx`, `frontend/src/pages/admin/AdminOrders.tsx`; DB: identify snapshots and relations; API: record order/payment/admin contracts; Frontend: record customer/admin consumers; Backend: record server price/total/status logic; Accept: current End User/Distributor pricing and Razorpay paths are explicitly mapped; Test: run existing backend/frontend build smoke checks.
- [ ] T003 [P] Audit Capacitor/Android/Firebase readiness, package manifests, environment examples, and secret exposure; Purpose: identify mobile/provider prerequisites before implementation; Deps: none; Files: `frontend/capacitor.config.ts`, `frontend/android/app/build.gradle`, `frontend/android/app/src/main/AndroidManifest.xml`, `frontend/package.json`, `backend/package.json`, `backend/.env.example`, `frontend/.env.example`; DB: none; API: identify provider configuration gaps; Frontend: identify native push integration gaps; Backend: identify missing SMS/FCM dependencies/config; Accept: application ID, existing Google services hook, missing runtime push integration, and secret hygiene gaps are documented; Test: confirm no real credentials are added to source.

---

## Phase 2: Foundational Database, Security, and Provider Boundaries

**Purpose**: Complete blocking shared foundations before user-story implementation.

- [ ] T004 [P] Add canonical Indian phone normalization and validation utility; Purpose: guarantee one identity format across registration, OTP, lookup, and migration; Deps: T001; Files: `backend/src/utils/phone.ts`, `backend/test/phoneNormalization.test.js`; DB: define `+91` canonical format and collision behavior; API: expose shared validation behavior; Frontend: document accepted display formats; Backend: implement stripping, country-prefix handling, 6-9 prefix validation, and rejection rules; Accept: valid local/+91 formats normalize identically and invalid inputs are rejected without inventing values; Test: cover valid, duplicate-format, invalid-prefix, missing, and international cases.
- [ ] T005 [P] Create a phone-data audit/report script before uniqueness enforcement; Purpose: identify valid, duplicate, blank, and invalid legacy records without mutating production data; Deps: T004; Files: `backend/scripts/audit-phone-data.ts`, `backend/README.md`; DB: read-only grouped audit of `User.phone`; API: none; Frontend: none; Backend: report remediation candidates and counts; Accept: script produces deterministic JSON/text output and never assigns synthetic numbers; Test: run against fixture users containing duplicate and malformed phones.
- [ ] T006 [P] Add additive Prisma entities and User/Order relations from the approved data model; Purpose: establish OTP, session, device, notification, preference, delivery, batch, and status-history contracts; Deps: T004; Files: `backend/prisma/schema.prisma`; DB: add nullable normalized phone/verification fields, optional email/password compatibility, `isActive`, `OTPVerification`, `AuthSession`, `UserDevice`, `NotificationPreference`, `NotificationBatch`, `Notification`, `NotificationDelivery`, `OrderStatusHistory`; API: generated types support new contracts; Frontend: no direct impact; Backend: generated Prisma relations become available; Accept: schema validates without dropping existing fields or relations; Test: run `npx prisma validate` and generated-client typecheck.
- [ ] T007 Implement the safe Prisma migration and data backfill sequence; Purpose: preserve production users/orders while enabling canonical phone identity and truthful order history; Deps: T005, T006; Files: `backend/prisma/migrations/<timestamp>_otp_notifications_tracking/migration.sql`; DB: audit-first nullable backfill, valid normalized-phone uniqueness, default preferences, legacy status mapping, one truthful history row per existing order, no synthetic phones; API: no breaking endpoint change during migration; Frontend: preserve existing sessions/data; Backend: support both legacy and new records during rollout; Accept: migration is additive, collision-safe, reversible/recoverable, and retains CustomerType/ProductPrice/order snapshots; Test: apply to a backup fixture, verify duplicate/invalid rows are reported and existing relations remain.
- [ ] T008 [P] Add shared auth, OTP, notification, and order-status constants/policy maps; Purpose: prevent scattered strings and contradictory event behavior; Deps: T006; Files: `backend/src/constants/auth.ts`, `backend/src/constants/notification.ts`, `backend/src/constants/orderStatus.ts`; DB: align values with enums/string columns; API: standardize event/status names; Frontend: consume stable response/status values later; Backend: centralize lifecycle, channel, classification, retry, and preference rules; Accept: all required status/type/channel values are represented once; Test: unit-test legal status transitions and event-to-channel matrix.
- [ ] T009 [P] Extend backend configuration and environment examples for OTP, SMS, Firebase, worker, and rate limits; Purpose: keep secrets server-side and configurable; Deps: T008; Files: `backend/src/config/index.ts`, `backend/.env.example`; DB: none; API: configuration errors are safe; Frontend: no provider secrets; Backend: parse defaults and validate production-required values; Accept: placeholders only, no real credentials, and startup does not log secrets; Test: config tests cover mock development and missing production values.
- [ ] T010 Add rate-limit, validation, and safe error helpers for OTP/provider boundaries; Purpose: enforce abuse limits and consistent customer-safe errors; Deps: T004, T008, T009; Files: `backend/src/middleware/validators.ts`, `backend/src/middleware/rateLimits.ts`, `backend/src/middleware/errorHandler.ts`; DB: none; API: 400/401/403/404/429/503 behavior is consistent; Frontend: receives actionable safe messages; Backend: enforce phone/challenge/IP limits without leaking account existence; Accept: rate limits are configurable and provider/internal details are redacted; Test: middleware tests cover limit windows and sanitized errors.
- [ ] T011 [P] Define provider interfaces and mock adapters for SMS and push delivery; Purpose: make all external delivery testable and replaceable; Deps: T008, T009; Files: `backend/src/services/smsService.ts`, `backend/src/services/pushService.ts`, `backend/src/services/providers/mockSmsProvider.ts`, `backend/src/services/providers/mockPushProvider.ts`; DB: delivery outcomes use shared statuses; API: provider failure maps to safe outcomes; Frontend: no direct provider calls; Backend: expose send contracts without credentials in callers; Accept: mock adapters can simulate sent, failed, invalid-token, and transient outcomes; Test: deterministic unit tests never send real messages.
- [ ] T012 [P] Add notification worker claim/lease skeleton and process entrypoint; Purpose: establish post-commit durable delivery without a new queue infrastructure; Deps: T006, T008, T011; Files: `backend/src/workers/notificationWorker.ts`, `backend/src/services/notificationDeliveryService.ts`, `backend/package.json`; DB: claim pending deliveries with lease/retry fields; API: none; Frontend: none; Backend: worker can safely claim, process, and release/mark delivery records; Accept: one delivery cannot be claimed concurrently and provider failure does not throw into order mutation; Test: worker tests cover retry, lease expiry, and idempotent completion.
- [ ] T013 Register new route modules and worker-safe startup wiring without changing existing route behavior; Purpose: make new endpoints discoverable while preserving current middleware order; Deps: T006, T010, T012; Files: `backend/src/index.ts`, `backend/src/routes/auth.ts`, `backend/src/routes/orders.ts`, new `backend/src/routes/notifications.ts`, new `backend/src/routes/adminNotifications.ts`; DB: none; API: routes are mounted under `/api`; Frontend: no immediate impact; Backend: authentication/admin middleware remains explicit; Accept: existing health/products/cart/orders/admin routes still mount and new route modules are isolated; Test: route smoke test verifies protected/unprotected boundaries.

---

## Phase 3: User Story 1 - Unified Mobile OTP Authentication (Priority: P1, MVP)

**Goal**: Let an existing customer authenticate with a normalized phone OTP while
preserving server-derived role/customer type and legacy protected admin access.

**Independent Test**: A valid existing customer completes phone -> OTP and reaches home;
invalid/expired/over-attempt OTPs fail safely; no OTP or credential appears in logs,
responses, or persistence.

- [ ] T014 [P] [US1] Write OTP service and HTTP contract tests before implementation; Purpose: lock security and response behavior; Deps: T004, T006, T010; Files: `backend/test/otpService.test.js`, `backend/test/authOtp.contract.test.js`; DB: use isolated OTP/session fixtures; API: assert `/auth/send-otp` and `/auth/verify-otp`; Frontend: none; Backend: assert hashing, expiry, attempts, invalidation, throttling, account enumeration resistance; Accept: tests cover valid, invalid, expired, replaced, exhausted, and rate-limited challenges; Test: tests initially fail until service/endpoints are implemented.
- [ ] T015 [US1] Implement OTP generation, hashing, storage, invalidation, and verification service; Purpose: provide the single secure challenge lifecycle; Deps: T004, T006, T008, T010, T011; Files: `backend/src/services/otpService.ts`, `backend/src/models/OtpVerification.ts`; DB: create/read/update challenge records atomically; API: return only safe challenge outcomes; Frontend: none; Backend: use bcrypt hash comparison and configurable limits; Accept: no plaintext OTP leaves the service, replacement invalidates old challenges, and successful verification is single-use; Test: satisfy T014 unit cases.
- [ ] T016 [US1] Add send-OTP validator/controller/route using the SMS abstraction; Purpose: start the unified auth flow without revealing account existence; Deps: T015, T011, T010; Files: `backend/src/controllers/authController.ts`, `backend/src/routes/auth.ts`, `backend/src/middleware/validators.ts`; DB: persist challenge and sanitized delivery state; API: implement `POST /api/auth/send-otp`; Frontend: receive cooldown/message contract; Backend: normalize phone, apply limits, generate/hash OTP, invoke SMS adapter; Accept: valid requests return safe success without OTP, invalid/rate-limited/provider failures return safe errors; Test: run send-OTP contract/provider-failure tests.
- [ ] T017 [US1] Add verify-OTP session/enrollment decision and route; Purpose: authenticate existing customers or issue profile-completion authorization for new phones; Deps: T015, T016, T006; Files: `backend/src/controllers/authController.ts`, `backend/src/services/sessionService.ts`, `backend/src/middleware/auth.ts`, `backend/src/routes/auth.ts`; DB: consume challenge, create `AuthSession` for existing users, record verified phone; API: implement `POST /api/auth/verify-otp`; Frontend: receive `AUTHENTICATED` or `COMPLETE_PROFILE`; Backend: reload role/customer type from DB and never trust client type; Accept: existing phone returns normal session, unknown phone returns scoped enrollment token, and invalid challenges never authenticate; Test: run existing/new/duplicate/attempt-limit contract tests.
- [ ] T018 [US1] Preserve and update `/auth/me`, logout, legacy session compatibility, and account deletion for the new session model; Purpose: keep protected commerce/admin APIs and deletion behavior working during cutover; Deps: T017, T006; Files: `backend/src/middleware/auth.ts`, `backend/src/controllers/authController.ts`, `backend/src/routes/auth.ts`; DB: revoke `AuthSession` and deactivate owned devices on deletion/logout; API: implement/retain `GET /auth/me`, `POST /auth/logout`, `DELETE /auth/delete-account`; Frontend: existing token refresh/logout remains compatible; Backend: accept legacy tokens only during documented migration window; Accept: old sessions continue until expiry, new sessions can be revoked, and deletion denies future protected access; Test: session, logout, deletion, and admin-auth regression tests.
- [ ] T019 [P] [US1] Add frontend OTP/auth state and API thunks; Purpose: represent phone, challenge, cooldown, enrollment, authenticated, and error states; Deps: T016, T017; Files: `frontend/src/store/slices/authSlice.ts`, new `frontend/src/store/slices/otpSlice.ts`, `frontend/src/api/axios.ts`; DB: none; API: consume send/verify/me/logout contracts; Frontend: store canonical user/customer type without OTP; Backend: none; Accept: duplicate submits are prevented, loading/errors are reset correctly, and no OTP is persisted; Test: reducer/thunk tests cover each state transition.
- [ ] T020 [US1] Build accessible mobile-number authentication screen; Purpose: replace separate customer Login/Register entry with one mobile-first flow; Deps: T019; Files: new `frontend/src/pages/PhoneAuth.tsx`, new `frontend/src/components/PhoneInput.tsx`; DB: none; API: call send OTP; Frontend: +91 display, Indian validation, loading, errors, and navigation to verification; Backend: none; Accept: valid phone reaches OTP screen, invalid phone stays local, and admin login remains reachable through its protected path; Test: component tests cover keyboard, labels, touch targets, and duplicate-submit prevention.
- [ ] T021 [US1] Build OTP verification input with paste, focus, resend cooldown, and change-number behavior; Purpose: complete the secure mobile auth UX; Deps: T019, T020; Files: new `frontend/src/components/OtpInput.tsx`, new `frontend/src/pages/VerifyOtp.tsx`; DB: none; API: call verify/resend contracts; Frontend: six accessible fields, paste handling, countdown, errors, loading, and safe navigation; Backend: none; Accept: six-digit paste/focus works, resend is disabled until cooldown, and invalid OTP feedback is clear; Test: component tests cover expiry, resend, paste, keyboard, and screen-reader labels.
- [ ] T022 [US1] Update customer routing/protected-route behavior to use the unified auth entry point; Purpose: remove customer-facing Login/Register split without breaking admin navigation; Deps: T018, T020, T021; Files: `frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/components/Navbar.tsx`, `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx`; DB: none; API: preserve admin/session routes; Frontend: redirect unauthenticated customers to phone auth and authenticated users to requested destination; Backend: none; Accept: `/checkout` and `/profile` remain protected, customer register/login screens are not separate entry points, and admin access remains usable; Test: route integration tests cover redirect and role boundaries.
- [ ] T023 [US1] Run end-to-end existing-customer OTP acceptance tests; Purpose: prove MVP authentication is independently deployable; Deps: T014-T022; Files: `backend/test/authOtp.integration.test.js`, `frontend/src/__tests__/auth-flow.test.tsx`; DB: isolated test database; API: exercise send/verify/me/logout; Frontend: exercise phone/OTP route flow; Backend: verify server authority/security; Accept: all US1 scenarios and quickstart authentication security checks pass; Test: run focused backend/frontend tests with mock SMS.

---

## Phase 4: User Story 2 - New Customer Profile Completion (Priority: P1)

**Goal**: Create one complete End User account and delivery address after a new phone
completes OTP verification.

**Independent Test**: A new phone verifies, completes name/address/pincode, reaches home,
and can later authenticate with the same phone without duplication.

- [ ] T024 [P] [US2] Write profile-completion and duplicate-prevention contract tests; Purpose: define enrollment-token ownership and atomic creation behavior; Deps: T017, T006; Files: `backend/test/profileCompletion.contract.test.js`, `backend/test/profileCompletion.integration.test.js`; DB: fixture for new/duplicate/abandoned enrollment; API: assert `POST /auth/complete-profile`; Frontend: none; Backend: assert token scope, required fields, default End User, serviceable pincode, and atomicity; Accept: tests cover valid completion, invalid fields, expired token, collision, retry, and no incomplete account; Test: tests fail before implementation.
- [ ] T025 [US2] Implement profile-completion service/controller/validation; Purpose: atomically create User, Address, default customer type, preferences, and session; Deps: T017, T024, T006; Files: `backend/src/services/profileService.ts`, `backend/src/controllers/authController.ts`, `backend/src/middleware/validators.ts`, `backend/src/routes/auth.ts`; DB: create related records transactionally and enforce normalized phone/email uniqueness; API: implement `POST /api/auth/complete-profile`; Frontend: consume authenticated response; Backend: verify enrollment token and serviceable pincode; Accept: valid profile creates exactly one End User and address, invalid/colliding input creates no partial data; Test: satisfy T024.
- [ ] T026 [US2] Build new-customer profile-completion UI; Purpose: collect minimum delivery-ready information after OTP; Deps: T019, T021, T025; Files: new `frontend/src/pages/CompleteProfile.tsx`, new `frontend/src/components/AddressForm.tsx`; DB: none; API: call complete-profile; Frontend: require name/street/area/pincode, keep email optional, show loading/errors; Backend: none; Accept: enrollment cannot reach home without required fields and successful completion stores server user/session; Test: component and route tests cover retry, validation, and mobile layout.
- [ ] T027 [US2] Integrate profile completion into auth routing and session persistence; Purpose: route new OTP users to profile and existing users to home; Deps: T025, T026; Files: `frontend/src/App.tsx`, `frontend/src/store/slices/authSlice.ts`, `frontend/src/store/slices/otpSlice.ts`, `frontend/src/components/ProtectedRoute.tsx`; DB: none; API: handle `nextStep` contract; Frontend: persist only safe session/user data, not enrollment secrets beyond required flow state; Backend: none; Accept: refresh/retry behavior is safe and completed users cannot repeat enrollment; Test: run existing/new customer flow tests.
- [ ] T028 [US2] Validate new-user migration compatibility and End User pricing regression; Purpose: prove profile creation integrates with commerce and pricing; Deps: T025-T027, T007; Files: `backend/test/profileCommerce.integration.test.js`, `backend/test/pricingService.test.js`; DB: verify relations/customer type; API: verify products/cart/checkout access; Frontend: verify new user reaches products; Backend: verify server resolves End User price; Accept: new user can browse/cart without client-selected customer type and existing users remain unchanged; Test: run integration regression.

---

## Phase 5: User Story 3 - Order Status History and Customer Tracking (Priority: P1)

**Goal**: Make order status authoritative, auditable, idempotent, and visible as an
owned customer timeline.

**Independent Test**: Admin transitions one order through the canonical lifecycle; the
customer sees one ordered history item per accepted transition and cannot see another
customer's order.

- [ ] T029 [P] [US3] Write status-transition and tracking contract tests; Purpose: lock allowed transitions, idempotency, ownership, legacy mapping, and response shape; Deps: T006, T008; Files: `backend/test/orderStatusService.test.js`, `backend/test/orderTracking.contract.test.js`; DB: fixture orders/status history; API: assert admin status and customer tracking contracts; Frontend: none; Backend: assert invalid/repeated/racing transitions are safe; Accept: tests cover full lifecycle, cancellation, legacy dispatched mapping, and unauthorized access; Test: tests initially fail before service/route implementation.
- [ ] T030 [US3] Implement canonical order-status constants and transition service; Purpose: centralize validation and prevent controllers from mutating status directly; Deps: T008, T029; Files: `backend/src/constants/orderStatus.ts`, `backend/src/services/orderStatusService.ts`; DB: define transition/event keys and status timestamp updates; API: expose domain result to controllers; Frontend: receives canonical status values; Backend: validate state, actor, idempotency, and cancellation; Accept: one accepted transition produces one domain result and invalid/repeated transitions are no-ops/errors without history; Test: satisfy T029 unit cases.
- [ ] T031 [US3] Replace direct admin order mutation with centralized status operation; Purpose: ensure every admin status change creates history and notification intents; Deps: T030, T006; Files: `backend/src/controllers/orderController.ts`, `backend/src/routes/orders.ts`; DB: transactionally update Order and insert OrderStatusHistory; API: preserve `PUT /api/orders/admin/:id/status` with canonical statuses and safe errors; Frontend: existing admin update remains callable; Backend: pass actor/description/event key to service; Accept: order update cannot bypass history; Test: admin status integration tests.
- [ ] T032 [US3] Add customer tracking endpoint and timeline serializer; Purpose: expose current status/history/details only to the order owner; Deps: T030, T031; Files: `backend/src/controllers/orderTrackingController.ts`, `backend/src/routes/orders.ts`; DB: read Order + ordered history; API: implement `GET /api/orders/:id/tracking`; Frontend: receive stable timeline payload; Backend: enforce user ownership; Accept: response includes status, timestamps, payment/total/delivery details, and no cross-user leakage; Test: contract/authorization tests.
- [ ] T033 [US3] Build customer order tracking page and timeline component; Purpose: make status history visible in a mobile-first, accessible UI; Deps: T032; Files: new `frontend/src/pages/OrderTracking.tsx`, new `frontend/src/components/OrderTimeline.tsx`, `frontend/src/App.tsx`; DB: none; API: consume tracking endpoint; Frontend: show current state, ordered timestamps, address, payment, total, loading/empty/error states; Backend: none; Accept: timeline matches server ordering and unauthorized/absent order has safe fallback; Test: component/route tests.
- [ ] T034 [US3] Update admin order status controls for canonical lifecycle and safe confirmation; Purpose: let admins use the centralized transition contract without exposing implementation details; Deps: T031; Files: `frontend/src/pages/admin/AdminOrders.tsx`; DB: none; API: send canonical status/description; Frontend: show valid status options, current status, and update feedback; Backend: no direct notification call from UI; Accept: admin status change reflects server response and invalid transition is shown safely; Test: admin UI integration test.
- [ ] T035 [US3] Run end-to-end tracking and status regression suite; Purpose: prove US3 independently and protect existing order/payment/pricing behavior; Deps: T029-T034; Files: `backend/test/orderTracking.integration.test.js`, `frontend/src/__tests__/order-tracking.test.tsx`; DB: migration fixture and current orders; API: exercise customer/admin paths; Frontend: exercise timeline/deep-link route; Backend: verify order price snapshots/payment fields unchanged; Accept: all US3 scenarios and quickstart tracking regression pass; Test: run focused suite.

---

## Phase 6: User Story 4 - SMS, FCM, Device Management, and Notification History (Priority: P1)

**Goal**: Deliver durable, observable notification events through SMS and push without
making provider availability part of order correctness.

**Independent Test**: A customer registers multiple devices, an order event creates one
history notification and channel deliveries, provider failure is recorded, and the order
remains successful.

- [ ] T036 [P] [US4] Add production SMS adapter behind the provider-neutral interface; Purpose: support OTP/Out for Delivery/Cancellation without vendor coupling; Deps: T011, T009; Files: `backend/src/services/providers/smsProvider.ts`, `backend/src/services/smsService.ts`, `backend/src/config/index.ts`, `backend/.env.example`; DB: record sanitized provider/delivery outcome; API: no provider details exposed; Frontend: none; Backend: load provider credentials only server-side and support mock/production selection; Accept: approved provider adapter handles templates/errors without logging secrets; Test: mock/provider contract tests.
- [ ] T037 [P] [US4] Add Firebase Admin push adapter and configuration validation; Purpose: send server-authorized push messages to registered devices; Deps: T011, T009, T003; Files: `backend/src/services/providers/firebasePushProvider.ts`, `backend/src/config/firebase.ts`, `backend/src/config/index.ts`, `backend/.env.example`; DB: delivery status stores sanitized provider result; API: no credentials leave backend; Frontend: none; Backend: initialize only with complete secure config and deactivate invalid tokens; Accept: mock/test mode works without Firebase credentials and production mode rejects incomplete config safely; Test: provider unit tests.
- [ ] T038 [US4] Implement device registration, refresh, and unregistration service/controller/routes; Purpose: support multiple customer devices with ownership isolation; Deps: T006, T037; Files: `backend/src/services/deviceService.ts`, `backend/src/controllers/deviceController.ts`, `backend/src/routes/notifications.ts`; DB: upsert `UserDevice` by token and user, deactivate one token; API: implement register/unregister contracts; Frontend: receive token lifecycle response; Backend: derive user from auth and reject arbitrary user IDs; Accept: two devices remain active, refresh creates no duplicate, logout removes only current token; Test: device ownership/multi-device contract tests.
- [ ] T039 [US4] Integrate Capacitor push permission, token, foreground/background, refresh, and tap handling; Purpose: connect Android notifications to the authenticated customer; Deps: T038, T003; Files: `frontend/package.json`, `frontend/capacitor.config.ts`, `frontend/src/services/pushNotificationService.ts`, `frontend/src/hooks/useDeviceToken.ts`, `frontend/android/app/src/main/AndroidManifest.xml`, `frontend/android/app/build.gradle`; DB: none; API: call device registration/unregistration; Frontend: handle permission states, token refresh, visible foreground alerts, background tap deep links; Backend: none; Accept: app ID remains `com.bisleri.vasai`, no server credentials are bundled, and denied permission remains a usable app state; Test: Android debug/manual push validation.
- [ ] T040 [US4] Implement notification policy, creation, idempotency, and delivery orchestration; Purpose: create one customer history event and channel deliveries from domain events; Deps: T008, T012, T036, T037, T038; Files: `backend/src/services/notificationService.ts`, `backend/src/constants/notification.ts`, `backend/src/services/notificationDeliveryService.ts`; DB: create Notification/NotificationDelivery/Batch records with event keys; API: internal service contract only; Frontend: consume durable history later; Backend: classify transactional/marketing channels, apply preferences, create per-device deliveries; Accept: one event creates one history item and correct Push/SMS targets; Test: policy/idempotency/provider-failure tests.
- [ ] T041 [US4] Complete notification worker processing, retry, invalid-token cleanup, and observability; Purpose: deliver post-commit intents reliably without blocking orders; Deps: T012, T036, T037, T040; Files: `backend/src/workers/notificationWorker.ts`, `backend/src/services/notificationDeliveryService.ts`, `backend/src/utils/logger.ts`, `backend/package.json`; DB: claim/lease/retry and mark sent/failed; API: none; Frontend: none; Backend: bounded retry and sanitized structured outcomes; Accept: worker restart/duplicate claim/provider failure preserve order and history correctness; Test: worker integration tests.
- [ ] T042 [US4] Integrate order placement/payment/status events with notification creation; Purpose: cover approved event matrix without duplicating controller conditions; Deps: T031, T040, T041; Files: `backend/src/services/orderEventService.ts`, `backend/src/controllers/orderController.ts`, `backend/src/services/orderStatusService.ts`; DB: create notification intents after durable domain changes; API: existing order responses remain stable; Frontend: receives normal order results; Backend: map order placed/payment success/status events to policy; Accept: Out for Delivery/Cancellation attempt SMS and configured events attempt Push; Test: order-event integration tests.
- [ ] T043 [US4] Implement customer notification list, unread count, mark-read, mark-all-read, and ownership checks; Purpose: provide durable notification history API; Deps: T040, T006; Files: `backend/src/controllers/notificationController.ts`, `backend/src/routes/notifications.ts`; DB: query bounded pages and update `readAt`; API: implement notification history contracts; Frontend: receive newest-first/read state/deep-link data; Backend: scope every query/mutation by authenticated user; Accept: unread count/read operations are idempotent and cross-user access reveals nothing; Test: notification contract/authorization tests.
- [ ] T044 [US4] Build notification center, bell/unread count, and deep-link customer UI; Purpose: expose notification history and safe navigation; Deps: T039, T043, T033; Files: `frontend/src/store/slices/notificationSlice.ts`, `frontend/src/components/NotificationBell.tsx`, `frontend/src/components/NotificationCenter.tsx`, `frontend/src/pages/Notifications.tsx`, `frontend/src/App.tsx`; DB: none; API: consume list/count/read contracts; Frontend: newest-first pagination, empty/loading/error/read states, authorized order links; Backend: none; Accept: notification tap re-fetches ownership-checked target and falls back to orders safely; Test: component/deep-link tests.
- [ ] T045 [US4] Run SMS, FCM, device, notification-history, and failure-isolation integration suite; Purpose: prove US4 independently; Deps: T036-T044; Files: `backend/test/notificationService.test.js`, `backend/test/deviceNotifications.integration.test.js`, `frontend/src/__tests__/notifications.test.tsx`; DB: isolated outbox/device/history fixtures; API: exercise registration, delivery, list/read, event flows; Frontend: exercise foreground/background/tap state via mocks; Backend: prove order update survives provider failures; Accept: all US4 scenarios and quickstart provider checks pass; Test: run focused unit/integration/contract tests.

---

## Phase 7: User Story 5 - Notification Preferences (Priority: P2)

**Goal**: Let customers control marketing channels without disabling required transactional
communication.

**Independent Test**: Change marketing preferences, send marketing and transactional
messages, and verify only permitted categories change.

- [ ] T046 [P] [US5] Add notification preference service, validators, and customer endpoints; Purpose: persist/read preference boundaries; Deps: T006, T008; Files: `backend/src/services/notificationPreferenceService.ts`, `backend/src/controllers/notificationController.ts`, `backend/src/middleware/validators.ts`, `backend/src/routes/notifications.ts`; DB: upsert `NotificationPreference` with safe defaults; API: implement GET/PUT preferences; Frontend: consume preference contract; Backend: enforce ownership and transactional-policy protection; Accept: marketing defaults off and required channels remain policy-controlled; Test: preference contract tests.
- [ ] T047 [US5] Build mobile notification settings page and route; Purpose: provide understandable transactional/marketing controls; Deps: T046; Files: `frontend/src/pages/NotificationSettings.tsx`, `frontend/src/App.tsx`, `frontend/src/store/slices/notificationSlice.ts`; DB: none; API: read/update preferences; Frontend: accessible toggles, loading/error/saved states, explanatory labels; Backend: none; Accept: setting changes persist across refresh and cannot suppress required status communication; Test: component/route tests.
- [ ] T048 [US5] Integrate preference filtering into notification policy and run preference tests; Purpose: ensure all send paths apply one consistent rule; Deps: T040, T046, T047; Files: `backend/src/services/notificationService.ts`, `backend/test/notificationPreferences.test.js`, `frontend/src/__tests__/notification-preferences.test.tsx`; DB: verify preferences per user; API: no new public endpoint beyond T046; Frontend: verify settings behavior; Backend: distinguish transactional/marketing consistently; Accept: marketing Push/SMS opt-out excludes recipients while required flows remain active; Test: run focused suite.

---

## Phase 8: User Story 6 - Admin Notification Management (Priority: P2)

**Goal**: Give authorized administrators auditable status and broadcast controls while
keeping all delivery decisions server-owned.

**Independent Test**: Admin updates status or sends a scoped message; non-admin attempts
are denied; audience and delivery history are recorded.

- [ ] T049 [P] [US6] Add admin audience-resolution and notification-batch service; Purpose: safely target all customers, customer type, selected users, or active orders; Deps: T040, T046; Files: `backend/src/services/adminNotificationService.ts`, `backend/src/services/notificationService.ts`; DB: create NotificationBatch and recipient delivery intents; API: internal service contract; Frontend: none; Backend: enforce role/audience ownership and marketing preferences; Accept: selected/audience users are deterministic and no unauthorized recipient IDs are honored; Test: audience-resolution unit tests.
- [ ] T050 [US6] Add admin notification send/history controllers and routes; Purpose: expose protected manual Push/SMS operations and delivery summaries; Deps: T049, T043; Files: `backend/src/controllers/adminNotificationController.ts`, `backend/src/routes/adminNotifications.ts`, `backend/src/index.ts`; DB: persist batch/audience/delivery outcomes; API: implement `POST /api/admin/notifications/send` and `GET /api/admin/notifications`; Frontend: consume admin contracts; Backend: enforce admin middleware and safe pagination; Accept: non-admin receives 403 and admin sees aggregate sent/failed outcomes without secrets; Test: admin contract/authorization tests.
- [ ] T051 [US6] Update admin order UI for canonical status transitions and automatic notifications; Purpose: make admin aware that status update drives history/delivery without manual provider calls; Deps: T031, T050; Files: `frontend/src/pages/admin/AdminOrders.tsx`, `frontend/src/pages/admin/AdminLayout.tsx`; DB: none; API: use centralized status route; Frontend: valid status selector, description/confirmation, safe failure feedback; Backend: no direct client delivery calls; Accept: admin can update status and see server result/history state; Test: admin UI integration test.
- [ ] T052 [US6] Build admin notification center and delivery-history UI; Purpose: provide authorized operational visibility and broadcast controls; Deps: T050, T044; Files: `frontend/src/pages/admin/AdminNotifications.tsx`, `frontend/src/pages/admin/NotificationDeliveryLogs.tsx`, `frontend/src/components/admin/AdminSidebar.tsx`, `frontend/src/App.tsx`; DB: none; API: consume send/history contracts; Frontend: audience/channel/message forms, aggregate status, loading/error states; Backend: none; Accept: admin can target supported audiences and inspect safe outcomes; Test: component/route/role tests.
- [ ] T053 [US6] Run administrator authorization, audience, status, and notification-history suite; Purpose: prove US6 independently; Deps: T049-T052; Files: `backend/test/adminNotifications.integration.test.js`, `frontend/src/__tests__/admin-notifications.test.tsx`; DB: admin/audience/delivery fixtures; API: exercise all admin contracts; Frontend: exercise role boundaries; Backend: verify customer cannot broadcast/update/read admin records; Accept: all US6 scenarios pass with no cross-user or cross-role access; Test: run focused suite.

---

## Phase 9: Polish, Security, Regression, and Build/Deployment Validation

**Purpose**: Complete cross-cutting quality gates without changing unrelated business behavior.

- [ ] T054 [P] Security-review secret handling, OTP logging, provider error redaction, and session/device ownership; Purpose: satisfy constitution security gates; Deps: T023, T028, T035, T045, T053; Files: `backend/src/**/*.ts`, `frontend/src/**/*.tsx`, `.env*`, `backend/.env.example`, `frontend/.env.example`; DB: verify no plaintext OTP/credential columns; API: verify no secret/provider leakage; Frontend: verify no server credential/bypass; Backend: verify auth/ownership/rate limits; Accept: security checklist passes and any exposed credential is rotated outside source; Test: grep/log-capture/negative authorization tests.
- [ ] T055 [P] Run existing commerce regression suite for products, cart, checkout, Razorpay, orders, addresses, account deletion, and End User/Distributor pricing; Purpose: prove minimal-change compatibility; Deps: T023, T028, T035, T045; Files: `backend/test/commerce-regression.integration.test.js`, `frontend/src/__tests__/commerce-regression.test.tsx`; DB: seeded End User/Distributor fixtures and historical orders; API: exercise existing routes; Frontend: exercise checkout/navigation; Backend: verify server totals/price snapshots; Accept: all existing baseline flows remain green; Test: run focused regression commands from quickstart.
- [ ] T056 [P] Add setup/operations documentation for SMS, Firebase, Android, worker, migrations, and rollback; Purpose: make deployment reproducible and safe; Deps: T036, T037, T041, T050; Files: `docs/NOTIFICATION_SETUP.md`, `docs/NOTIFICATION_ARCHITECTURE.md`, `backend/.env.example`, `frontend/.env.example`; DB: document migration/rollback and phone audit; API: document provider/config prerequisites; Frontend: document Android token/deep-link setup; Backend: document worker/secret setup; Accept: a new maintainer can follow docs without production credentials; Test: dry-run docs against non-production environment.
- [ ] T057 Run backend build, Prisma validation, migrations, tests, frontend build/lint/tests, and artifact quickstart validation; Purpose: enforce release quality gates; Deps: T054-T056; Files: `specs/001-mobile-otp-notifications-tracking/quickstart.md`, project build/test configuration; DB: validate non-production migration; API: run contract suite; Frontend: run production build; Backend: run `npm run build`, `npm test`, and Prisma checks; Accept: all available commands pass or documented environment blockers are recorded; Test: execute quickstart commands and capture results.
- [ ] T058 Run Capacitor Android debug build and manual push/deep-link smoke test; Purpose: validate native delivery without changing application ID; Deps: T039, T044, T056, T057; Files: `frontend/android/`, `frontend/capacitor.config.ts`, `frontend/android/app/google-services.json` (local secret, never commit); DB: none; API: verify device registration against non-production API; Frontend: verify permission/token/tap behavior; Backend: verify delivery records; Accept: `./gradlew assembleDebug` and test-device notification flow pass with non-production Firebase; Test: record device/build/provider prerequisites and any manual-only gaps.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: T001-T003 are read-only/initial audits and can run in parallel.
- **Phase 2 Foundation**: T004-T013 depend on the audit and block all user stories.
- **User Story 1 (P1)**: T014-T023 depends on phone normalization, schema, config, and
  provider boundaries. This is the MVP slice.
- **User Story 2 (P1)**: T024-T028 depends on US1 OTP verification/enrollment contracts.
- **User Story 3 (P1)**: T029-T035 depends on database history entities and admin auth;
  it can proceed in parallel with US2 after Phase 2.
- **User Story 4 (P1)**: T036-T045 depends on device/schema/provider foundations and
  integrates with US3 status events; T036-T041 can start after Phase 2, while T042-T045
  wait for T031/T040.
- **User Story 5 (P2)**: T046-T048 depends on notification policy/service from US4.
- **User Story 6 (P2)**: T049-T053 depends on notification service/history and admin status
  operation from US3/US4.
- **Polish**: T054-T058 depends on all desired stories and their integration points.

### User Story Completion Order

1. US1: Existing-customer OTP authentication (MVP).
2. US2: New-customer profile completion.
3. US3: Order status history and tracking.
4. US4: SMS/FCM/device management and notification history.
5. US5: Notification preferences.
6. US6: Admin notification management.

### Parallel Opportunities

- T001-T003 can run in parallel because they are read-only audits.
- T004-T006, T008-T011 can be split across backend/schema/security owners after the
  repository audit; T007 waits for the phone audit and Prisma model design.
- Within US1, T014 can be written in parallel with UI contract preparation; T019-T021
  can proceed in parallel after endpoint contracts are fixed.
- Within US3, T029 test design and T033 UI scaffolding can proceed in parallel while T030
  is being implemented; T032 depends on the status service.
- Within US4, T036 SMS and T037 Firebase adapters are independent; T038 device API and
  T043 notification history API are independent after schema foundations.
- T046 preference API and T049 audience-resolution design can proceed in parallel after
  notification policy is stable.
- T054-T056 are independent review/documentation streams after feature integration.

## Parallel Execution Examples

```text
# Phase 1 repository inspection
T001: Auth/data compatibility audit
T002: Commerce/payment/admin audit
T003: Capacitor/provider/secret audit

# Foundational provider and boundary work
T004: Phone normalization utility
T006: Prisma entities and relations
T008: Shared constants and policy maps
T009: Environment/config parsing
T011: Mock SMS and push adapters

# US4 provider work
T036: SMS adapter
T037: Firebase push adapter
T038: Device registration API

# US5/US6 after notification foundation
T046: Customer preference API
T049: Admin audience-resolution service
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T013: inspection, safe schema foundation, configuration, and mocks.
2. Complete T014-T023: existing-customer OTP authentication and protected-session flow.
3. Stop and validate the phone/OTP flow with mock SMS, rate limits, no plaintext secrets,
   existing customer type, and legacy admin compatibility.
4. Demonstrate US1 before adding profile, tracking, or notification delivery.

### Incremental Delivery

1. Add US2 to create complete new End User profiles without duplicates.
2. Add US3 to make order transitions auditable and customer-visible.
3. Add US4 to register devices and deliver SMS/Push through the durable outbox.
4. Add US5 to separate marketing choices from transactional policy.
5. Add US6 to expose protected admin broadcast/history controls.
6. Run T054-T058 before production rollout; each earlier story remains independently
   demonstrable.

## Independent Test Criteria by User Story

- **US1**: Existing phone authenticates with OTP; invalid/expired/rate-limited OTP fails;
  no OTP is logged/stored plaintext; role/customer type remains server-derived.
- **US2**: New phone completes required profile/address once, becomes End User, and can
  re-authenticate without duplicate user/address data.
- **US3**: Authorized admin transitions an order through valid states; one history item
  per transition; customer sees owned timeline; unauthorized order access is denied.
- **US4**: Device tokens support multiple devices/refresh; one order event creates one
  history item and correct deliveries; SMS/FCM failure leaves order success and records
  failed delivery.
- **US5**: Marketing preference changes affect marketing delivery only; transactional
  policy remains intact; preference ownership is enforced.
- **US6**: Admin status/broadcast/audit actions work for authorized admins only; audience
  targeting and delivery outcomes are recorded; customers are denied.

## Notes

- `[P]` tasks can run in parallel only when their file sets and prerequisites do not
  conflict.
- `[US1]` through `[US6]` map directly to the six prioritized user stories in `spec.md`.
- Tests are included because the specification and constitution explicitly require
  authentication, ownership, pricing, migration, provider-failure, tracking, and
  regression coverage.
- No task creates implementation code during planning; `/speckit-implement` executes
  this list in order.
