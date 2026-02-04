import "dotenv/config";

import app from "./app.js"
const PORT = process.env.PORT || 3000;

app.listen(PORT,(req,res)=>{
    console.log(`Server is starting at http://localhost:${PORT}`)
})