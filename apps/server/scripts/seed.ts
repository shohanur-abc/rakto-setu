import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  BloodGroup,
  DonorVerification,
  NotificationType,
  PrismaClient,
  RequestStatus,
  RequestUrgency,
  ResponseStatus,
  Role,
  UserStatus,
} from '@prisma/client';
import {
  DEFAULT_DONOR_COOLDOWN_DAYS,
  DONOR_COOLDOWN_DAYS_KEY,
} from '../src/common/settings.service';
import { addDays } from '../src/common/utils/date';
import { hashPassword } from '../src/common/utils/crypto';

type LocationSeed = {
  name: string;
  type: string;
  children?: LocationSeed[];
};

type SeedUser = {
  fullName: string;
  phone: string;
  email?: string;
  role: Role;
  bloodGroup?: BloodGroup;
  locationName: string;
  preferredLanguage?: string;
};

process.loadEnvFile?.();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new TypeError('DATABASE_URL is required for seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const demoPassword = process.env.SEED_DEMO_PASSWORD ?? 'DemoPass123!';
const today = new Date();

const defaultLocations: LocationSeed[] = [
  {
    name: 'Ishwardi',
    type: 'union',
    children: [
      { name: 'Pakshi', type: 'village' },
      { name: 'Dashuria', type: 'village' },
      { name: 'Muladuli', type: 'village' },
    ],
  },
  {
    name: 'Atghoria',
    type: 'union',
    children: [
      { name: 'Debottar', type: 'village' },
      { name: 'Chandva', type: 'village' },
    ],
  },
  {
    name: 'Santhia',
    type: 'union',
    children: [
      { name: 'Khetupara', type: 'village' },
      { name: 'Ataikula', type: 'village' },
    ],
  },
  {
    name: 'Bera',
    type: 'union',
    children: [
      { name: 'Kashinathpur', type: 'village' },
      { name: 'Nakalia', type: 'village' },
    ],
  },
];

const donorSeeds: Array<SeedUser & {
  verification: DonorVerification;
  isAvailable: boolean;
  lastDonationDate?: Date;
  totalDonations: number;
  notes?: string;
}> = [
  {
    fullName: 'Abdul Karim',
    phone: '+8801711000001',
    email: 'abdul.karim@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.O_POSITIVE,
    locationName: 'Pakshi',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 5,
    notes: 'Usually available after office hours.',
  },
  {
    fullName: 'Nusrat Jahan',
    phone: '+8801711000002',
    email: 'nusrat.jahan@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.A_POSITIVE,
    locationName: 'Dashuria',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 3,
  },
  {
    fullName: 'Mehedi Hasan',
    phone: '+8801711000003',
    email: 'mehedi.hasan@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.B_POSITIVE,
    locationName: 'Debottar',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 4,
  },
  {
    fullName: 'Farhana Akter',
    phone: '+8801711000004',
    email: 'farhana.akter@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.AB_POSITIVE,
    locationName: 'Kashinathpur',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 2,
  },
  {
    fullName: 'Rafiq Islam',
    phone: '+8801711000005',
    email: 'rafiq.islam@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.O_NEGATIVE,
    locationName: 'Ataikula',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 6,
  },
  {
    fullName: 'Sadia Rahman',
    phone: '+8801711000006',
    email: 'sadia.rahman@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.A_NEGATIVE,
    locationName: 'Nakalia',
    verification: DonorVerification.VERIFIED,
    isAvailable: true,
    totalDonations: 1,
  },
  {
    fullName: 'Tanvir Ahmed',
    phone: '+8801711000007',
    email: 'tanvir.ahmed@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.B_NEGATIVE,
    locationName: 'Muladuli',
    verification: DonorVerification.UNVERIFIED,
    isAvailable: true,
    totalDonations: 0,
  },
  {
    fullName: 'Mst. Halima Begum',
    phone: '+8801711000008',
    email: 'halima.begum@example.com',
    role: Role.DONOR,
    bloodGroup: BloodGroup.AB_NEGATIVE,
    locationName: 'Chandva',
    verification: DonorVerification.VERIFIED,
    isAvailable: false,
    lastDonationDate: addDays(today, -35),
    totalDonations: 2,
    notes: 'Currently in cooldown after recent donation.',
  },
];

const recipientSeeds: SeedUser[] = [
  {
    fullName: 'Mizanur Rahman',
    phone: '+8801811000001',
    email: 'mizanur.rahman@example.com',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.B_POSITIVE,
    locationName: 'Pakshi',
  },
  {
    fullName: 'Sharmin Sultana',
    phone: '+8801811000002',
    email: 'sharmin.sultana@example.com',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.O_POSITIVE,
    locationName: 'Kashinathpur',
  },
  {
    fullName: 'Jahid Hossain',
    phone: '+8801811000003',
    email: 'jahid.hossain@example.com',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.A_NEGATIVE,
    locationName: 'Debottar',
  },
  {
    fullName: 'Tasnim Akter',
    phone: '+8801811000004',
    email: 'tasnim.akter@example.com',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.A_POSITIVE,
    locationName: 'Ataikula',
  },
];

const seedAdmin = async () => {
  const phone = process.env.SEED_ADMIN_PHONE;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!phone || !password) {
    process.stdout.write('Skipping admin seed: SEED_ADMIN_PHONE/PASSWORD missing\n');
    return;
  }

  await prisma.user.upsert({
    where: { phone },
    create: {
      fullName: process.env.SEED_ADMIN_FULL_NAME ?? 'RaktoSetu Admin',
      phone,
      email: process.env.SEED_ADMIN_EMAIL,
      passwordHash: await hashPassword(password),
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
      preferredLanguage: 'bn',
    },
    update: {
      fullName: process.env.SEED_ADMIN_FULL_NAME ?? 'RaktoSetu Admin',
      email: process.env.SEED_ADMIN_EMAIL,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
    },
  });

  process.stdout.write(`Seeded admin ${phone}\n`);
};

