# Community Blood Bank Platform — Core Feature Documentation

> Working title: **RaktoSetu** ("রক্তসেতু" — *blood bridge*). Replace with the final product name before release.
> Document type: Product / Feature Specification (MVP)
> Prepared for: Engineering, Design, and Stakeholders
> Scope: Local deployment — a *thana* (upazila) of Pabna District, Bangladesh

---

## 1. Executive Summary

RaktoSetu is a lightweight, locally focused web application that connects people who **need blood** with people **willing to donate it**, within a single thana. It is deliberately scoped for the ground reality of blood supply in Bangladesh: at the local level, blood is rarely held in a large screened inventory. Most transfusions are fulfilled by locating a matching, willing donor at short notice. RaktoSetu treats **donor availability as the primary supply** and builds a fast, trustworthy matching layer around it.

The MVP centers on **three authenticated roles (Recipient, Donor, Admin)** plus **open public access** for search and discovery. It intentionally excludes hospital/clinic partner accounts, physical stock inventory, and clinical screening — those remain future expansion points and are noted as out of scope below.

## 2. Product Goal

**Primary goal:** Reduce the time and uncertainty between a blood need arising and a matching donor being reached, for residents of one thana.

**Secondary goals:**

- Build a reusable, verified local donor base that grows with each fulfilled request.
- Protect donors from spam and misuse by gating personal contact behind a real, accepted request.
- Give a local administrator clear oversight of activity, donor quality, and request outcomes.
- Keep the system simple enough to run and maintain locally, and clean enough to expand later (multi-thana, partner organizations, inventory).

**Explicit non-goal:** RaktoSetu is a **coordination platform, not a medical system**. It does not screen, test, cross-match, or certify blood safety. Screening and transfusion occur at the hospital where the patient is admitted. The product must never imply that it vouches for blood safety.

## 3. Target Users

| User | Description | Primary need |
|------|-------------|--------------|
| Public visitor | Anyone browsing without an account | See whether help is likely available before committing |
| Recipient | A patient, or someone acting on their behalf | Raise a request and reach a matching donor quickly |
| Donor | A registered, willing blood donor | Be found when needed, without being spammed |
| Admin | The local operator running the platform | Keep the base trustworthy and monitor outcomes |

> Note: a single person is often both a recipient and a donor over time. For the MVP the two are documented as separate roles for clarity; the account model (see the schema document) is designed so this can later collapse into one account carrying both capabilities without rework.

## 4. Scope of the MVP

**In scope:** public blood search, blood-request lifecycle, donor registration and availability, donor–recipient matching, mutual completion confirmation, notifications, and an admin console for oversight and moderation.

**Out of scope (future phases):**

- Hospital / clinic / organization partner accounts and fulfillment.
- Physical blood stock inventory and expiry management.
- Clinical screening, cross-matching, or lab integration.
- Payments or paid donation of any kind.
- Multi-thana / district / national roll-out (architecture leaves room for it).

## 5. Core System Modules

### 5.1 Public Blood Search
Open, no-login discovery. Search available donors by blood group and location, view an availability summary, browse currently active requests (without exposed personal contact details), and read blood-donation information and FAQs.

### 5.2 Blood Request Management
The full lifecycle of a request: create, edit, cancel, track status, match with donors, and close when completed. Requests pass through an **admin review / publish** step before becoming publicly visible, which keeps the public board clean and discourages abuse.

### 5.3 Donor Management
Donor registration and profile, availability toggle, auto-tracked donation history, and the ability to respond to (accept / decline) blood requests — both those pushed to the donor and those the donor finds by browsing.

### 5.4 Authentication & User Management
Registration, login, profile management, password reset, and role-based access control across all four access levels.

### 5.5 Notification System
Alerts for new matching requests, request-status changes, donor responses, and important administrator announcements. Given local usage patterns, SMS is treated as a first-class channel alongside in-app notifications.

### 5.6 Administration
An operational console: user management, donor verification, request management (assign / publish / close), content moderation, reports and analytics, and system configuration.

## 6. Features by User Role

### 6.1 Public (Unauthenticated)
- Search blood availability by group and location
- Browse active blood requests (no personal contact shown)
- View blood-availability statistics for the thana
- Learn about blood donation (eligibility, compatibility, FAQs)
- Register / Log in

### 6.2 Recipient
- Create a blood request
- Edit or cancel their own request
- Track request status through its lifecycle
- View matched donor information **only once a match is approved/accepted**
- Receive notifications on responses and status changes
- Manage their profile
- View their request history

### 6.3 Donor
- Register as a donor and complete a donor profile
- Update availability status (available / unavailable)
- View nearby, group-matching blood requests
- Accept or decline a donation request
- View donation history, with an automatically calculated next-eligible date
- Receive request notifications
- Manage their profile

### 6.4 Admin
- Operational dashboard with key metrics
- Manage users (view, suspend, remove)
- Verify donors
- Manage blood requests (review, publish, assign, close)
- Moderate content and reported accounts
- Generate reports and analytics
- Manage system settings

## 7. Key Business Rules

1. **Contact privacy.** A donor's and recipient's personal contact details are revealed to each other **only after** a donor accepts a specific request. They are never publicly browsable.
2. **Admin-gated publishing.** A new request is not publicly visible until an admin reviews and publishes it (protects against spam and fake emergencies).
3. **Donor eligibility cooldown.** After a completed donation, a donor is automatically marked ineligible until a standard rest period elapses (commonly ~90–120 days); the next-eligible date is computed by the system.
4. **Mutual completion.** A request is only marked *fulfilled* when both parties confirm the donation happened. This keeps donation history and donor counts honest.
5. **Blood-group compatibility.** Matching respects standard ABO/Rh compatibility, not just exact-group matches.
6. **No safety claim.** The platform never asserts that any blood is safe or screened; screening happens at the hospital.

## 8. Request Lifecycle (Statuses)

```
DRAFT → PENDING_REVIEW → PUBLISHED → MATCHED → IN_PROGRESS → FULFILLED
                              │           │
                              └───────────┴──→ CANCELLED / EXPIRED / UNFULFILLED
```

- **PENDING_REVIEW** — awaiting admin publish decision
- **PUBLISHED** — visible on the public board, open to donors
- **MATCHED** — a donor has accepted; contact shared
- **IN_PROGRESS** — donation being arranged/underway
- **FULFILLED** — both parties confirmed completion
- **CANCELLED / EXPIRED / UNFULFILLED** — closed without success

## 9. Assumptions & Constraints

- Phone number is the primary identity; email is optional. OTP verification is expected.
- The interface should support **Bangla and English**.
- Users may be on low-end devices and intermittent connectivity — keep the client light.
- The initial catchment is a single thana; location is captured at union/village granularity within it.
- The platform is a facilitator; all clinical responsibility sits with the treating hospital.

## 10. Success Metrics (MVP)

- Median time from request publish to first donor acceptance.
- Percentage of published requests that reach FULFILLED.
- Number of verified, active donors in the base.
- Repeat-donor rate.
- Spam/abuse reports per 100 requests (should trend down as gating works).

## 11. Future Expansion (parked, not in MVP)

- Partner organizations (hospitals/clinics) as verified accounts, optionally handling fulfillment and, later, screened stock inventory.
- Physical inventory with expiry tracking.
- Multi-thana and district-level federation.
- Integration with national systems (e.g. DGHS Safe Blood Transfusion / BBMS) where appropriate.
