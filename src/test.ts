import express from 'express'
import knex from 'knex'

const app = express();
const knex_connection = knex({
    client: 'pg',
    connection: 'postgresql://postgres:test123@postgres-db-internal:5432/postgres'
});

knex_connection.raw('SELECT 1').then(() => {console.log("Connection established!")}).catch((e) => console.log(`Error: ${e}`));

app.listen(3000, () => {
    console.log("App listening on 3000");
    console.log(knex_connection.client.connectionSettings);
});