const seedSettings = async () => {
  await prisma.setting.upsert({
    where: { key: DONOR_COOLDOWN_DAYS_KEY },
    create: {
      key: DONOR_COOLDOWN_DAYS_KEY,
      value: { donorCooldownDays: DEFAULT_DONOR_COOLDOWN_DAYS },
      description: 'Minimum days between donor completions',
    },
    update: {},
  });
};

const upsertLocation = async (seed: LocationSeed, parentId?: string) => {
  const existing = await prisma.location.findFirst({
    where: {
      name: seed.name,
      type: seed.type,
      parentId: parentId ?? null,
    },
  });
  const location = existing
    ? await prisma.location.update({
        where: { id: existing.id },
        data: {
          name: seed.name,
          type: seed.type,
          parentId,
        },
      })
    : await prisma.location.create({
        data: {
          name: seed.name,
          type: seed.type,
          parentId,
        },
      });

  for (const child of seed.children ?? []) {
    await upsertLocation(child, location.id);
  }

  return location;
};

const seedLocations = async () => {
  const seedPath = join(process.cwd(), 'prisma', 'seed-data', 'locations.json');
  const locations = existsSync(seedPath)
    ? (JSON.parse(readFileSync(seedPath, 'utf8')) as LocationSeed[])
    : defaultLocations;

  for (const location of locations) {
    await upsertLocation(location);
  }

  process.stdout.write(`Seeded ${locations.length} top-level locations\n`);
};

const getLocationByName = async (name: string) => {
  const location = await prisma.location.findFirst({ where: { name } });

  if (!location) {
    throw new TypeError(`Seed location not found: ${name}`);
  }

  return location;
};

const upsertSeedUser = async (seed: SeedUser) => {
  const location = await getLocationByName(seed.locationName);

  return prisma.user.upsert({
    where: { phone: seed.phone },
    create: {
      fullName: seed.fullName,
      phone: seed.phone,
      email: seed.email,
      passwordHash: await hashPassword(demoPassword),
      role: seed.role,
      bloodGroup: seed.bloodGroup,
      locationId: location.id,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
      preferredLanguage: seed.preferredLanguage ?? 'bn',
    },
    update: {
      fullName: seed.fullName,
      email: seed.email,
      role: seed.role,
      bloodGroup: seed.bloodGroup,
      locationId: location.id,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
      preferredLanguage: seed.preferredLanguage ?? 'bn',
    },
  });
};

const seedUsersAndDonors = async () => {
  for (const recipient of recipientSeeds) {
    await upsertSeedUser(recipient);
  }

  for (const donor of donorSeeds) {
    const user = await upsertSeedUser(donor);
    const nextEligibleDate = donor.lastDonationDate
      ? addDays(donor.lastDonationDate, DEFAULT_DONOR_COOLDOWN_DAYS)
      : null;

    await prisma.donorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bloodGroup: donor.bloodGroup ?? BloodGroup.O_POSITIVE,
        isAvailable: donor.isAvailable,
        verification: donor.verification,
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate,
        totalDonations: donor.totalDonations,
        notes: donor.notes,
      },
      update: {
        bloodGroup: donor.bloodGroup ?? BloodGroup.O_POSITIVE,
        isAvailable: donor.isAvailable,
        verification: donor.verification,
        lastDonationDate: donor.lastDonationDate ?? null,
        nextEligibleDate,
        totalDonations: donor.totalDonations,
        notes: donor.notes,
      },
    });
  }

  process.stdout.write(
    `Seeded ${recipientSeeds.length} recipients and ${donorSeeds.length} donors\n`,
  );
};

