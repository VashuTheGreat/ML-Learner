import {Router} from "@vashuthegreat/vexpress"
import { fetch_questionById,fetch_questionBycategory,fetch_questionByDifficulty,fetch_all_questions,get_available_categories,add_questions} from "../controllers/Questions.controller.js";
import { verifyJWT } from "../middlewares/isUserValid.middleware.js";



const router=new Router()


router.get("/fetch_question/id/:question_id",fetch_questionById)
router.get("/fetch_question/category/:category",fetch_questionBycategory)
router.get("/fetch_question/difficulty/:difficulty",fetch_questionByDifficulty)
router.get("/fetch_question/all",fetch_all_questions)
router.get("/question_categories",get_available_categories)
router.post("/add_questions",add_questions)
export default router;


