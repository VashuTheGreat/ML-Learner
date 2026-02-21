import { expressRepre,Vexpress } from "@vashuthegreat/vexpress";
import cors from "cors"
import cookieParser from "cookie-parser";
import UserRouter from "./routes/user.routes.js"
import connectdb from "./db/connectdb.js";
import TemplateRouter from "./routes/templates.routes.js";
import InterviewRouter from "./routes/interviews.routes.js";
import performanceRouter from "./routes/performance.routes.js"
import questionRouter from "./routes/question.routes.js";
import CodingSchemaRouter from "./routes/coding.routes.js"
import { Request, Response } from "express";

import {rateLimit} from 'express-rate-limit'
connectdb()
const app=new Vexpress();
app.setupDocs();


app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174','http://localhost:8080','*']
    ,credentials:true
}));
app.use(cookieParser())

// Implementing Token Bucket
// bucker

interface Limiter {
  windowMs: number;
  limit: number;
  standardHeaders: 'draft-6' | 'draft-7' | 'draft-8' | boolean;
  legacyHeaders: boolean;
  ipv6Subnet?: number;  // Optional, defaults to 56
  // store?: RateLimitStore;  // Optional for Redis/MemoryStore
}

// console.log(process.env)
const limiter = rateLimit({
  windowMs: Number(process.env.windowMs)* 60 * 1000,
  limit: Number(process.env.limit),
  standardHeaders: process.env.standardHeaders as 'draft-6' | 'draft-7' | 'draft-8' | boolean,
  legacyHeaders: process.env.legacyHeaders === 'true',
  ipv6Subnet: Number(process.env.ipv6Subnet),
} satisfies Limiter);  


app.use(limiter)

app.use(Vexpress.urlencoded({extended:true,limit:"16kb"}))// extended true bole to or obj ke under obj de pate h and ye url me jo data hota h usko deta h
app.use(Vexpress.json({limit:"16kb"})) // asa no ho ki kitne bhi json bhej de
app.use(Vexpress.static("public"))

app.use("/api/user",UserRouter);
app.use("/api/templates",TemplateRouter);
app.use("/api/interview",InterviewRouter);
app.use("/api/performance",performanceRouter);
app.use("/api/question",questionRouter);
app.use("/api/codingSchema",CodingSchemaRouter)

app.use("/",async (req:Request,res:Response)=>{
    await new Promise(resolve=>setTimeout(resolve,2000))
    res.status(200).json({message:"Hello World"})
})
export default app;