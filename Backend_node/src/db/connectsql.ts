import mysql from "mysql2/promise"


async function connectsql() {
    try {
        const db=await mysql.createConnection({
     host: 'localhost',
  user: 'root',
  password:"Vansh@1234mysql",
  database:"ml_learner"
})
    console.log("mysql connected");
    return db
        
    } catch (error) {
        console.log("mysql connection failed");
    }

    
}


export default connectsql;