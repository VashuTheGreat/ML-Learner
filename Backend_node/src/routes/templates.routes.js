import {Router} from "@vashuthegreat/vexpress"
import { getTemplates,createTemplate,getAllTemplates,getTemplate_by_data } from "../controllers/templates.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";
const router=new Router();
router.get("/get_template/:id",getTemplates)
router.post("/templates", upload.fields([
    { name: "template", maxCount: 1 },
    { name: "temp_data", maxCount: 1 }
]), createTemplate)

router.get("/getAlltemplates",getAllTemplates)
router.post("/getTemplateByData",verifyJWT,getTemplate_by_data)
export default router
