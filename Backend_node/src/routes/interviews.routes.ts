import {Router} from "@vashuthegreat/vexpress"
import { createInterview,updateInterviewStatus,getUserInterviews,getInterviewById, deleteInterview} from "../controllers/interview.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";
const router=new Router();

router.post("/sheduleInterview",verifyJWT,createInterview)
router.put("/updateInterviewStatus",verifyJWT,updateInterviewStatus)
router.get("/fetch_interviews",verifyJWT,getUserInterviews)
router.get("/getInterviewById",verifyJWT,getInterviewById)
router.delete("/deleteInterview/:id",verifyJWT,deleteInterview)
export default router
