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

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: logPath }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;