import winston from 'winston';
import config from '@config/default';

const format = winston.format.combine(
    winston.format.colorize({ colors: { info: 'blue', error: 'red', warning: 'yellow' } }),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
);

const logger = winston.createLogger({
    format,
    transports: [
        new winston.transports.Console({ level: config.log.level }),
    ],
});

export default logger;
