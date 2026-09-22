import { Router } from "express";
import {
  addRedisEntry,
  getUserProfile,
} from "../controllers/redis.controller.js";

const router = Router();

router.get("/:key", getUserProfile);
router.post("/redis/add", addRedisEntry);

export default router;
