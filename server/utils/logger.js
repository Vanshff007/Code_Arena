import winston from 'winston';
import 'winston-daily-rotate-file';
import env from '../config/env.js';

// Plain winston.transports.File grows forever - on a long-running VPS that
// eventually fills the disk. Daily rotation with a retention cap keeps disk
// usage bounded without needing an external log shipper.
const rotateOptions = {
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
};

const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.DailyRotateFile({
      ...rotateOptions,
      filename: 'logs/error-%DATE%.log',
      level: 'error',
    }),
    new winston.transports.DailyRotateFile({
      ...rotateOptions,
      filename: 'logs/combined-%DATE%.log',
    }),
  ],
});

// Adapter so Morgan (HTTP request logging) writes through Winston instead of
// straight to stdout - keeps all logs in one place with one format.
logger.morganStream = {
  write: (message) => logger.info(message.trim()),
};

export default logger;
