const port = parseInt(process.env.DATABASE_PORT ?? '0')

const config = {
    knex: {
        client: 'pg',
        connection: {
            host: process.env.DATABASE_HOST,
            port: port,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        },
    },
}

export default config
