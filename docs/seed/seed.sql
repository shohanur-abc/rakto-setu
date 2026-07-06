-- =============================================================================
-- RaktoSetu — Full demo / test seed
-- =============================================================================
--
-- PURPOSE
--   Populate a *fresh or existing* database with enough realistic data to
--   manually verify and test EVERY feature in the app: auth flows, donor
--   lifecycle, blood-request lifecycle, matching, admin moderation, reporting,
--   announcements, notifications and settings.
--
--   Unlike a minimal fixture, this file deliberately exercises every enum value
--   and every meaningful state transition so that each screen/endpoint has a
--   row to render. See the "COVERAGE MAP" at the bottom of this file.
--
-- HOW TO RUN
--   From apps/server (this file uses the same runner as the existing demo seed):
--
--     pnpm --filter server exec prisma db execute --file ../../docs/seed/seed.sql
--
--   or, from the repo root:
--
--     cd apps/server && prisma db execute --file ../../docs/seed/seed.sql
--
--   (Optionally wire it into package.json, e.g.
--    "prisma:seed:full": "prisma db execute --file ../../docs/seed/seed.sql")
--
-- IDEMPOTENCY
--   Safe to run multiple times. Reference/anchor tables (settings, locations,
--   users, donor_profiles) are UPSERTed by their natural keys. Activity tables
--   (requests, responses, donations, notifications, announcements, audit_logs,
--   auth_tokens) are DELETEd by their demo markers and re-inserted, so re-runs
--   never create duplicates.
--
-- LOGIN CREDENTIALS
--   Every seeded user shares the same password so you can log in as anyone:
--
--       Password:  DemoPass123!
--
--   The password_hash below is scrypt(salt, "DemoPass123!") in the app's
--   "<salt>:<derivedHex>" format (see src/common/utils/crypto.ts). Log in with
--   the phone number + that password.
--
--   Key accounts (phone / role):
--       +8801700000000  admin       — full admin console
--       +8801711000001  donor       — verified, active, rich history ("star" donor)
--       +8801811000001  recipient   — has several blood requests
--       +8801811000006  recipient   — PENDING (phone not verified) → test OTP activation
--
-- NOTE ON DATES
--   All dates are relative to now()/current_date so the data stays "fresh"
--   (upcoming requests stay in the future, cooldowns stay meaningful) no matter
--   when you run the seed.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) SETTINGS
-- -----------------------------------------------------------------------------
-- donorCooldownDays drives donor eligibility maths (a donor cannot donate again
-- until last_donation_date + cooldown). The app reads ONLY this key today
-- (see settings.service.ts); the extra rows below simply demonstrate that the
-- generic settings table / admin "system settings" screen can hold more.
-- -----------------------------------------------------------------------------
INSERT INTO settings (id, key, value, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'donorCooldownDays', '{"donorCooldownDays":90}'::jsonb,
   'Minimum days between donor completions', now(), now()),
  (gen_random_uuid(), 'supportContact', '{"phone":"+8801700000000","email":"support@raktosetu.example"}'::jsonb,
   'Public support contact shown in the app footer', now(), now()),
  (gen_random_uuid(), 'announcementBanner', '{"enabled":true,"text":"Donate blood, save lives."}'::jsonb,
   'Optional site-wide banner text', now(), now())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();

-- -----------------------------------------------------------------------------
-- 2) LOCATIONS  (self-referencing hierarchy: unions → villages)
-- -----------------------------------------------------------------------------
-- Two levels so the "list local unions and villages" endpoint and the
-- location filters on donor/request search have a real tree to walk.
-- -----------------------------------------------------------------------------
WITH unions(name, type) AS (
  VALUES
    ('Ishwardi', 'union'),
    ('Atghoria', 'union'),
    ('Santhia',  'union'),
    ('Bera',     'union')
)
INSERT INTO locations (id, name, type, parent_id, created_at, updated_at)
SELECT gen_random_uuid(), name, type, NULL, now(), now()
FROM unions
WHERE NOT EXISTS (
  SELECT 1 FROM locations
  WHERE locations.name = unions.name
    AND locations.type = unions.type
    AND locations.parent_id IS NULL
);

