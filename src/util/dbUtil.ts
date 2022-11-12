import jwt from 'jsonwebtoken'
import config from '@config/development'

enum PaginatedQueryType {
    Users,
    Services,
    Bookings,
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

export { genPaginationToken, PaginatedQueryType }
