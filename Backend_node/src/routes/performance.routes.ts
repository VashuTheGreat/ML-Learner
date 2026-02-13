import { Router } from "@vashuthegreat/vexpress";
import { createPerformance, getInterviewPerformance } from "../controllers/performance.controller.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";

const router = new Router();

router.post(
  "/create",
  verifyJWT,
  createPerformance
);

router.post(
  "/fetchPerformance",
  verifyJWT,
  getInterviewPerformance
)

export default router;