const upsertRequestByPatient = async (input: {
  recipientPhone: string;
  patientName: string;
  patientAge?: number;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled?: number;
  hospitalName: string;
  locationName: string;
  urgency: RequestUrgency;
  neededBy: Date;
  status: RequestStatus;
  notes?: string;
  reviewedById?: string;
}) => {
  const recipient = await prisma.user.findUniqueOrThrow({
    where: { phone: input.recipientPhone },
  });
  const location = await getLocationByName(input.locationName);
  const existing = await prisma.bloodRequest.findFirst({
    where: {
      recipientId: recipient.id,
      patientName: input.patientName,
      hospitalName: input.hospitalName,
    },
  });
  const data = {
    recipientId: recipient.id,
    patientName: input.patientName,
    patientAge: input.patientAge,
    bloodGroup: input.bloodGroup,
    unitsNeeded: input.unitsNeeded,
    unitsFulfilled: input.unitsFulfilled ?? 0,
    hospitalName: input.hospitalName,
    locationId: location.id,
    urgency: input.urgency,
    neededBy: input.neededBy,
    status: input.status,
    notes: input.notes,
    reviewedById: input.reviewedById,
  };

  return existing
    ? prisma.bloodRequest.update({ where: { id: existing.id }, data })
    : prisma.bloodRequest.create({ data });
};

const upsertResponse = async (
  requestId: string,
  donorPhone: string,
  status: ResponseStatus,
  confirmed = false,
) => {
  const donor = await prisma.user.findUniqueOrThrow({ where: { phone: donorPhone } });

  return prisma.requestResponse.upsert({
    where: { requestId_donorId: { requestId, donorId: donor.id } },
    create: {
      requestId,
      donorId: donor.id,
      status,
      donorConfirmedCompletion: confirmed,
      recipientConfirmedCompletion: confirmed,
    },
    update: {
      status,
      donorConfirmedCompletion: confirmed,
      recipientConfirmedCompletion: confirmed,
    },
  });
};

const seedRequestsAndActivity = async () => {
  const admin = await prisma.user.findUnique({
    where: { phone: process.env.SEED_ADMIN_PHONE ?? '+8801700000000' },
  });

  const requests = [
    await upsertRequestByPatient({
      recipientPhone: '+8801811000001',
      patientName: 'Ayesha Khatun',
      patientAge: 42,
      bloodGroup: BloodGroup.B_POSITIVE,
      unitsNeeded: 2,
      hospitalName: 'Pabna General Hospital',
      locationName: 'Pakshi',
      urgency: RequestUrgency.EMERGENCY,
      neededBy: addDays(today, 1),
      status: RequestStatus.PUBLISHED,
      notes: 'Surgery scheduled tomorrow morning.',
      reviewedById: admin?.id,
    }),
    await upsertRequestByPatient({
      recipientPhone: '+8801811000002',
      patientName: 'Md. Selim Hossain',
      patientAge: 55,
      bloodGroup: BloodGroup.O_POSITIVE,
      unitsNeeded: 1,
      hospitalName: 'Ishwardi Upazila Health Complex',
      locationName: 'Dashuria',
      urgency: RequestUrgency.URGENT,
      neededBy: addDays(today, 2),
      status: RequestStatus.MATCHED,
      notes: 'Doctor requested one donor before transfusion.',
      reviewedById: admin?.id,
    }),
    await upsertRequestByPatient({
      recipientPhone: '+8801811000003',
      patientName: 'Rokeya Begum',
      patientAge: 63,
      bloodGroup: BloodGroup.A_NEGATIVE,
      unitsNeeded: 1,
      hospitalName: 'Bera Health Complex',
      locationName: 'Kashinathpur',
      urgency: RequestUrgency.ROUTINE,
      neededBy: addDays(today, 5),
      status: RequestStatus.PENDING_REVIEW,
      notes: 'Planned procedure, pending admin review.',
    }),
    await upsertRequestByPatient({
      recipientPhone: '+8801811000004',
      patientName: 'Nayeem Ahmed',
      patientAge: 19,
      bloodGroup: BloodGroup.A_POSITIVE,
      unitsNeeded: 1,
      unitsFulfilled: 1,
      hospitalName: 'Pabna Medical College Hospital',
      locationName: 'Ataikula',
      urgency: RequestUrgency.URGENT,
      neededBy: addDays(today, -10),
      status: RequestStatus.FULFILLED,
      notes: 'Completed demo request with mutual confirmation.',
      reviewedById: admin?.id,
    }),
    await upsertRequestByPatient({
      recipientPhone: '+8801811000001',
      patientName: 'Rahima Begum',
      patientAge: 35,
      bloodGroup: BloodGroup.AB_POSITIVE,
      unitsNeeded: 2,
      hospitalName: 'Pabna General Hospital',
      locationName: 'Debottar',
      urgency: RequestUrgency.ROUTINE,
      neededBy: addDays(today, -3),
      status: RequestStatus.EXPIRED,
      notes: 'Expired demo request for admin/report screens.',
      reviewedById: admin?.id,
    }),
  ];

  await upsertResponse(requests[0].id, '+8801711000003', ResponseStatus.DECLINED);
  await upsertResponse(requests[1].id, '+8801711000001', ResponseStatus.ACCEPTED);
  await upsertResponse(requests[3].id, '+8801711000002', ResponseStatus.ACCEPTED, true);

  const fulfilledDonor = await prisma.user.findUniqueOrThrow({
    where: { phone: '+8801711000002' },
    include: { donorProfile: true },
  });

  if (fulfilledDonor.donorProfile) {
    await prisma.donation.upsert({
      where: {
        donorProfileId_requestId: {
          donorProfileId: fulfilledDonor.donorProfile.id,
          requestId: requests[3].id,
        },
      },
      create: {
        donorProfileId: fulfilledDonor.donorProfile.id,
        requestId: requests[3].id,
        donationDate: addDays(today, -10),
        units: 1,
        recipientConfirmed: true,
      },
      update: {
        donationDate: addDays(today, -10),
        units: 1,
        recipientConfirmed: true,
      },
    });
  }

  process.stdout.write(`Seeded ${requests.length} blood requests with responses\n`);
};