WITH villages(name, parent_name) AS (
  VALUES
    ('Pakshi',       'Ishwardi'),
    ('Dashuria',     'Ishwardi'),
    ('Muladuli',     'Ishwardi'),
    ('Debottar',     'Atghoria'),
    ('Chandva',      'Atghoria'),
    ('Khetupara',    'Santhia'),
    ('Ataikula',     'Santhia'),
    ('Kashinathpur', 'Bera'),
    ('Nakalia',      'Bera')
)
INSERT INTO locations (id, name, type, parent_id, created_at, updated_at)
SELECT gen_random_uuid(), villages.name, 'village', parent.id, now(), now()
FROM villages
JOIN locations parent ON parent.name = villages.parent_name AND parent.type = 'union'
WHERE NOT EXISTS (
  SELECT 1 FROM locations
  WHERE locations.name = villages.name
    AND locations.type = 'village'
    AND locations.parent_id = parent.id
);

-- -----------------------------------------------------------------------------
-- 3) USERS
-- -----------------------------------------------------------------------------
-- Covers every Role and every UserStatus, plus phone_verified true/false, so
-- admin user-list filters, suspend/reactivate, delete and the OTP activation
-- flow all have a subject.
--
--   status legend:
--     active               → normal, can log in and act
--     pending_verification → registered but OTP not yet confirmed (phone_verified=false)
--     suspended            → blocked by admin (test reactivation)
--     deleted              → soft-removed (test that they're hidden from lists)
--
-- The 8 donors below also cover all 8 blood groups.
-- -----------------------------------------------------------------------------
WITH seed_users(full_name, phone, email, role, blood_group, location_name, status, phone_verified) AS (
  VALUES
    -- Admin ---------------------------------------------------------------
    ('RaktoSetu Admin',    '+8801700000000', 'admin@example.com',         'admin'::role,     NULL::blood_group, 'Pakshi',       'active'::user_status,               true),

    -- Donors (all 8 blood groups + assorted verification/status states) ---
    ('Abdul Karim',        '+8801711000001', 'abdul.karim@example.com',   'donor'::role,     'O+'::blood_group,  'Pakshi',       'active'::user_status,               true),  -- verified, eligible, rich history
    ('Nusrat Jahan',       '+8801711000002', 'nusrat.jahan@example.com',  'donor'::role,     'A+'::blood_group,  'Dashuria',     'active'::user_status,               true),  -- verified but in cooldown (donated recently)
    ('Mehedi Hasan',       '+8801711000003', 'mehedi.hasan@example.com',  'donor'::role,     'B+'::blood_group,  'Debottar',     'active'::user_status,               true),
    ('Farhana Akter',      '+8801711000004', 'farhana.akter@example.com', 'donor'::role,     'AB+'::blood_group, 'Kashinathpur', 'active'::user_status,               true),
    ('Rafiq Islam',        '+8801711000005', 'rafiq.islam@example.com',   'donor'::role,     'O-'::blood_group,  'Ataikula',     'active'::user_status,               true),  -- universal donor
    ('Sadia Rahman',       '+8801711000006', 'sadia.rahman@example.com',  'donor'::role,     'A-'::blood_group,  'Nakalia',      'active'::user_status,               true),
    ('Tanvir Ahmed',       '+8801711000007', 'tanvir.ahmed@example.com',  'donor'::role,     'B-'::blood_group,  'Muladuli',     'active'::user_status,               true),  -- UNVERIFIED → admin verification queue
    ('Mst. Halima Begum',  '+8801711000008', 'halima.begum@example.com',  'donor'::role,     'AB-'::blood_group, 'Chandva',      'active'::user_status,               true),  -- verified, unavailable (cooldown)
    ('Kamal Uddin',        '+8801711000009', 'kamal.uddin@example.com',   'donor'::role,     'O+'::blood_group,  'Khetupara',    'active'::user_status,               true),  -- REJECTED verification
    ('Shabnur Akhi',       '+8801711000010', 'shabnur.akhi@example.com',  'donor'::role,     'O-'::blood_group,  'Pakshi',       'active'::user_status,               true),  -- second O- for emergencies
    ('Jamal Molla',        '+8801711000011', 'jamal.molla@example.com',   'donor'::role,     'B+'::blood_group,  'Nakalia',      'active'::user_status,               true),  -- UNVERIFIED → verification queue
    ('Ruma Khatun',        '+8801711000012', 'ruma.khatun@example.com',   'donor'::role,     'A+'::blood_group,  'Ataikula',     'suspended'::user_status,            true),  -- SUSPENDED donor

    -- Recipients ----------------------------------------------------------
    ('Mizanur Rahman',     '+8801811000001', 'mizanur.rahman@example.com','recipient'::role, 'B+'::blood_group,  'Pakshi',       'active'::user_status,               true),
    ('Sharmin Sultana',    '+8801811000002', 'sharmin.sultana@example.com','recipient'::role,'O+'::blood_group,  'Kashinathpur', 'active'::user_status,               true),
    ('Jahid Hossain',      '+8801811000003', 'jahid.hossain@example.com', 'recipient'::role, 'A-'::blood_group,  'Debottar',     'active'::user_status,               true),
    ('Tasnim Akter',       '+8801811000004', 'tasnim.akter@example.com',  'recipient'::role, 'A+'::blood_group,  'Ataikula',     'active'::user_status,               true),
    ('Delwar Hossain',     '+8801811000005', 'delwar.hossain@example.com','recipient'::role, 'AB+'::blood_group, 'Muladuli',     'active'::user_status,               true),
    ('Nasima Begum',       '+8801811000006', 'nasima.begum@example.com',  'recipient'::role, 'O-'::blood_group,  'Dashuria',     'pending_verification'::user_status, false), -- OTP not confirmed yet
    ('Former Account',     '+8801811000007', NULL,                        'recipient'::role, 'B+'::blood_group,  'Nakalia',      'deleted'::user_status,              true)   -- soft-deleted
)
INSERT INTO users (
  id, full_name, phone, email, password_hash, role, blood_group,
  location_id, status, phone_verified, preferred_language, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  seed_users.full_name,
  seed_users.phone,
  seed_users.email,
  -- scrypt hash of "DemoPass123!" — same value for every demo user.
  'f3f325bc8da8f65bde0a3372ac90790f:d229e936f9360133a1032c244d17d76c5de4f063cfd4b1e66c9a87e781d9de3ba11122a859b17d95c314c945a7826bde169b6c5a730d8a817ad948bb3d0b3066',
  seed_users.role,
  seed_users.blood_group,
  locations.id,
  seed_users.status,
  seed_users.phone_verified,
  'bn',
  now(),
  now()
FROM seed_users
LEFT JOIN locations ON locations.name = seed_users.location_name
ON CONFLICT (phone) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    blood_group = EXCLUDED.blood_group,
    location_id = EXCLUDED.location_id,
    status = EXCLUDED.status,
    phone_verified = EXCLUDED.phone_verified,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = now();

-- -----------------------------------------------------------------------------
-- 4) DONOR PROFILES
-- -----------------------------------------------------------------------------
-- One profile per donor user. Covers every DonorVerification value, both
-- availability flags, and the cooldown window (next_eligible_date in the future
-- vs. in the past) so donor search, availability summary and the eligibility
-- endpoint all have interesting cases:
--
--   Nusrat  → available=true BUT next_eligible in the FUTURE (donated 10d ago)
--             → "willing but not yet eligible" case for the eligibility screen.
--   Halima  → available=false + future eligibility (classic cooldown).
--   Tanvir/Jamal → unverified → appear in admin "donors awaiting verification".
--   Kamal   → rejected → excluded from public donor search.
--   Ruma    → verified profile but owning USER is suspended.
-- -----------------------------------------------------------------------------
WITH donor_seed(phone, blood_group, is_available, verification, last_donation_date, next_eligible_date, total_donations, notes) AS (
  VALUES
    ('+8801711000001', 'O+'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '120 days')::date, (current_date - interval '30 days')::date, 5, 'Usually available after office hours.'),
    ('+8801711000002', 'A+'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '10 days')::date,  (current_date + interval '80 days')::date, 3, 'Willing to help but still within cooldown window.'),
    ('+8801711000003', 'B+'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '200 days')::date, (current_date - interval '110 days')::date,4, NULL),
    ('+8801711000004', 'AB+'::blood_group, true,  'verified'::donor_verification,   NULL::date,                                  NULL::date,                                 2, NULL),
    ('+8801711000005', 'O-'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '100 days')::date, (current_date - interval '10 days')::date, 6, 'Universal donor — happy to travel for emergencies.'),
    ('+8801711000006', 'A-'::blood_group,  true,  'verified'::donor_verification,   NULL::date,                                  NULL::date,                                 1, NULL),
    ('+8801711000007', 'B-'::blood_group,  true,  'unverified'::donor_verification, NULL::date,                                  NULL::date,                                 0, 'Newly registered, awaiting verification.'),
    ('+8801711000008', 'AB-'::blood_group, false, 'verified'::donor_verification,   (current_date - interval '35 days')::date,  (current_date + interval '55 days')::date, 2, 'Currently in cooldown after recent donation.'),
    ('+8801711000009', 'O+'::blood_group,  false, 'rejected'::donor_verification,   NULL::date,                                  NULL::date,                                 0, 'Verification rejected — documents did not match.'),
    ('+8801711000010', 'O-'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '95 days')::date,  (current_date - interval '5 days')::date,  8, NULL),
    ('+8801711000011', 'B+'::blood_group,  true,  'unverified'::donor_verification, NULL::date,                                  NULL::date,                                 0, 'Awaiting verification.'),
    ('+8801711000012', 'A+'::blood_group,  true,  'verified'::donor_verification,   (current_date - interval '150 days')::date, (current_date - interval '60 days')::date, 2, 'Profile verified before the account was suspended.')
)
INSERT INTO donor_profiles (
  id, user_id, blood_group, is_available, verification,
  last_donation_date, next_eligible_date, total_donations, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  users.id,
  donor_seed.blood_group,
  donor_seed.is_available,
  donor_seed.verification,
  donor_seed.last_donation_date,
  donor_seed.next_eligible_date,
  donor_seed.total_donations,
  donor_seed.notes,
  now(),
  now()
FROM donor_seed
JOIN users ON users.phone = donor_seed.phone
ON CONFLICT (user_id) DO UPDATE
SET blood_group = EXCLUDED.blood_group,
    is_available = EXCLUDED.is_available,
    verification = EXCLUDED.verification,
    last_donation_date = EXCLUDED.last_donation_date,
    next_eligible_date = EXCLUDED.next_eligible_date,
    total_donations = EXCLUDED.total_donations,
    notes = EXCLUDED.notes,
    updated_at = now();

-- =============================================================================
-- CLEANUP OF PRIOR DEMO ACTIVITY  (keeps re-runs idempotent)
-- =============================================================================
-- Delete children before parents to respect foreign keys. All demo activity is
-- addressable by a stable marker (patient name, announcement title, audit
-- metadata source, or token hash).
-- -----------------------------------------------------------------------------

-- Donations: remove ALL donations belonging to seeded donors (covers both
-- request-linked and standalone/historical donations).
DELETE FROM donations
WHERE donor_profile_id IN (
  SELECT dp.id
  FROM donor_profiles dp
  JOIN users u ON u.id = dp.user_id
  WHERE u.phone LIKE '+88017110000%'
);

-- Responses tied to the demo blood requests.
DELETE FROM request_responses
WHERE request_id IN (
  SELECT id FROM blood_requests
  WHERE patient_name IN (
    'Ayesha Khatun', 'Md. Selim Hossain', 'Rokeya Begum', 'Nayeem Ahmed',
    'Rahima Begum', 'Sufia Khatun', 'Abdur Rahim', 'Momena Begum', 'Korban Ali'
  )
);

DELETE FROM audit_logs   WHERE metadata->>'source' = 'docs/seed/seed.sql';
DELETE FROM notifications WHERE title IN (
  'New matching blood request near you',
  'Your request has been matched',
  'A donor accepted your request',
  'New announcement: verified donor drive'
);
DELETE FROM announcements WHERE title IN (
  'Verified donor drive this Friday',
  'Reminder: hospital screening is mandatory',
  'Eid holiday blood stock appeal (draft)'
);
DELETE FROM auth_tokens WHERE token_hash IN (
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- otp 123456 (active)
  '481f6cc0511143ccdd7e2d1b1b94faf0a700a8b49cd13922a70b5ae28acaa8c5', -- otp 654321 (used/expired)
  '288b65b52bec40cbf76e42dd6b08cedc0540c4207c83ba1a6bc91e36e80093a7', -- password_reset (active)
  'c186a1769aa0af2df30509971aee12d76a5e22cbf09a470df837be8c5ee1050c', -- session (active)
  '3249692e6adf70f45fd6db1fe6a3e9fa667f55cb70f2aab1c71d2fbc62224a79', -- refresh (active)
  'c46f5006ea5cf2b4fc544e7b5219643046076603ceb51e1880a7d17a5cad6fe4'  -- session (expired)
);

-- Requests last (parents of responses/donations, now already cleared).
DELETE FROM blood_requests
WHERE patient_name IN (
  'Ayesha Khatun', 'Md. Selim Hossain', 'Rokeya Begum', 'Nayeem Ahmed',
  'Rahima Begum', 'Sufia Khatun', 'Abdur Rahim', 'Momena Begum', 'Korban Ali'
);

-- =============================================================================
-- 5) BLOOD REQUESTS  — one per RequestStatus (all 9 states)
-- =============================================================================
--   draft          → recipient started but hasn't submitted (private).
--   pending_review → submitted, waiting for an admin to publish/reject.
--   published      → live and visible to matching donors.
--   matched        → a donor accepted; awaiting donation.
--   in_progress    → donation underway (donor confirmed intent).
--   fulfilled      → completed, mutually confirmed, donation recorded.
--   cancelled      → recipient withdrew the request.
--   expired        → needed_by passed while still open.
--   unfulfilled    → closed by admin after no donor completed in time.
--
-- `reviewed` marks whether an admin has acted on it (sets reviewed_by).
-- -----------------------------------------------------------------------------
WITH request_seed(recipient_phone, patient_name, patient_age, blood_group, units_needed, units_fulfilled, hospital_name, location_name, urgency, needed_by, status, reviewed, notes) AS (
  VALUES
    ('+8801811000001', 'Ayesha Khatun',     42, 'B+'::blood_group,  2, 0, 'Pabna General Hospital',            'Pakshi',       'emergency'::request_urgency, now() + interval '1 day',  'published'::request_status,      true,  'Surgery scheduled tomorrow morning.'),
    ('+8801811000002', 'Md. Selim Hossain', 55, 'O+'::blood_group,  1, 0, 'Ishwardi Upazila Health Complex',   'Dashuria',     'urgent'::request_urgency,    now() + interval '2 days', 'matched'::request_status,        true,  'Doctor requested one donor before transfusion.'),
    ('+8801811000003', 'Rokeya Begum',      63, 'A-'::blood_group,  1, 0, 'Bera Health Complex',               'Kashinathpur', 'routine'::request_urgency,   now() + interval '5 days', 'pending_review'::request_status, false, 'Planned procedure, pending admin review.'),
    ('+8801811000004', 'Nayeem Ahmed',      19, 'A+'::blood_group,  1, 1, 'Pabna Medical College Hospital',    'Ataikula',     'urgent'::request_urgency,    now() - interval '10 days','fulfilled'::request_status,      true,  'Completed request with mutual confirmation.'),
    ('+8801811000001', 'Rahima Begum',      35, 'AB+'::blood_group, 2, 0, 'Pabna General Hospital',            'Debottar',     'routine'::request_urgency,   now() - interval '3 days', 'expired'::request_status,        true,  'Expired while open — good for report screens.'),
    ('+8801811000005', 'Sufia Khatun',      28, 'O+'::blood_group,  1, 0, 'Ishwardi Upazila Health Complex',   'Muladuli',     'routine'::request_urgency,   now() + interval '7 days', 'draft'::request_status,          false, 'Draft — recipient has not submitted yet.'),
    ('+8801811000002', 'Abdur Rahim',       48, 'O+'::blood_group,  1, 0, 'Pabna General Hospital',            'Kashinathpur', 'urgent'::request_urgency,    now() + interval '1 day',  'in_progress'::request_status,    true,  'Donor assigned and heading to the hospital.'),
    ('+8801811000003', 'Momena Begum',      70, 'A-'::blood_group,  1, 0, 'Bera Health Complex',               'Debottar',     'routine'::request_urgency,   now() + interval '4 days', 'cancelled'::request_status,      true,  'Recipient cancelled — arranged blood privately.'),
    ('+8801811000004', 'Korban Ali',        60, 'AB-'::blood_group, 2, 0, 'Pabna Medical College Hospital',    'Ataikula',     'emergency'::request_urgency, now() - interval '2 days', 'unfulfilled'::request_status,    true,  'Closed by admin — no donor completed in time.')
)
INSERT INTO blood_requests (
  id, recipient_id, patient_name, patient_age, blood_group, units_needed, units_fulfilled,
  hospital_name, location_id, urgency, needed_by, status, notes, reviewed_by, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  recipient.id,
  request_seed.patient_name,
  request_seed.patient_age,
  request_seed.blood_group,
  request_seed.units_needed,
  request_seed.units_fulfilled,
  request_seed.hospital_name,
  locations.id,
  request_seed.urgency,
  request_seed.needed_by,
  request_seed.status,
  request_seed.notes,
  CASE WHEN request_seed.reviewed THEN admin_user.id ELSE NULL END,
  now(),
  now()
FROM request_seed
JOIN users recipient ON recipient.phone = request_seed.recipient_phone
JOIN locations ON locations.name = request_seed.location_name
LEFT JOIN users admin_user ON admin_user.phone = '+8801700000000';

-- -----------------------------------------------------------------------------
-- 6) REQUEST RESPONSES  — covers every ResponseStatus
-- -----------------------------------------------------------------------------
--   accepted  → donor agreed to help (drives matched/in_progress/fulfilled).
--   declined  → donor turned it down (still recorded for the donor's history).
--   withdrawn → donor accepted then pulled out (contributes to "unfulfilled").
--
-- `confirmed` sets BOTH donor_confirmed_completion and
-- recipient_confirmed_completion (true only for the fully completed request).
-- -----------------------------------------------------------------------------
INSERT INTO request_responses (
  id, request_id, donor_id, status, responded_at,
  donor_confirmed_completion, recipient_confirmed_completion, created_at, updated_at
)
SELECT gen_random_uuid(), br.id, donor.id, response.status,
       now() - (response.days_ago::text || ' days')::interval,
       response.confirmed, response.confirmed, now(), now()
FROM (
  VALUES
    ('Ayesha Khatun',     '+8801711000003', 'declined'::response_status,  false, 0),  -- Mehedi declined the published request
    ('Md. Selim Hossain', '+8801711000001', 'accepted'::response_status,  false, 0),  -- Abdul Karim accepted → request "matched"
    ('Nayeem Ahmed',      '+8801711000002', 'accepted'::response_status,  true,  10), -- Nusrat accepted & both sides confirmed → "fulfilled"
    ('Abdur Rahim',       '+8801711000005', 'accepted'::response_status,  false, 0),  -- Rafiq accepted → request "in_progress"
    ('Korban Ali',        '+8801711000010', 'withdrawn'::response_status, false, 1),  -- Shabnur accepted then withdrew → contributed to "unfulfilled"
    ('Korban Ali',        '+8801711000006', 'declined'::response_status,  false, 1)   -- Sadia also declined
) AS response(patient_name, donor_phone, status, confirmed, days_ago)
JOIN blood_requests br ON br.patient_name = response.patient_name
JOIN users donor ON donor.phone = response.donor_phone;

-- -----------------------------------------------------------------------------
-- 7) DONATIONS
-- -----------------------------------------------------------------------------
-- (a) The request-linked donation for the fulfilled request (Nusrat → Nayeem).
--     recipient_confirmed=true closes the loop and backs the "fulfilled" state.
-- (b) Standalone historical donations (request_id = NULL) so the "donation
--     history" and eligibility screens show past activity for the veterans.
-- -----------------------------------------------------------------------------

