import { Redis } from "ioredis";
import dotenv from "dotenv";
import logger from "../logger/create.logger.js";

dotenv.config();

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        // Retry less frequently to avoid spamming connection attempts
        return Math.min(times * 500, 10000);
    },
});

// Silent error listener to prevent "Unhandled error event" crashes 
// while keeping the console clean as requested by the user.
client.on("error", (err) => {
    logger.error("Redis connection error:", err);
});

export default client;