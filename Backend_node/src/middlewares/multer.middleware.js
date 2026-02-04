import multer from "multer";
import fs from "fs";
const uploadPath="./public/temp";

if(!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath,{recursive:true})
}

// using multer

const storage=multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,uploadPath)
    },
    filename:function (req,file,cb){
        cb(null,file.originalname)
    }
})


export const upload=multer({
    storage
})