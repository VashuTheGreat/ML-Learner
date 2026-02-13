import {Router} from "@vashuthegreat/vexpress"
import { create_coding_schema,get_coding_schema,update_coding_schema } from "../controllers/coding.controller.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";
const router=new Router();

router.get("/createCodingSchema",verifyJWT,create_coding_schema);
router.get("/getCodingSchema",verifyJWT,get_coding_schema);
router.post("/updateCodingSchema",verifyJWT,update_coding_schema);

export default router;