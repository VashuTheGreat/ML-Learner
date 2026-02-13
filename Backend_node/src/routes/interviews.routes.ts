import {Router} from "@vashuthegreat/vexpress"
import { createInterview,updateInterviewStatus,getUserInterviews,getInterviewById} from "../controllers/interview.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";
const router=new Router();

router.post("/sheduleInterview",verifyJWT,createInterview)
router.put("/updateInterviewStatus",verifyJWT,updateInterviewStatus)
router.get("/fetch_interviews",verifyJWT,getUserInterviews)
router.get("/getInterviewById",verifyJWT,getInterviewById)
export default router