-- (a) request-linked donation
INSERT INTO donations (id, donor_profile_id, request_id, donation_date, units, recipient_confirmed, created_at)
SELECT gen_random_uuid(), dp.id, br.id, (current_date - interval '10 days')::date, 1, true, now()
FROM donor_profiles dp
JOIN users donor ON donor.id = dp.user_id AND donor.phone = '+8801711000002'
JOIN blood_requests br ON br.patient_name = 'Nayeem Ahmed';

-- (b) historical, non-request donations
INSERT INTO donations (id, donor_profile_id, request_id, donation_date, units, recipient_confirmed, created_at)
SELECT gen_random_uuid(), dp.id, NULL, (current_date - (h.days_ago::text || ' days')::interval)::date, h.units, true, now()
FROM (
  VALUES
    ('+8801711000001', 120, 1),  -- Abdul Karim
    ('+8801711000001', 300, 1),
    ('+8801711000003', 200, 1),  -- Mehedi Hasan
    ('+8801711000005', 100, 1),  -- Rafiq Islam
    ('+8801711000010', 95,  2)   -- Shabnur Akhi
) AS h(donor_phone, days_ago, units)
JOIN users donor ON donor.phone = h.donor_phone
JOIN donor_profiles dp ON dp.user_id = donor.id;

