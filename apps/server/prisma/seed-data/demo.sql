BEGIN;

INSERT INTO settings (id, key, value, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'donorCooldownDays',
  '{"donorCooldownDays":90}'::jsonb,
  'Minimum days between donor completions',
  now(),
  now()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();

WITH unions(name, type) AS (
  VALUES
    ('Ishwardi', 'union'),
    ('Atghoria', 'union'),
    ('Santhia', 'union'),
    ('Bera', 'union')
)
INSERT INTO locations (id, name, type, parent_id, created_at, updated_at)
SELECT gen_random_uuid(), name, type, NULL, now(), now()
FROM unions
WHERE NOT EXISTS (
  SELECT 1 FROM locations WHERE locations.name = unions.name AND locations.type = unions.type AND locations.parent_id IS NULL
);

WITH villages(name, parent_name) AS (
  VALUES
    ('Pakshi', 'Ishwardi'),
    ('Dashuria', 'Ishwardi'),
    ('Muladuli', 'Ishwardi'),
    ('Debottar', 'Atghoria'),
    ('Chandva', 'Atghoria'),
    ('Khetupara', 'Santhia'),
    ('Ataikula', 'Santhia'),
    ('Kashinathpur', 'Bera'),
    ('Nakalia', 'Bera')
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

WITH seed_users(full_name, phone, email, role, blood_group, location_name) AS (
  VALUES
    ('RaktoSetu Admin', '+8801700000000', 'admin@example.com', 'admin'::role, NULL::blood_group, 'Pakshi'),
    ('Abdul Karim', '+8801711000001', 'abdul.karim@example.com', 'donor'::role, 'O+'::blood_group, 'Pakshi'),
    ('Nusrat Jahan', '+8801711000002', 'nusrat.jahan@example.com', 'donor'::role, 'A+'::blood_group, 'Dashuria'),
    ('Mehedi Hasan', '+8801711000003', 'mehedi.hasan@example.com', 'donor'::role, 'B+'::blood_group, 'Debottar'),
    ('Farhana Akter', '+8801711000004', 'farhana.akter@example.com', 'donor'::role, 'AB+'::blood_group, 'Kashinathpur'),
    ('Rafiq Islam', '+8801711000005', 'rafiq.islam@example.com', 'donor'::role, 'O-'::blood_group, 'Ataikula'),
    ('Sadia Rahman', '+8801711000006', 'sadia.rahman@example.com', 'donor'::role, 'A-'::blood_group, 'Nakalia'),
    ('Tanvir Ahmed', '+8801711000007', 'tanvir.ahmed@example.com', 'donor'::role, 'B-'::blood_group, 'Muladuli'),
    ('Mst. Halima Begum', '+8801711000008', 'halima.begum@example.com', 'donor'::role, 'AB-'::blood_group, 'Chandva'),
    ('Mizanur Rahman', '+8801811000001', 'mizanur.rahman@example.com', 'recipient'::role, 'B+'::blood_group, 'Pakshi'),
    ('Sharmin Sultana', '+8801811000002', 'sharmin.sultana@example.com', 'recipient'::role, 'O+'::blood_group, 'Kashinathpur'),
    ('Jahid Hossain', '+8801811000003', 'jahid.hossain@example.com', 'recipient'::role, 'A-'::blood_group, 'Debottar'),
    ('Tasnim Akter', '+8801811000004', 'tasnim.akter@example.com', 'recipient'::role, 'A+'::blood_group, 'Ataikula')
)
INSERT INTO users (
  id,
  full_name,
  phone,
  email,
  password_hash,
  role,
  blood_group,
  location_id,
  status,
  phone_verified,
  preferred_language,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  seed_users.full_name,
  seed_users.phone,
  seed_users.email,
  'f3f325bc8da8f65bde0a3372ac90790f:d229e936f9360133a1032c244d17d76c5de4f063cfd4b1e66c9a87e781d9de3ba11122a859b17d95c314c945a7826bde169b6c5a730d8a817ad948bb3d0b3066',
  seed_users.role,
  seed_users.blood_group,
  locations.id,
  'active'::user_status,
  true,
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

WITH donor_seed(phone, blood_group, is_available, verification, last_donation_date, next_eligible_date, total_donations, notes) AS (
  VALUES
    ('+8801711000001', 'O+'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 5, 'Usually available after office hours.'),
    ('+8801711000002', 'A+'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 3, NULL),
    ('+8801711000003', 'B+'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 4, NULL),
    ('+8801711000004', 'AB+'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 2, NULL),
    ('+8801711000005', 'O-'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 6, NULL),
    ('+8801711000006', 'A-'::blood_group, true, 'verified'::donor_verification, NULL::date, NULL::date, 1, NULL),
    ('+8801711000007', 'B-'::blood_group, true, 'unverified'::donor_verification, NULL::date, NULL::date, 0, NULL),
    ('+8801711000008', 'AB-'::blood_group, false, 'verified'::donor_verification, (current_date - interval '35 days')::date, (current_date + interval '55 days')::date, 2, 'Currently in cooldown after recent donation.')
)
INSERT INTO donor_profiles (
  id,
  user_id,
  blood_group,
  is_available,
  verification,
  last_donation_date,
  next_eligible_date,
  total_donations,
  notes,
  created_at,
  updated_at
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

DELETE FROM donations
WHERE request_id IN (
  SELECT id FROM blood_requests
  WHERE patient_name IN ('Ayesha Khatun', 'Md. Selim Hossain', 'Rokeya Begum', 'Nayeem Ahmed', 'Rahima Begum')
);

DELETE FROM request_responses
WHERE request_id IN (
  SELECT id FROM blood_requests
  WHERE patient_name IN ('Ayesha Khatun', 'Md. Selim Hossain', 'Rokeya Begum', 'Nayeem Ahmed', 'Rahima Begum')
);

DELETE FROM audit_logs WHERE action = 'seed.demo_data';
DELETE FROM notifications WHERE title = 'Demo data ready';
DELETE FROM announcements WHERE title IN ('Verified donor drive this Friday', 'Reminder: hospital screening is mandatory');

DELETE FROM blood_requests
WHERE patient_name IN ('Ayesha Khatun', 'Md. Selim Hossain', 'Rokeya Begum', 'Nayeem Ahmed', 'Rahima Begum');

WITH request_seed(recipient_phone, patient_name, patient_age, blood_group, units_needed, units_fulfilled, hospital_name, location_name, urgency, needed_by, status, notes) AS (
  VALUES
    ('+8801811000001', 'Ayesha Khatun', 42, 'B+'::blood_group, 2, 0, 'Pabna General Hospital', 'Pakshi', 'emergency'::request_urgency, now() + interval '1 day', 'published'::request_status, 'Surgery scheduled tomorrow morning.'),
    ('+8801811000002', 'Md. Selim Hossain', 55, 'O+'::blood_group, 1, 0, 'Ishwardi Upazila Health Complex', 'Dashuria', 'urgent'::request_urgency, now() + interval '2 days', 'matched'::request_status, 'Doctor requested one donor before transfusion.'),
    ('+8801811000003', 'Rokeya Begum', 63, 'A-'::blood_group, 1, 0, 'Bera Health Complex', 'Kashinathpur', 'routine'::request_urgency, now() + interval '5 days', 'pending_review'::request_status, 'Planned procedure, pending admin review.'),
    ('+8801811000004', 'Nayeem Ahmed', 19, 'A+'::blood_group, 1, 1, 'Pabna Medical College Hospital', 'Ataikula', 'urgent'::request_urgency, now() - interval '10 days', 'fulfilled'::request_status, 'Completed demo request with mutual confirmation.'),
    ('+8801811000001', 'Rahima Begum', 35, 'AB+'::blood_group, 2, 0, 'Pabna General Hospital', 'Debottar', 'routine'::request_urgency, now() - interval '3 days', 'expired'::request_status, 'Expired demo request for admin/report screens.')
)
INSERT INTO blood_requests (
  id,
  recipient_id,
  patient_name,
  patient_age,
  blood_group,
  units_needed,
  units_fulfilled,
  hospital_name,
  location_id,
  urgency,
  needed_by,
  status,
  notes,
  reviewed_by,
  created_at,
  updated_at
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
  admin_user.id,
  now(),
  now()
FROM request_seed
JOIN users recipient ON recipient.phone = request_seed.recipient_phone
JOIN locations ON locations.name = request_seed.location_name
LEFT JOIN users admin_user ON admin_user.phone = '+8801700000000';

INSERT INTO request_responses (
  id,
  request_id,
  donor_id,
  status,
  responded_at,
  donor_confirmed_completion,
  recipient_confirmed_completion,
  created_at,
  updated_at
)
SELECT gen_random_uuid(), br.id, donor.id, response.status, now(), response.confirmed, response.confirmed, now(), now()
FROM (
  VALUES
    ('Ayesha Khatun', '+8801711000003', 'declined'::response_status, false),
    ('Md. Selim Hossain', '+8801711000001', 'accepted'::response_status, false),
    ('Nayeem Ahmed', '+8801711000002', 'accepted'::response_status, true)
) AS response(patient_name, donor_phone, status, confirmed)
JOIN blood_requests br ON br.patient_name = response.patient_name
JOIN users donor ON donor.phone = response.donor_phone
ON CONFLICT (request_id, donor_id) DO UPDATE
SET status = EXCLUDED.status,
    responded_at = EXCLUDED.responded_at,
    donor_confirmed_completion = EXCLUDED.donor_confirmed_completion,
    recipient_confirmed_completion = EXCLUDED.recipient_confirmed_completion,
    updated_at = now();

INSERT INTO donations (
  id,
  donor_profile_id,
  request_id,
  donation_date,
  units,
  recipient_confirmed,
  created_at
)
SELECT gen_random_uuid(), donor_profiles.id, blood_requests.id, (current_date - interval '10 days')::date, 1, true, now()
FROM donor_profiles
JOIN users donor ON donor.id = donor_profiles.user_id AND donor.phone = '+8801711000002'
JOIN blood_requests ON blood_requests.patient_name = 'Nayeem Ahmed'
ON CONFLICT (donor_profile_id, request_id) DO UPDATE
SET donation_date = EXCLUDED.donation_date,
    units = EXCLUDED.units,
    recipient_confirmed = EXCLUDED.recipient_confirmed;

INSERT INTO notifications (id, user_id, type, title, body, reference_id, is_read, channel, created_at)
SELECT gen_random_uuid(), users.id, 'status_update'::notification_type, 'Demo data ready', 'Your RaktoSetu demo account has realistic seeded activity.', NULL, false, 'in_app', now()
FROM users
WHERE users.phone IN ('+8801811000001', '+8801811000002', '+8801711000001');

INSERT INTO announcements (id, author_id, title, body, is_published, created_at, updated_at)
SELECT gen_random_uuid(), admin_user.id, announcement.title, announcement.body, true, now(), now()
FROM (
  VALUES
    ('Verified donor drive this Friday', 'Local volunteers will help verify donor profiles at the thana office from 3 PM to 6 PM.'),
    ('Reminder: hospital screening is mandatory', 'RaktoSetu connects donors and recipients only. Screening and cross-matching must happen at the hospital.')
) AS announcement(title, body)
JOIN users admin_user ON admin_user.phone = '+8801700000000';

INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
SELECT gen_random_uuid(), admin_user.id, 'seed.demo_data', 'blood_request', blood_requests.id, '{"source":"prisma/seed-data/demo.sql"}'::jsonb, now()
FROM users admin_user
JOIN blood_requests ON blood_requests.patient_name = 'Ayesha Khatun'
WHERE admin_user.phone = '+8801700000000';

COMMIT;
