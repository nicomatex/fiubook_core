import 'reflect-metadata';
import express from 'express';
import schema from '@graphql/schema';
import { graphqlHTTP } from 'express-graphql';
import { buildContext } from '@util/contextUtil';
import logger from '@util/logger';
import config from '@config/default';
import cors from 'cors';

const allowedOrigins = config.server.cors.allowedOrigins;

const options: cors.CorsOptions = {
    origin: allowedOrigins,
};

const app = express();

app.use(cors(options));

app.get('/', async (req, res) => {
    res.status(200).send('Hola mundo');
});

app.use(
    '/graph',
    graphqlHTTP(async (req) => {
        const context = buildContext(req.headers);
        return {
            schema: await schema,
            graphiql: {
                headerEditorEnabled: true,
            },
            context,
        };
    }),
);

app.listen(config.server.port, () => {
    logger.info(`App listening on port ${config.server.port}`);
});
