import { Redis } from "ioredis";
import dotenv from "dotenv";

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
client.on("error", () => {
    // Silently handle connection errors
});

export default client;