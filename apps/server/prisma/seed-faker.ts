// @ts-nocheck
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { BloodGroup, DonorVerification, NotificationType, PrismaClient, RequestStatus, RequestUrgency, ResponseStatus, Role, UserStatus } from '@prisma/client';
import { hashPassword } from '../src/common/utils/crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

faker.seed(20260706);

const PASSWORD = 'DummyPass123!';
const EMAIL_DOMAIN = 'dummy.raktosetu.test';

const DONOR_COUNT = 80;
const RECIPIENT_COUNT = 40;

type EnumMap<T extends string> = Record<string, T>;

function normalizeEnumToken(value: string) {
    return value.toLowerCase().replace(/[_\-\s]/g, '');
}

function enumValues<T extends string>(enumObject: EnumMap<T>): T[] {
    return Object.values(enumObject) as T[];
}

function optionalEnumValue<T extends string>(
    enumObject: EnumMap<T>,
    candidates: string[],
): T | null {
    for (const candidate of candidates) {
        if (enumObject[candidate]) {
            return enumObject[candidate];
        }
    }

    const normalizedCandidates = candidates.map(normalizeEnumToken);

    for (const [key, value] of Object.entries(enumObject)) {
        if (
            normalizedCandidates.includes(normalizeEnumToken(key)) ||
            normalizedCandidates.includes(normalizeEnumToken(String(value)))
        ) {
            return value as T;
        }
    }

    return null;
}

function enumValue<T extends string>(
    enumObject: EnumMap<T>,
    candidates: string[],
    label: string,
): T {
    const value = optionalEnumValue(enumObject, candidates);

    if (!value) {
        throw new Error(
            `Could not find enum value for ${label}. Tried: ${candidates.join(
                ', ',
            )}`,
        );
    }

    return value;
}

const ROLE_ADMIN = enumValue(Role as EnumMap<Role>, ['ADMIN', 'admin'], 'ADMIN');
const ROLE_DONOR = enumValue(Role as EnumMap<Role>, ['DONOR', 'donor'], 'DONOR');
const ROLE_RECIPIENT = enumValue(
    Role as EnumMap<Role>,
    ['RECIPIENT', 'recipient'],
    'RECIPIENT',
);

const USER_ACTIVE = enumValue(
    UserStatus as EnumMap<UserStatus>,
    ['ACTIVE', 'active'],
    'ACTIVE',
);

const RESPONSE_ACCEPTED = enumValue(
    ResponseStatus as EnumMap<ResponseStatus>,
    ['ACCEPTED', 'accepted'],
    'ACCEPTED',
);

const RESPONSE_DECLINED =
    optionalEnumValue(ResponseStatus as EnumMap<ResponseStatus>, [
        'DECLINED',
        'declined',
    ]) ?? RESPONSE_ACCEPTED;

const RESPONSE_WITHDRAWN =
    optionalEnumValue(ResponseStatus as EnumMap<ResponseStatus>, [
        'WITHDRAWN',
        'withdrawn',
    ]) ?? RESPONSE_DECLINED;

const NOTIFICATION_ANNOUNCEMENT = enumValue(
    NotificationType as EnumMap<NotificationType>,
    ['ANNOUNCEMENT', 'announcement'],
    'ANNOUNCEMENT',
);

const NOTIFICATION_STATUS_UPDATE =
    optionalEnumValue(NotificationType as EnumMap<NotificationType>, [
        'STATUS_UPDATE',
        'status_update',
    ]) ?? NOTIFICATION_ANNOUNCEMENT;

const NOTIFICATION_DONOR_RESPONSE =
    optionalEnumValue(NotificationType as EnumMap<NotificationType>, [
        'DONOR_RESPONSE',
        'donor_response',
    ]) ?? NOTIFICATION_ANNOUNCEMENT;

const BLOOD_GROUPS = enumValues(BloodGroup as EnumMap<BloodGroup>);

const URGENCIES = enumValues(
    RequestUrgency as EnumMap<RequestUrgency>,
).filter(Boolean);

