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
connectdb()
const app=new Vexpress();
app.setupDocs();


app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174','http://localhost:8080','*']
    ,credentials:true
}));
app.use(cookieParser())

app.use(Vexpress.urlencoded({extended:true,limit:"16kb"}))// extended true bole to or obj ke under obj de pate h and ye url me jo data hota h usko deta h
app.use(Vexpress.json({limit:"16kb"})) // asa no ho ki kitne bhi json bhej de
app.use(Vexpress.static("public"))

app.use("/api/user",UserRouter);
app.use("/api/templates",TemplateRouter);
app.use("/api/interview",InterviewRouter);
app.use("/api/performance",performanceRouter);
app.use("/api/question",questionRouter);
app.use("/api/codingSchema",CodingSchemaRouter)

app.use("/",(req:Request,res:Response)=>{
    res.status(200).json({message:"Hello World"})
})
export default app;