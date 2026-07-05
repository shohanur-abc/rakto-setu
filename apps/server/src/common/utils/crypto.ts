import {
    createHash,
    randomBytes,
    randomInt,
    scrypt as scryptCallback,
    timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export const createOtpCode = () => randomInt(100000, 1000000).toString();

export const hashPassword = async (value: string) => {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(value, salt, KEY_LENGTH)) as Buffer;

    return `${salt}:${derived.toString('hex')}`;
};

export const verifyPassword = async (value: string, storedHash: string) => {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
        return false;
    }

    const expected = Buffer.from(hash, 'hex');
    const derived = (await scrypt(value, salt, expected.length)) as Buffer;

    return (
        expected.length === derived.length && timingSafeEqual(expected, derived)
    );
};

export const hashLookupToken = (value: string) =>
    createHash('sha256').update(value).digest('hex');