const DONOR_VERIFICATIONS = enumValues(
    DonorVerification as EnumMap<DonorVerification>,
).filter(Boolean);

const STATUS_PLAN_CONFIG = [
    {
        candidates: ['PENDING_REVIEW', 'pending_review'],
        count: 18,
    },
    {
        candidates: ['PUBLISHED', 'published'],
        count: 35,
    },
    {
        candidates: ['MATCHED', 'matched'],
        count: 18,
    },
    {
        candidates: ['IN_PROGRESS', 'in_progress'],
        count: 10,
        optional: true,
    },
    {
        candidates: ['FULFILLED', 'fulfilled'],
        count: 22,
    },
    {
        candidates: ['CANCELLED', 'cancelled'],
        count: 8,
        optional: true,
    },
    {
        candidates: ['EXPIRED', 'expired'],
        count: 10,
    },
    {
        candidates: ['UNFULFILLED', 'unfulfilled'],
        count: 6,
        optional: true,
    },
];

const STATUS_PLAN = STATUS_PLAN_CONFIG.flatMap((item) => {
    const status = optionalEnumValue(
        RequestStatus as EnumMap<RequestStatus>,
        item.candidates,
    );

    if (!status) {
        if (!item.optional) {
            throw new Error(
                `Required RequestStatus missing: ${item.candidates.join(
                    ', ',
                )}`,
            );
        }

        console.log(
            `Skipping optional status because enum is missing: ${item.candidates.join(
                ', ',
            )}`,
        );

        return [];
    }

    return [{ status, count: item.count }];
});

const PENDING_REVIEW_STATUS = enumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['PENDING_REVIEW', 'pending_review'],
    'PENDING_REVIEW',
);

const PUBLISHED_STATUS = enumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['PUBLISHED', 'published'],
    'PUBLISHED',
);

const MATCHED_STATUS = enumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['MATCHED', 'matched'],
    'MATCHED',
);

const FULFILLED_STATUS = enumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['FULFILLED', 'fulfilled'],
    'FULFILLED',
);

const EXPIRED_STATUS = enumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['EXPIRED', 'expired'],
    'EXPIRED',
);

const IN_PROGRESS_STATUS = optionalEnumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['IN_PROGRESS', 'in_progress'],
);

const CANCELLED_STATUS = optionalEnumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['CANCELLED', 'cancelled'],
);

const UNFULFILLED_STATUS = optionalEnumValue(
    RequestStatus as EnumMap<RequestStatus>,
    ['UNFULFILLED', 'unfulfilled'],
);

const hospitalNames = [
    'Pabna General Hospital',
    'Pabna Medical College Hospital',
    'Ishwardi Upazila Health Complex',
    'Bera Upazila Health Complex',
    'Atghoria Upazila Health Complex',
    'Santhia Health Complex',
];

const firstNames = [
    'Abdul',
    'Rahim',
    'Karim',
    'Hasan',
    'Mizan',
    'Tanvir',
    'Rafiq',
    'Jahid',
    'Ayesha',
    'Nusrat',
    'Sadia',
    'Farhana',
    'Rokeya',
    'Halima',
    'Tasnim',
    'Sharmin',
];

const lastNames = [
    'Uddin',
    'Islam',
    'Hossain',
    'Rahman',
    'Ahmed',
    'Hasan',
    'Akter',
    'Jahan',
    'Begum',
    'Sultana',
];

type CreatedUser = {
    id: string;
    fullName: string;
    phone: string;
    bloodGroup: BloodGroup | null;
    locationId: string | null;
};

type CreatedDonor = {
    user: CreatedUser;
    profile: {
        id: string;
        userId: string;
        bloodGroup: BloodGroup;
    };
};

type CreatedRecipient = CreatedUser;

type CreatedLocation = {
    id: string;
    name: string;
    type: string;
    parentId: string | null;
};

function randomName() {
    return `${faker.helpers.arrayElement(firstNames)} ${faker.helpers.arrayElement(lastNames)}`;
}

