export const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);

    return next;
};

export const addMinutes = (date: Date, minutes: number) =>
    new Date(date.getTime() + minutes * 60_000);

export const jwtExpiresAt = (expiresIn: string) => {
    const match = /^(?<amount>\d+)(?<unit>[mhd])$/.exec(expiresIn);

    if (!match?.groups) {
        return addDays(new Date(), 7);
    }

    const amount = Number(match.groups.amount);
    const unit = match.groups.unit;
    const minutes =
        unit === 'm' ? amount : unit === 'h' ? amount * 60 : amount * 24 * 60;

    return addMinutes(new Date(), minutes);
};
