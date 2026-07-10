import { PaginationRequest } from '../dto/pagination.dto';

export type PageMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export const getPagination = (query: PaginationRequest) => {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
};

export const makePage = <T>(
    items: T[],
    total: number,
    query: PaginationRequest,
) => {
    const { page, limit } = getPagination(query);

    return {
        items,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        } satisfies PageMeta,
    };
};
