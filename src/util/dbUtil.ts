import jwt from 'jsonwebtoken';
import config from '@config/default';
import { Knex } from 'knex';
import pgTsquery from 'pg-tsquery';
import { User } from '@graphql/schemas/user';
import { Service } from '@graphql/schemas/service';
import logger from '@util/logger';

const queryEscaper = pgTsquery();

enum PaginatedQueryType {
    Users,
    Services,
    Bookings,
}

type PaginationTokenPayload = {
    id: string
    ts: Date
    type: PaginatedQueryType
}

// Add new paginable data types here
type PaginableDataType = Service | User;

const genPaginationToken = (
    id: string,
    ts: Date,
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

const withQueryTerm = (queryBuilder: Knex.QueryBuilder, tsColumn: string, queryTerm?: string) => {
    if (queryTerm === undefined) return;
    queryBuilder.whereRaw('?? @@ to_tsquery(\'spanish\',?)', [tsColumn, queryEscaper(queryTerm)]);
};

const genPaginatedResponse = <T extends PaginableDataType>(
    data: T[],
    pageSize: number,
    dataType: PaginatedQueryType,
) => {
    if (data.length < pageSize) {
        return {
            items: data,
        };
    }
    const lastRecord = data[data.length - 1];
    const newPaginationToken = genPaginationToken(
        lastRecord.id,
        lastRecord.ts,
        dataType,
    );
    logger.debug(lastRecord.ts.toISOString());
    return {
        items: data,
        paginationToken: newPaginationToken,
    };
};

export {
    genPaginationToken, decodePaginationToken,
    PaginatedQueryType, withPaginationToken, withQueryTerm,
    genPaginatedResponse,
};
