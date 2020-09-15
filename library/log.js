import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; 
import path from 'path';

const { combine, timestamp, printf} = winston.format;

const logFormat = printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message} ${info.stack || ''}`
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        logFormat
    ),
})

if(process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({format: timestamp({format: 'YYYY-MM-DD HH:mm:ss'})}));
    logger.add(new DailyRotateFile({ filename: path.join(__dirname, `/../../logs/dev/dev_%DATE%.log`), datePattern: 'YYYYMMDD'}));
}

if(process.env.NODE_ENV === 'production') {
    logger.add(new DailyRotateFile({ filename: path.join(__dirname, `/../../logs/prod/prod_%DATE%.log`), datePattern: 'YYYYMMDD'}));
}

export {logger};