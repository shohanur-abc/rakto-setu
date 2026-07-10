# Community Blood Bank Platform — API Specification (MVP)

> Companion to the Core Feature Documentation.
> Convention: REST over HTTPS, JSON request/response.
> Base path: `/api/v1`

---

## 1. Reading This Document

Each endpoint is **numbered** and tagged with an **access level**:

| Tag | Meaning |
|-----|---------|
| 🌐 **Public** | No authentication required |
| 🔒 **Private** | Requires a valid session/JWT |
| 👤 Recipient / ❤️ Donor / ⚙️ Admin | Role required in addition to authentication |

**Auth model.** Login returns a token (JWT recommended). Private endpoints require `Authorization: Bearer <token>`. Role-based access control is enforced server-side; the role tag indicates the minimum role required.

**Standard response envelope.**
```json
{ "success": true, "data": { }, "message": "", "errors": [] }
```

**Common status codes:** `200` OK, `201` Created, `400` validation error, `401` unauthenticated, `403` forbidden (wrong role), `404` not found, `409` conflict, `422` unprocessable, `500` server error.

---

## 2. Authentication & User Management

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/auth/register` | 🌐 Public | Register a new account (recipient and/or donor intent) |
| 2 | POST | `/auth/login` | 🌐 Public | Authenticate and receive a token |
| 3 | POST | `/auth/logout` | 🔒 Private | Invalidate the current session/token |
| 4 | POST | `/auth/otp/request` | 🌐 Public | Request an OTP to a phone number |
| 5 | POST | `/auth/otp/verify` | 🌐 Public | Verify OTP and activate the account |
| 6 | POST | `/auth/password/forgot` | 🌐 Public | Start password reset (send reset code) |
| 7 | POST | `/auth/password/reset` | 🌐 Public | Complete password reset with code |
| 8 | POST | `/auth/password/change` | 🔒 Private | Change password while logged in |
| 9 | GET | `/auth/me` | 🔒 Private | Get the current authenticated user |
| 10 | GET | `/users/profile` | 🔒 Private | Get own profile details |
| 11 | PUT | `/users/profile` | 🔒 Private | Update own profile |
| 12 | POST | `/users/profile/avatar` | 🔒 Private | Upload/replace profile photo (optional) |

## 3. Public Blood Search & Information

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 13 | GET | `/search/donors` | 🌐 Public | Search available donors by blood group + location (no contact details) |
| 14 | GET | `/search/availability-summary` | 🌐 Public | Availability summary/statistics by blood group for the thana |
| 15 | GET | `/requests/public` | 🌐 Public | Browse currently active/published requests (contact hidden) |
| 16 | GET | `/requests/public/{id}` | 🌐 Public | View a single published request (contact hidden) |
| 17 | GET | `/info/faqs` | 🌐 Public | Blood-donation FAQs |
| 18 | GET | `/info/compatibility` | 🌐 Public | Blood-group compatibility chart |
| 19 | GET | `/info/eligibility` | 🌐 Public | Donation eligibility criteria |
| 20 | GET | `/locations` | 🌐 Public | List unions/villages within the thana (for dropdowns) |
| 21 | GET | `/announcements/public` | 🌐 Public | Public administrator announcements |

## 4. Blood Request Management

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 22 | POST | `/requests` | 🔒👤 Recipient | Create a new blood request (enters PENDING_REVIEW) |
| 23 | GET | `/requests` | 🔒👤 Recipient | List own requests |
| 24 | GET | `/requests/{id}` | 🔒👤 Recipient | View own request detail (incl. matched donor once approved) |
| 25 | PUT | `/requests/{id}` | 🔒👤 Recipient | Edit own request (allowed states only) |
| 26 | POST | `/requests/{id}/cancel` | 🔒👤 Recipient | Cancel own request |
| 27 | GET | `/requests/{id}/status` | 🔒👤 Recipient | Track lifecycle status |
| 28 | GET | `/requests/{id}/matches` | 🔒👤 Recipient | View donors who accepted this request |
| 29 | POST | `/requests/{id}/confirm-completion` | 🔒👤 Recipient | Recipient side of mutual completion |

## 5. Donor Management

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 30 | POST | `/donors/register` | 🔒 Private | Register the current user as a donor / create donor profile |
| 31 | GET | `/donors/profile` | 🔒❤️ Donor | Get own donor profile |
| 32 | PUT | `/donors/profile` | 🔒❤️ Donor | Update own donor profile |
| 33 | PATCH | `/donors/availability` | 🔒❤️ Donor | Toggle availability (available/unavailable) |
| 34 | GET | `/donors/requests` | 🔒❤️ Donor | View nearby, group-matching open requests (push + browse) |
| 35 | POST | `/donors/requests/{id}/accept` | 🔒❤️ Donor | Accept a request (triggers contact sharing) |
| 36 | POST | `/donors/requests/{id}/decline` | 🔒❤️ Donor | Decline a request |
| 37 | POST | `/donors/requests/{id}/confirm-completion` | 🔒❤️ Donor | Donor side of mutual completion |
| 38 | GET | `/donors/donations` | 🔒❤️ Donor | View own donation history |
| 39 | GET | `/donors/eligibility` | 🔒❤️ Donor | Get eligibility status + next-eligible date |

## 6. Notifications

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 40 | GET | `/notifications` | 🔒 Private | List own notifications |
| 41 | PATCH | `/notifications/{id}/read` | 🔒 Private | Mark a notification read |
| 42 | PATCH | `/notifications/read-all` | 🔒 Private | Mark all read |
| 43 | GET | `/notifications/unread-count` | 🔒 Private | Unread badge count |

## 7. Administration

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 44 | GET | `/admin/dashboard` | 🔒⚙️ Admin | Aggregate metrics for the dashboard |
| 45 | GET | `/admin/users` | 🔒⚙️ Admin | List / search users |
| 46 | GET | `/admin/users/{id}` | 🔒⚙️ Admin | View a user |
| 47 | PATCH | `/admin/users/{id}/status` | 🔒⚙️ Admin | Suspend / reactivate a user |
| 48 | DELETE | `/admin/users/{id}` | 🔒⚙️ Admin | Remove a user |
| 49 | GET | `/admin/donors/pending` | 🔒⚙️ Admin | List donors awaiting verification |
| 50 | PATCH | `/admin/donors/{id}/verify` | 🔒⚙️ Admin | Approve / reject donor verification |
| 51 | GET | `/admin/requests` | 🔒⚙️ Admin | List all requests (any status) |
| 52 | PATCH | `/admin/requests/{id}/publish` | 🔒⚙️ Admin | Publish a request (review approval) |
| 53 | PATCH | `/admin/requests/{id}/reject` | 🔒⚙️ Admin | Reject a request under review |
| 54 | PATCH | `/admin/requests/{id}/assign` | 🔒⚙️ Admin | Manually assign/suggest a donor |
| 55 | PATCH | `/admin/requests/{id}/close` | 🔒⚙️ Admin | Force-close a request |
| 56 | GET | `/admin/reports` | 🔒⚙️ Admin | Generate reports (filters: date, group, outcome) |
| 57 | GET | `/admin/reports/export` | 🔒⚙️ Admin | Export report (CSV) |
| 58 | POST | `/admin/announcements` | 🔒⚙️ Admin | Create an announcement |
| 59 | PUT | `/admin/announcements/{id}` | 🔒⚙️ Admin | Edit an announcement |
| 60 | DELETE | `/admin/announcements/{id}` | 🔒⚙️ Admin | Delete an announcement |
| 61 | GET | `/admin/reports/moderation` | 🔒⚙️ Admin | Review reported/flagged content |
| 62 | GET | `/admin/settings` | 🔒⚙️ Admin | Read system configuration |
| 63 | PUT | `/admin/settings` | 🔒⚙️ Admin | Update system configuration (e.g. cooldown days) |

---

## 8. Cross-Cutting Notes

- **Rate limiting** on all 🌐 Public endpoints (especially search and OTP) to prevent scraping and abuse.
- **Contact-sharing rule** is enforced at the API layer: donor and recipient contact fields are only populated in responses to endpoints #24 and #35 *after* an accept has occurred.
- **Pagination** on all list endpoints via `?page=` and `?limit=` with a sane default cap.
- **Filtering** on search endpoints: `?blood_group=`, `?union_id=`, `?urgency=`.
- **Audit logging** for all 🔒⚙️ Admin state-changing actions.
- **Localization**: `Accept-Language: bn | en` respected for message strings.