-- -----------------------------------------------------------------------------
-- 8) NOTIFICATIONS  — every NotificationType, mix of read/unread
-- -----------------------------------------------------------------------------
--   new_request    → donor is alerted about a matching open request.
--   status_update  → recipient told their request changed state.
--   donor_response → recipient told a donor accepted.
--   announcement   → broadcast to a user.
-- reference_id points at the related request where relevant.
-- -----------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, type, title, body, reference_id, is_read, channel, created_at)
SELECT gen_random_uuid(), u.id, n.type, n.title, n.body, br.id, n.is_read, 'in_app', now() - (n.hours_ago::text || ' hours')::interval
FROM (
  VALUES
    ('+8801711000001', 'new_request'::notification_type,    'New matching blood request near you', 'A B+ emergency request was posted in Pakshi. Tap to view.',            'Ayesha Khatun',     false, 2),
    ('+8801811000002', 'status_update'::notification_type,  'Your request has been matched',       'Good news — a donor accepted your request for Md. Selim Hossain.',      'Md. Selim Hossain', false, 5),
    ('+8801811000002', 'donor_response'::notification_type, 'A donor accepted your request',       'Abdul Karim accepted your request. Please coordinate at the hospital.', 'Md. Selim Hossain', true,  6),
    ('+8801811000001', 'announcement'::notification_type,   'New announcement: verified donor drive','A donor verification drive is happening this Friday.',                 NULL,                false, 24)
) AS n(user_phone, type, title, body, patient_name, is_read, hours_ago)
JOIN users u ON u.phone = n.user_phone
LEFT JOIN blood_requests br ON br.patient_name = n.patient_name;

