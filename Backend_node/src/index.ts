import "dotenv/config";
import { Request,Response } from "express";

import app from "./app.js"
const PORT = process.env.PORT || 3000;

app.listen(PORT,(req:Request,res:Response)=>{
    console.log(`Server is starting at http://localhost:${PORT}`)
})