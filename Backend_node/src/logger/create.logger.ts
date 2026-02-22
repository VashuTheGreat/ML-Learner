import winston from 'winston';
import { LOGGER_FOLDER_NAME, LOGGER_FILE_NAME } from "../constants/constants.js";
import fs from "fs";
import path from "path";

// Ensure log directory exists synchronously
if (!fs.existsSync(LOGGER_FOLDER_NAME)) {
    fs.mkdirSync(LOGGER_FOLDER_NAME, { recursive: true });
    console.log('Log folder created!');
}

const logPath = path.join(LOGGER_FOLDER_NAME, LOGGER_FILE_NAME);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: logPath }),
  ],
});

//
// If we're not in production then log to the `console` with custom format:
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${stack ? `\n${stack}` : ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
    ),
  }));
}

export default logger;