function chance(probability: number) {
    return faker.number.float({ min: 0, max: 1 }) < probability;
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function buildStatusQueue() {
    return STATUS_PLAN.flatMap((item) =>
        Array.from({ length: item.count }, () => item.status),
    );
}

function isClosedStatus(status: RequestStatus) {
    return (
        status === FULFILLED_STATUS ||
        status === EXPIRED_STATUS ||
        status === CANCELLED_STATUS ||
        status === UNFULFILLED_STATUS
    );
}

function isMatchedLikeStatus(status: RequestStatus) {
    return (
        status === MATCHED_STATUS ||
        status === IN_PROGRESS_STATUS ||
        status === FULFILLED_STATUS
    );
}

async function getAvailableSeedPhone(serial: number, reserved: Set<string>) {
    for (let offset = 0; offset < 5000; offset++) {
        const candidateNumber = serial + offset;
        const phone = `+880199${candidateNumber
            .toString()
            .padStart(7, '0')}`;

        if (reserved.has(phone)) {
            continue;
        }

        const existing = await prisma.user.findFirst({
            where: { phone },
            select: {
                id: true,
                email: true,
            },
        });

        if (!existing) {
            reserved.add(phone);
            return phone;
        }

        if (existing.email?.endsWith(`@${EMAIL_DOMAIN}`)) {
            reserved.add(phone);
            return phone;
        }
    }

    throw new Error(`Could not find available dummy phone for serial ${serial}`);
}

async function cleanupOldDummyData() {
    console.log('Cleaning old dummy data...');

    const dummyUsers = await prisma.user.findMany({
        where: {
            email: {
                endsWith: `@${EMAIL_DOMAIN}`,
            },
        },
        select: { id: true },
    });

    const dummyUserIds = dummyUsers.map((user) => user.id);

    const dummyRequests = await prisma.bloodRequest.findMany({
        where: {
            OR: [
                {
                    notes: {
                        contains: 'Generated by faker seed',
                    },
                },
                ...(dummyUserIds.length > 0
                    ? [{ recipientId: { in: dummyUserIds } }]
                    : []),
            ],
        },
        select: { id: true },
    });

    const dummyRequestIds = dummyRequests.map((request) => request.id);

    const dummyDonorProfiles =
        dummyUserIds.length > 0
            ? await prisma.donorProfile.findMany({
                where: {
                    userId: {
                        in: dummyUserIds,
                    },
                },
                select: { id: true },
            })
            : [];

    const dummyDonorProfileIds = dummyDonorProfiles.map((profile) => profile.id);

    await prisma.auditLog.deleteMany({
        where: {
            OR: [
                {
                    action: {
                        startsWith: 'dummy.',
                    },
                },
                ...(dummyUserIds.length > 0
                    ? [
                        {
                            actorId: {
                                in: dummyUserIds,
                            },
                        },
                    ]
                    : []),
                ...(dummyRequestIds.length > 0
                    ? [
                        {
                            entityId: {
                                in: dummyRequestIds,
                            },
                        },
                    ]
                    : []),
                ...(dummyDonorProfileIds.length > 0
                    ? [
                        {
                            entityId: {
                                in: dummyDonorProfileIds,
                            },
                        },
                    ]
                    : []),
            ],
        },
    });

    await prisma.announcement.deleteMany({
        where: {
            OR: [
                {
                    title: {
                        startsWith: '[Dummy]',
                    },
                },
                ...(dummyUserIds.length > 0
                    ? [
                        {
                            authorId: {
                                in: dummyUserIds,
                            },
                        },
                    ]
                    : []),
            ],
        },
    });

    await prisma.notification.deleteMany({
        where: {
            OR: [
                {
                    title: {
                        startsWith: '[Dummy]',
                    },
                },
                ...(dummyUserIds.length > 0
                    ? [
                        {
                            userId: {
                                in: dummyUserIds,
                            },
                        },
                    ]
                    : []),
                ...(dummyRequestIds.length > 0
                    ? [
                        {
                            referenceId: {
                                in: dummyRequestIds,
                            },
                        },
                    ]
                    : []),
            ],
        },
    });

    if (dummyRequestIds.length > 0 || dummyDonorProfileIds.length > 0) {
        await prisma.donation.deleteMany({
            where: {
                OR: [
                    ...(dummyRequestIds.length > 0
                        ? [
                            {
                                requestId: {
                                    in: dummyRequestIds,
                                },
                            },
                        ]
                        : []),
                    ...(dummyDonorProfileIds.length > 0
                        ? [
                            {
                                donorProfileId: {
                                    in: dummyDonorProfileIds,
                                },
                            },
                        ]
                        : []),
                ],
            },
        });
    }

    if (dummyRequestIds.length > 0 || dummyUserIds.length > 0) {
        await prisma.requestResponse.deleteMany({
            where: {
                OR: [
                    ...(dummyRequestIds.length > 0
                        ? [
                            {
                                requestId: {
                                    in: dummyRequestIds,
                                },
                            },
                        ]
                        : []),
                    ...(dummyUserIds.length > 0
                        ? [
                            {
                                donorId: {
                                    in: dummyUserIds,
                                },
                            },
                        ]
                        : []),
                ],
            },
        });
    }

    if (dummyRequestIds.length > 0) {
        await prisma.bloodRequest.deleteMany({
            where: {
                id: {
                    in: dummyRequestIds,
                },
            },
        });
    }

    if (dummyDonorProfileIds.length > 0) {
        await prisma.donorProfile.deleteMany({
            where: {
                id: {
                    in: dummyDonorProfileIds,
                },
            },
        });
    }

    if (dummyUserIds.length > 0) {
        await prisma.authToken.deleteMany({
            where: {
                userId: {
                    in: dummyUserIds,
                },
            },
        });

        await prisma.user.deleteMany({
            where: {
                id: {
                    in: dummyUserIds,
                },
            },
        });
    }
}

async function ensureSettings() {
    const existing = await prisma.setting.findUnique({
        where: { key: 'donorCooldownDays' },
        select: { key: true },
    });

    if (existing) {
        return;
    }

    await prisma.setting.create({
        data: {
            key: 'donorCooldownDays',
            value: { donorCooldownDays: 90 },
            description: 'Minimum days between donor completions',
        },
    });
}

async function ensureLocations(): Promise<CreatedLocation[]> {
    console.log('Preparing locations...');

    const unionNames = [
        'Ishwardi',
        'Pabna Sadar',
        'Bera',
        'Santhia',
        'Atghoria',
    ];

    const unions: CreatedLocation[] = [];

    for (const name of unionNames) {
        const existing = await prisma.location.findFirst({
            where: { name },
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
        });

        if (existing) {
            unions.push(existing);
            continue;
        }

        const created = await prisma.location.create({
            data: {
                name,
                type: 'union',
            },
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
        });

        unions.push(created);
    }

    const villageSeeds = [
        { name: 'Pakshi', parent: 'Ishwardi' },
        { name: 'Dashuria', parent: 'Ishwardi' },
        { name: 'Muladuli', parent: 'Ishwardi' },
        { name: 'Hemayetpur', parent: 'Pabna Sadar' },
        { name: 'Malanchi', parent: 'Pabna Sadar' },
        { name: 'Kashinathpur', parent: 'Bera' },
        { name: 'Nakalia', parent: 'Bera' },
        { name: 'Khetupara', parent: 'Santhia' },
        { name: 'Ataikula', parent: 'Santhia' },
        { name: 'Debottar', parent: 'Atghoria' },
        { name: 'Chandva', parent: 'Atghoria' },
    ];

    const villages: CreatedLocation[] = [];

    for (const seed of villageSeeds) {
        const parent = unions.find((item) => item.name === seed.parent);

        if (!parent) {
            continue;
        }

        const existing = await prisma.location.findFirst({
            where: { name: seed.name },
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
        });

        if (existing) {
            villages.push(existing);
            continue;
        }

        const created = await prisma.location.create({
            data: {
                name: seed.name,
                type: 'village',
                parentId: parent.id,
            },
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
        });

        villages.push(created);
    }

    return villages.length > 0 ? villages : unions;
}

async function createDummyAdmin(input: {
    passwordHash: string;
    locationId: string;
    reservedPhones: Set<string>;
}) {
    console.log('Creating dummy admin...');

    const phone = await getAvailableSeedPhone(0, input.reservedPhones);

    return prisma.user.create({
        data: {
            fullName: 'Dummy Admin',
            phone,
            email: `admin@${EMAIL_DOMAIN}`,
            passwordHash: input.passwordHash,
            role: ROLE_ADMIN,
            bloodGroup: null,
            locationId: input.locationId,
            status: USER_ACTIVE,
            phoneVerified: true,
            preferredLanguage: 'bn',
        },
        select: {
            id: true,
            fullName: true,
            phone: true,
        },
    });
}

async function createDummyUsers(input: {
    passwordHash: string;
    locations: CreatedLocation[];
    reservedPhones: Set<string>;
}) {
    console.log('Creating dummy users and donor profiles...');

    const donors: CreatedDonor[] = [];
    const recipients: CreatedRecipient[] = [];

    for (let i = 1; i <= DONOR_COUNT; i++) {
        const bloodGroup = faker.helpers.arrayElement(BLOOD_GROUPS);
        const location = faker.helpers.arrayElement(input.locations);
        const phone = await getAvailableSeedPhone(i, input.reservedPhones);

        const user = await prisma.user.create({
            data: {
                fullName: randomName(),
                phone,
                email: `donor${i}@${EMAIL_DOMAIN}`,
                passwordHash: input.passwordHash,
                role: ROLE_DONOR,
                bloodGroup,
                locationId: location.id,
                status: USER_ACTIVE,
                phoneVerified: true,
                preferredLanguage: faker.helpers.arrayElement(['bn', 'en']),
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                bloodGroup: true,
                locationId: true,
            },
        });

        const lastDonationDate = chance(0.25)
            ? faker.date.recent({ days: 120 })
            : null;

        const profile = await prisma.donorProfile.create({
            data: {
                userId: user.id,
                bloodGroup,
                isAvailable: chance(0.85),
                verification:
                    DONOR_VERIFICATIONS.length > 0
                        ? faker.helpers.arrayElement(DONOR_VERIFICATIONS)
                        : undefined,
                lastDonationDate,
                nextEligibleDate: lastDonationDate
                    ? addDays(lastDonationDate, 90)
                    : null,
                totalDonations: faker.number.int({ min: 0, max: 10 }),
                notes: chance(0.25) ? faker.lorem.sentence() : null,
            },
            select: {
                id: true,
                userId: true,
                bloodGroup: true,
            },
        });

        donors.push({ user, profile });
    }

    for (let i = 1; i <= RECIPIENT_COUNT; i++) {
        const serial = DONOR_COUNT + i;
        const location = faker.helpers.arrayElement(input.locations);
        const phone = await getAvailableSeedPhone(serial, input.reservedPhones);

        const user = await prisma.user.create({
            data: {
                fullName: randomName(),
                phone,
                email: `recipient${i}@${EMAIL_DOMAIN}`,
                passwordHash: input.passwordHash,
                role: ROLE_RECIPIENT,
                bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
                locationId: location.id,
                status: USER_ACTIVE,
                phoneVerified: true,
                preferredLanguage: faker.helpers.arrayElement(['bn', 'en']),
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                bloodGroup: true,
                locationId: true,
            },
        });

        recipients.push(user);
    }

    return { donors, recipients };
}

async function createRequestResponseForStatus(input: {
    requestId: string;
    status: RequestStatus;
    donors: CreatedDonor[];
}) {
    if (isMatchedLikeStatus(input.status)) {
        const donor = faker.helpers.arrayElement(input.donors);

        await prisma.requestResponse.create({
            data: {
                requestId: input.requestId,
                donorId: donor.user.id,
                status: RESPONSE_ACCEPTED,
                donorConfirmedCompletion: input.status === FULFILLED_STATUS,
                recipientConfirmedCompletion: input.status === FULFILLED_STATUS,
            },
        });

        if (input.status === FULFILLED_STATUS) {
            const donationDate = faker.date.recent({ days: 45 });

            await prisma.donation.create({
                data: {
                    donorProfileId: donor.profile.id,
                    requestId: input.requestId,
                    donationDate,
                    units: faker.number.int({ min: 1, max: 2 }),
                    recipientConfirmed: true,
                },
            });

            await prisma.donorProfile.update({
                where: { id: donor.profile.id },
                data: {
                    totalDonations: {
                        increment: 1,
                    },
                    lastDonationDate: donationDate,
                    nextEligibleDate: addDays(donationDate, 90),
                },
            });
        }

        return;
    }

    if (input.status === PUBLISHED_STATUS && chance(0.4)) {
        const donor = faker.helpers.arrayElement(input.donors);

        await prisma.requestResponse.create({
            data: {
                requestId: input.requestId,
                donorId: donor.user.id,
                status: faker.helpers.arrayElement([
                    RESPONSE_DECLINED,
                    RESPONSE_WITHDRAWN,
                ]),
            },
        });
    }
}

async function createDummyRequests(input: {
    adminId: string;
    donors: CreatedDonor[];
    recipients: CreatedRecipient[];
    locations: CreatedLocation[];
}) {
    console.log('Creating dummy blood requests...');

    const requests = [];
    const statusQueue = faker.helpers.shuffle(buildStatusQueue());

    for (let i = 0; i < statusQueue.length; i++) {
        const status = statusQueue[i];
        const recipient = faker.helpers.arrayElement(input.recipients);
        const location = faker.helpers.arrayElement(input.locations);
        const unitsNeeded = faker.number.int({ min: 1, max: 4 });
        const closed = isClosedStatus(status);

        const request = await prisma.bloodRequest.create({
            data: {
                recipientId: recipient.id,
                patientName: randomName(),
                patientAge: faker.number.int({ min: 3, max: 82 }),
                bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
                unitsNeeded,
                unitsFulfilled: status === FULFILLED_STATUS ? unitsNeeded : 0,
                hospitalName: faker.helpers.arrayElement(hospitalNames),
                locationId: location.id,
                urgency: faker.helpers.arrayElement(URGENCIES),
                neededBy: closed
                    ? faker.date.recent({ days: 60 })
                    : faker.date.soon({ days: 14 }),
                status,
                notes: `Generated by faker seed. ${faker.lorem.sentence()}`,
                reviewedById:
                    status === PENDING_REVIEW_STATUS ? null : input.adminId,
            },
            select: {
                id: true,
                recipientId: true,
                status: true,
            },
        });

        requests.push(request);

        await createRequestResponseForStatus({
            requestId: request.id,
            status,
            donors: input.donors,
        });
    }

    return requests;
}

async function createNotifications(input: {
    donors: CreatedDonor[];
    recipients: CreatedRecipient[];
    requests: Awaited<ReturnType<typeof createDummyRequests>>;
}) {
    console.log('Creating dummy notifications...');

    const users = [
        ...input.recipients.slice(0, 15),
        ...input.donors.slice(0, 15).map((donor) => donor.user),
    ];

    for (const user of users) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: NOTIFICATION_ANNOUNCEMENT,
                title: '[Dummy] Welcome to RaktoSetu',
                body: 'This is a generated in-app notification for local testing.',
                referenceId: null,
                isRead: chance(0.5),
                channel: 'in_app',
            },
        });
    }

    for (const request of input.requests.slice(0, 30)) {
        await prisma.notification.create({
            data: {
                userId: request.recipientId,
                type: NOTIFICATION_STATUS_UPDATE,
                title: '[Dummy] Blood request status update',
                body: `Your request is currently ${String(
                    request.status,
                ).toLowerCase()}.`,
                referenceId: request.id,
                isRead: chance(0.35),
                channel: 'in_app',
            },
        });
    }

    for (const request of input.requests.slice(30, 50)) {
        await prisma.notification.create({
            data: {
                userId: request.recipientId,
                type: NOTIFICATION_DONOR_RESPONSE,
                title: '[Dummy] Donor response received',
                body: 'A donor has responded to your blood request.',
                referenceId: request.id,
                isRead: false,
                channel: 'in_app',
            },
        });
    }
}

