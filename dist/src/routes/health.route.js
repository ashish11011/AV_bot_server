import { Router } from "express";
const router = Router();
router.get("/", (_req, res) => {
    return res.json({ message: "OK", health: true });
});
export default router;
//# sourceMappingURL=health.route.js.map