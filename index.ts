import "dotenv/config";
import app from "./src/app.js";
import { port } from "./src/config/env.js";
import { connectRedis } from "./src/lib/redis.js";

async function startServer() {
  try {
    await connectRedis();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to connect to Redis:", message);
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