async function createAnnouncements(adminId: string) {
    console.log('Creating dummy announcements...');

    const announcements = [
        {
            title: '[Dummy] Donor verification camp this Friday',
            body: 'Local volunteers will help verify donor profiles from 3 PM to 6 PM.',
        },
        {
            title: '[Dummy] Hospital screening reminder',
            body: 'RaktoSetu connects donors and recipients only. Screening and cross-matching must happen at the hospital.',
        },
        {
            title: '[Dummy] Emergency support desk is open',
            body: 'The emergency donor support desk is available during office hours.',
        },
        {
            title: '[Dummy] Blood donation awareness session',
            body: 'A local awareness session will be held for first-time donors this week.',
        },
    ];

    for (const announcement of announcements) {
        await prisma.announcement.create({
            data: {
                authorId: adminId,
                title: announcement.title,
                body: announcement.body,
                isPublished: true,
            },
        });
    }
}

async function createAuditLogs(input: {
    adminId: string;
    requests: Awaited<ReturnType<typeof createDummyRequests>>;
    donors: CreatedDonor[];
}) {
    console.log('Creating dummy audit logs...');

    for (const request of input.requests.slice(0, 25)) {
        await prisma.auditLog.create({
            data: {
                actorId: input.adminId,
                action: 'dummy.request.review',
                entityType: 'blood_request',
                entityId: request.id,
                metadata: {
                    status: request.status,
                    source: 'faker.seed.ts',
                },
            },
        });
    }

    for (const donor of input.donors.slice(0, 20)) {
        await prisma.auditLog.create({
            data: {
                actorId: input.adminId,
                action: 'dummy.donor.verify',
                entityType: 'donor_profile',
                entityId: donor.profile.id,
                metadata: {
                    verification: 'generated',
                    source: 'faker.seed.ts',
                },
            },
        });
    }
}

