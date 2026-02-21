import "dotenv/config";
import { Request,Response } from "express";
import logger from "./logger/create.logger.js";

import app from "./app.js"
const PORT = process.env.PORT || 3000;

app.listen(PORT,(req:Request,res:Response)=>{
    logger.info(`Server is starting at http://localhost:${PORT}`)
})