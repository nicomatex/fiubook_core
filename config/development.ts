const dbPort = parseInt(process.env.DATABASE_PORT ?? '0')
const pageSize = parseInt(process.env.PAGE_SIZE ?? '50')

const config = {
    knex: {
        client: 'pg',
        connection: {
            host: process.env.DATABASE_HOST,
            port: dbPort,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        },
    },

    pagination: {
        secret: process.env.PAGINATION_SECRET || 'yerbamate',
        pageSize: pageSize,
    },
}

export default config
