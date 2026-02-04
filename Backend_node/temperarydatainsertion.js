const url="http://localhost:3002/api/question/add_questions"
import fs from "fs"

const content=fs.readFileSync("./problems.json")
const data=JSON.parse(content)


data.forEach(async element => {
    const response=await fetch(url,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(element)
    })
    
});

console.log("Data inserted Successfully")