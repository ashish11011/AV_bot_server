import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  return res.json({ message: "OK", health: true });
});

export default router;
