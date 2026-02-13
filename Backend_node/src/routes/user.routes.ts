import {Router} from "@vashuthegreat/vexpress"
import {verifyJWT} from "../middlewares/isUserValid.middleware.js"
import { createUser, login, updateUser,Logout, uploadAvatar,deleteAvatar,addResume,addAboutUser,deleteResume,getUserById,getUser,updateUserData,refreshAccessToken } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { Verify } from "crypto";
const router=new Router();
router.post("/create",createUser);
router.post("/update",verifyJWT,updateUser);
router.post("/login",login)
router.get("/logout",verifyJWT,Logout)
router.post("/uploadAvatar",upload.fields([
    {
        name:"avatar",
        maxCount:1
    }
]),verifyJWT,uploadAvatar)
router.delete("/deleteAvatar",verifyJWT,deleteAvatar)
router.post("/addResume",upload.fields([
    {
        name:"resume",
        maxCount:1
    }
]),verifyJWT,addResume)
router.post("/addAboutUser",verifyJWT,addAboutUser)
router.put("/deleteResume/:idx",verifyJWT,deleteResume)
router.get("/getUserById/:id",getUserById)
router.get("/getUser",verifyJWT,getUser)
router.post("/updateUserJson",verifyJWT,updateUserData)
router.get("/refresh-token",refreshAccessToken)
export default router;