const seedNotifications = async () => {
  const users = await prisma.user.findMany({
    where: { phone: { in: ['+8801811000001', '+8801811000002', '+8801711000001'] } },
  });

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.STATUS_UPDATE,
        title: 'Demo data ready',
        body: 'Your RaktoSetu demo account has realistic seeded activity.',
        channel: 'in_app',
      },
    });
  }

  process.stdout.write(`Seeded notifications for ${users.length} users\n`);
};

const seedAnnouncements = async () => {
  const admin = await prisma.user.findUnique({
    where: { phone: process.env.SEED_ADMIN_PHONE ?? '+8801700000000' },
  });

  if (!admin) {
    return;
  }

  const announcements = [
    {
      title: 'Verified donor drive this Friday',
      body: 'Local volunteers will help verify donor profiles at the thana office from 3 PM to 6 PM.',
    },
    {
      title: 'Reminder: hospital screening is mandatory',
      body: 'RaktoSetu connects donors and recipients only. Screening and cross-matching must happen at the hospital.',
    },
  ];

  for (const announcement of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: announcement.title },
    });

    if (existing) {
      await prisma.announcement.update({
        where: { id: existing.id },
        data: { ...announcement, authorId: admin.id, isPublished: true },
      });
    } else {
      await prisma.announcement.create({
        data: { ...announcement, authorId: admin.id, isPublished: true },
      });
    }
  }

  process.stdout.write(`Seeded ${announcements.length} announcements\n`);
};

const seedAuditLogs = async () => {
  const admin = await prisma.user.findUnique({
    where: { phone: process.env.SEED_ADMIN_PHONE ?? '+8801700000000' },
  });
  const request = await prisma.bloodRequest.findFirst({
    where: { status: RequestStatus.PUBLISHED },
  });

  if (!admin || !request) {
    return;
  }

  const existing = await prisma.auditLog.findFirst({
    where: {
      actorId: admin.id,
      action: 'seed.demo_data',
      entityId: request.id,
    },
  });

  if (!existing) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'seed.demo_data',
        entityType: 'blood_request',
        entityId: request.id,
        metadata: { source: 'scripts/seed.ts' },
      },
    });
  }
};

const main = async () => {
  await seedSettings();
  await seedAdmin();
  await seedLocations();
  await seedUsersAndDonors();
  await seedRequestsAndActivity();
  await seedNotifications();
  await seedAnnouncements();
  await seedAuditLogs();

  process.stdout.write(`Demo password for seeded users: ${demoPassword}\n`);
};

main()
  .catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
