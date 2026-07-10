import { Role } from '@prisma/client';

export type AuthUser = {
    id: string;
    phone: string;
    role: Role;
    jti: string;
};
