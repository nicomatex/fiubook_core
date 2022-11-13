import jwt from 'jsonwebtoken'
import config from '@config/default'

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
    type: PaginatedQueryType
): string => {
    const token = jwt.sign(
        {
            id,
            ts,
            type,
        },
        config.pagination.secret
    )
    return token
}

const decodePaginationToken = (
    token: string,
    expectedType: PaginatedQueryType
): PaginationTokenPayload => {
    const data = jwt.verify(
        token,
        config.pagination.secret
    ) as PaginationTokenPayload
    if (data.type !== expectedType) {
        throw new Error('Pagination token type is not valid for this query')
    }
    return data
}

export { genPaginationToken, decodePaginationToken, PaginatedQueryType }
