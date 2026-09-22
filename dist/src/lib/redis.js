import { createClient } from "redis";
import { redisHost, redisPassword, redisPort, redisUsername, } from "../config/env.js";
const redisClient = createClient({
    username: redisUsername,
    password: redisPassword,
    socket: {
        host: redisHost,
        port: redisPort,
        connectTimeout: 5_000,
        reconnectStrategy: false,
    },
});
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected");
    }
}
export default redisClient;
//# sourceMappingURL=redis.js.map