async function main() {
    await cleanupOldDummyData();
    await ensureSettings();

    const reservedPhones = new Set<string>();
    const locations = await ensureLocations();
    const passwordHash = await hashPassword(PASSWORD);

    const admin = await createDummyAdmin({
        passwordHash,
        locationId: locations[0].id,
        reservedPhones,
    });

    const { donors, recipients } = await createDummyUsers({
        passwordHash,
        locations,
        reservedPhones,
    });

    const requests = await createDummyRequests({
        adminId: admin.id,
        donors,
        recipients,
        locations,
    });

    await createNotifications({
        donors,
        recipients,
        requests,
    });

    await createAnnouncements(admin.id);

    await createAuditLogs({
        adminId: admin.id,
        requests,
        donors,
    });

    const report = await prisma.bloodRequest.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
        orderBy: {
            status: 'asc',
        },
    });

    const donationCount = await prisma.donation.count();

    console.log('');
    console.log('Dummy seed completed ✅');
    console.log('----------------------------------------');
    console.log(`Donors:     ${DONOR_COUNT}`);
    console.log(`Recipients: ${RECIPIENT_COUNT}`);
    console.log(`Requests:   ${buildStatusQueue().length}`);
    console.log(`Donations:  ${donationCount}`);
    console.log('');
    console.log('Request counts by status:');

    for (const item of report) {
        console.log(`- ${item.status}: ${item._count.status}`);
    }

    console.log('');
    console.log('Login credentials:');
    console.log(`Admin:     ${admin.phone} / ${PASSWORD}`);
    console.log(`Donor:     ${donors[0]?.user.phone} / ${PASSWORD}`);
    console.log(`Recipient: ${recipients[0]?.phone} / ${PASSWORD}`);
    console.log('----------------------------------------');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });