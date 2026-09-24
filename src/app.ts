import express from "express";
import { logger } from "./middlewares/logger.js";
import redisRoutes from "./routes/redis.routes.js";
import healthRoutes from "./routes/health.route.js";
import tenantsRoutes from "./routes/tenants.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import messagesRoutes from "./routes/messages.routes.js";


const app = express();

app.use(express.json());
app.use(logger);

app.get("/",(req,res)=>{
  return res.status(200).json({message:"done"});
});

// Allow the Next.js frontend (different origin/port) to call this API.
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN ?? "http://localhost:3000"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/health", healthRoutes);

app.use("/tenants", tenantsRoutes);
app.use("/webhook", webhookRouter)
app.use("/messages", messagesRoutes);
app.use("/", redisRoutes);

export default app;