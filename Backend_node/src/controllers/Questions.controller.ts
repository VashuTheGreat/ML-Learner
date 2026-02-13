import { expressRepre } from "@vashuthegreat/vexpress";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Query } from "mongoose";
import connectsql from "../db/connectsql.js";
import { Request,Response } from "express";
import fs from "fs"

let db:any;
(async () => {
    db = await connectsql();
})();

async function runquery(query: string, params: any[] = []) {
    const [res]=await db.execute(query, params)
    return res
    
}

export const add_questions=expressRepre(
    {
        summary:"add questions",
        body:{
            "id": 2,
    "title": "Transpose of a Matrix",
    "difficulty": "easy",
    "category": "linear algebra",
    "problem_description": "V3JpdGUgYSBQeXRob24gZnVuY3Rpb24gdGhhdCBjb21wdXRlcyB0aGUgdHJhbnNwb3NlIG9mIGEgZ2l2ZW4gbWF0cml4Lg==",
    "starter_code": "from tinygrad.tensor import Tensor\n\ndef transpose_matrix_tg(a:Tensor) -> Tensor:\n    \"\"\"\n    Transpose a 2D matrix `a` using tinygrad.\n    Inputs are tinygrad Tensors.\n    Returns a transposed Tensor.\n    \"\"\"\n    pass",
    "example_input": "a = [[1,2,3],[4,5,6]]",
    "example_output": "[[1,4],[2,5],[3,6]]",
    "example_reasoning": "The transpose of a matrix is obtained by flipping rows and columns.",
    "learn_content": "CiMjIFRyYW5zcG9zZSBvZiBhIE1hdHJpeAoKTGV0J3MgY29uc2lkZXIgYSBtYXRyaXggJE0kIGFuZCBpdHMgdHJhbnNwb3NlICRNXlQkOgoKKipPcmlnaW5hbCBNYXRyaXggJE0kOioqCiQkCk0gPSBcYmVnaW57cG1hdHJpeH0gCmEgJiBiICYgYyBcXCAKZCAmIGUgJiBmIApcZW5ke3BtYXRyaXh9CiQkCgoqKlRyYW5zcG9zZWQgTWF0cml4ICRNXlQkOioqCiQkCk1eVCA9IFxiZWdpbntwbWF0cml4fSAKYSAmIGQgXFwgCmIgJiBlIFxcIApjICYgZiAKXGVuZHtwbWF0cml4fQokJAoKIyMjIEV4cGxhbmF0aW9uOgpUcmFuc3Bvc2luZyBhIG1hdHJpeCBpbnZvbHZlcyBjb252ZXJ0aW5nIGl0cyByb3dzIGludG8gY29sdW1ucyBhbmQgdmljZSB2ZXJzYS4gVGhpcyBvcGVyYXRpb24gaXMgZnVuZGFtZW50YWwgaW4gbGluZWFyIGFsZ2VicmEgZm9yIHZhcmlvdXMgY29tcHV0YXRpb25zIGFuZCB0cmFuc2Zvcm1hdGlvbnMu",
    "solution_code": "from tinygrad.tensor import Tensor\n\ndef transpose_matrix_tg(a) -> Tensor:\n    \"\"\"\n    Transpose a 2D matrix `a` using tinygrad.\n    Inputs are tinygrad Tensors.\n    Returns a transposed Tensor.\n    \"\"\"\n    return a.T",
    "test_cases": [
      {
        "test": "print(transpose_matrix_tg(Tensor([[1,2],[3,4],[5,6]])))",
        "expected_output": "[[1, 3, 5], [2, 4, 6]]"
      },
      {
        "test": "print(transpose_matrix_tg(Tensor([[1,2,3],[4,5,6]])))",
        "expected_output": "[[1, 4], [2, 5], [3, 6]]"
      }
    ]
        },
        response:"question added"
    },
    asyncHandler(async (req,res)=>{
        const {id,title,difficulty,category,problem_description,starter_code,example_input,example_output,example_reasoning,learn_content,solution_code,test_cases,function_name}=req.body;
        const data=await runquery(`insert into questions (id,title,difficulty,category,problem_description,starter_code,example_input,example_output,example_reasoning,learn_content,solution_code,test_cases,function_name) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [id,title,difficulty,category,problem_description,starter_code,example_input,example_output,example_reasoning,learn_content,solution_code, JSON.stringify(test_cases), function_name])
        res.status(200).json(new ApiResponse(200,data))
    })
)

export const get_available_categories=expressRepre(
    {
        summary :"fet avalable questions categories",
        response:"avalable categories"

    },
    asyncHandler(async (req:Request,res:Response)=>{
        const data=await runquery(`select distinct category from questions `);

        const categories:string[]=[]

        data.forEach((element:any) => {
            categories.push(element.category)

            
        });
        res.status(200).json(new ApiResponse(200,categories));

    })
)


export const fetch_all_questions=expressRepre(
    {

    },
    asyncHandler(async (req,res)=>{


    const data=await runquery(`select * from questions`)
    res.status(200).json(new ApiResponse(200,data))

    
    })
)
export const fetch_questionById=expressRepre({
    summary:"give id to fetch question",
    params:{
        "question_id":"1"
    },
    response:"a question"
},asyncHandler(async (req:Request,res:Response)=>{
    const { question_id } = req.params as { question_id: any };


    const data=await runquery(`select * from questions where id=?`, [question_id])
    res.status(200).json(new ApiResponse(200,data))


}))


export const fetch_questionBycategory=expressRepre({
    summary:"give id to fetch question",
    params:{
        "category":"Linear Algebra"
    },
    response:"a question"
},asyncHandler(async (req:Request,res:Response)=>{
    let { category } = req.params as { category: string };

category=category.toLowerCase()
    const data=await runquery(`select * from questions where category=?`, [category])
    res.status(200).json(new ApiResponse(200,data))


}))



export const fetch_questionByDifficulty=expressRepre({
    summary:"give difficulty to fetch question",
    params:{
        "difficulty":"easy"
    },
    response:"a question"
},asyncHandler(async (req:Request,res:Response)=>{
    let { difficulty } = req.params as { difficulty: string };

difficulty=difficulty.toLowerCase()
    const data=await runquery(`select * from questions where difficulty=?`, [difficulty])
    res.status(200).json(new ApiResponse(200,data))


}))