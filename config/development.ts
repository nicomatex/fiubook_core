const port = parseInt(process.env.database_port ?? '0')

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
