import jwt from 'jsonwebtoken';
import config from '@config/default';
import { Knex } from 'knex';
import pgTsquery from 'pg-tsquery';

const queryEscaper = pgTsquery();

enum PaginatedQueryType {
    Users,
    Services,
    Bookings,
}

type PaginationTokenPayload = {
    id: string
    ts: string
    type: PaginatedQueryType
}

const genPaginationToken = (
    id: string,
    ts: string,
    type: PaginatedQueryType,
): string => {
    const token = jwt.sign(
        {
            id,
            ts,
            type,
        },
        config.pagination.secret,
    );
    return token;
};

const decodePaginationToken = (
    token: string,
    expectedType: PaginatedQueryType,
): PaginationTokenPayload => {
    const data = jwt.verify(
        token,
        config.pagination.secret,
    ) as PaginationTokenPayload;
    if (data.type !== expectedType) {
        throw new Error('Pagination token type is not valid for this query');
    }
    return data;
};

const withPaginationToken = (queryBuilder: Knex.QueryBuilder, paginationToken?: string) => {
    if (paginationToken === undefined) return;
    const paginationInfo = decodePaginationToken(paginationToken, PaginatedQueryType.Services);
    const { ts: previousPageLastTs, id: previousPageLastId } = paginationInfo;
    queryBuilder.whereRaw(`(ts, id) > ('${previousPageLastTs}','${previousPageLastId}')`);
};

const withQueryTerm = (queryBuilder: Knex.QueryBuilder, queryTerm?: string) => {
    if (queryTerm === undefined) return;
    queryBuilder.whereRaw('search_index @@ to_tsquery(\'spanish\',?)', [queryEscaper(queryTerm)]);
};

export {
    genPaginationToken, decodePaginationToken,
    PaginatedQueryType, withPaginationToken, withQueryTerm,
};
