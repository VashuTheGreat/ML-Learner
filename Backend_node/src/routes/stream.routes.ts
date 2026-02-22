import {Router} from "@vashuthegreat/vexpress"
import { StreamVideo } from "../controllers/stream.controllers.js";
const router=new Router();

router.get("/video",StreamVideo);

export default router;