-- -----------------------------------------------------------------------------
-- 9) ANNOUNCEMENTS  — published (public feed) + one unpublished (admin draft)
-- -----------------------------------------------------------------------------
INSERT INTO announcements (id, author_id, title, body, is_published, created_at, updated_at)
SELECT gen_random_uuid(), admin_user.id, a.title, a.body, a.is_published, now(), now()
FROM (
  VALUES
    ('Verified donor drive this Friday',            'Local volunteers will help verify donor profiles at the thana office from 3 PM to 6 PM.',                                    true),
    ('Reminder: hospital screening is mandatory',   'RaktoSetu connects donors and recipients only. Screening and cross-matching must happen at the hospital.',                     true),
    ('Eid holiday blood stock appeal (draft)',      'Draft appeal for extra donors over the Eid holidays — not yet published, for testing the admin edit/publish flow.',           false)
) AS a(title, body, is_published)
JOIN users admin_user ON admin_user.phone = '+8801700000000';

-- -----------------------------------------------------------------------------
-- 10) AUDIT LOGS  — one row per real admin action the app records
-- -----------------------------------------------------------------------------
-- Actions mirror those written by the services (see admin/*.service.ts):
--   request.publish, donor.verify, user.status_update, request.assign,
--   settings.update. Every row is tagged with metadata.source so the cleanup
--   above can find and replace them on re-run.
-- entity_id must be a real uuid; we point each log at the relevant row.
-- -----------------------------------------------------------------------------

-- request.publish → the published request
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'request.publish', 'blood_request', br.id,
       '{"source":"docs/seed/seed.sql","from":"pending_review","to":"published"}'::jsonb, now()
FROM users admin_user
JOIN blood_requests br ON br.patient_name = 'Ayesha Khatun'
WHERE admin_user.phone = '+8801700000000';

-- request.assign → donor assigned to the matched request
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'request.assign', 'blood_request', br.id,
       '{"source":"docs/seed/seed.sql","donorPhone":"+8801711000001"}'::jsonb, now()
FROM users admin_user
JOIN blood_requests br ON br.patient_name = 'Md. Selim Hossain'
WHERE admin_user.phone = '+8801700000000';

-- donor.verify → the donor whose verification was approved
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'donor.verify', 'donor_profile', dp.id,
       '{"source":"docs/seed/seed.sql","result":"verified"}'::jsonb, now()
FROM users admin_user
JOIN users donor ON donor.phone = '+8801711000001'
JOIN donor_profiles dp ON dp.user_id = donor.id
WHERE admin_user.phone = '+8801700000000';

-- user.status_update → the suspended user
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'user.status_update', 'user', target.id,
       '{"source":"docs/seed/seed.sql","from":"active","to":"suspended"}'::jsonb, now()
FROM users admin_user
JOIN users target ON target.phone = '+8801711000012'
WHERE admin_user.phone = '+8801700000000';

-- settings.update → cooldown days changed
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'settings.update', 'settings', admin_user.id,
       '{"source":"docs/seed/seed.sql","donorCooldownDays":90}'::jsonb, now()
FROM users admin_user
WHERE admin_user.phone = '+8801700000000';

-- -----------------------------------------------------------------------------
-- 11) AUTH TOKENS  — every AuthTokenPurpose (otp, password_reset, session, refresh)
-- -----------------------------------------------------------------------------
-- token_hash is sha256(plaintext) (see hashLookupToken in crypto.ts). The
-- plaintext values below are USABLE so you can exercise the real flows:
--
--   OTP "123456"            → activate the pending recipient (+8801811000006)
--   Reset "reset-demo-token-0001"   → complete password reset for Jahid (+8801811000003)
--   Session "session-demo-token-0001" / Refresh "refresh-demo-token-0001" → Abdul Karim
--
-- Also included: a used+expired OTP and an expired session, to test that
-- expired/used tokens are rejected and that admin/cleanup screens show them.
-- -----------------------------------------------------------------------------
INSERT INTO auth_tokens (id, user_id, phone, token_hash, purpose, expires_at, used_at, created_at)
SELECT gen_random_uuid(), u.id, t.phone, t.token_hash, t.purpose, t.expires_at, t.used_at, t.created_at
FROM (
  VALUES
    -- active OTP for the pending-verification recipient (plaintext: 123456)
    ('+8801811000006', '+8801811000006', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'otp'::auth_token_purpose,            now() + interval '10 minutes', NULL::timestamptz,             now()),
    -- used + expired OTP (plaintext: 654321) — should be rejected
    ('+8801811000006', '+8801811000006', '481f6cc0511143ccdd7e2d1b1b94faf0a700a8b49cd13922a70b5ae28acaa8c5', 'otp'::auth_token_purpose,            now() - interval '30 minutes', now() - interval '25 minutes', now() - interval '40 minutes'),
    -- active password-reset token (plaintext: reset-demo-token-0001)
    ('+8801811000003', '+8801811000003', '288b65b52bec40cbf76e42dd6b08cedc0540c4207c83ba1a6bc91e36e80093a7', 'password_reset'::auth_token_purpose, now() + interval '30 minutes', NULL::timestamptz,             now()),
    -- active session token (plaintext: session-demo-token-0001)
    ('+8801711000001', NULL,             'c186a1769aa0af2df30509971aee12d76a5e22cbf09a470df837be8c5ee1050c', 'session'::auth_token_purpose,        now() + interval '7 days',     NULL::timestamptz,             now()),
    -- active refresh token (plaintext: refresh-demo-token-0001)
    ('+8801711000001', NULL,             '3249692e6adf70f45fd6db1fe6a3e9fa667f55cb70f2aab1c71d2fbc62224a79', 'refresh'::auth_token_purpose,        now() + interval '30 days',    NULL::timestamptz,             now()),
    -- expired session token (plaintext: session-demo-token-expired)
    ('+8801711000001', NULL,             'c46f5006ea5cf2b4fc544e7b5219643046076603ceb51e1880a7d17a5cad6fe4', 'session'::auth_token_purpose,        now() - interval '1 day',      NULL::timestamptz,             now() - interval '8 days')
) AS t(user_phone, phone, token_hash, purpose, expires_at, used_at, created_at)
JOIN users u ON u.phone = t.user_phone;

COMMIT;

-- =============================================================================
-- COVERAGE MAP  (what this seed lets you verify)
-- =============================================================================
--  Enum / feature            | Rows that exercise it
--  --------------------------+-----------------------------------------------
--  Role                      | admin (1), donor (12), recipient (7)
--  BloodGroup                | all 8 present across donors + requests
--  UserStatus                | active, pending_verification, suspended, deleted
--  DonorVerification         | verified, unverified, rejected
--  Donor availability        | available + unavailable (cooldown)
--  Eligibility (cooldown)    | eligible now vs. next_eligible in the future
--  RequestUrgency            | routine, urgent, emergency
--  RequestStatus             | all 9 (draft → unfulfilled)
--  ResponseStatus            | accepted, declined, withdrawn
--  Donations                 | request-linked + standalone historical
--  NotificationType          | new_request, status_update, donor_response, announcement
--  Notification read state   | read + unread
--  Announcements             | published (public) + unpublished (draft)
--  AuditLog actions          | request.publish, request.assign, donor.verify,
--                            |   user.status_update, settings.update
--  AuthTokenPurpose          | otp, password_reset, session, refresh
--  Auth token state          | active, used, expired
--  Settings                  | donorCooldownDays + extra generic rows
--  Locations                 | 4 unions × villages (2-level hierarchy)
-- =============================================================================
