import mysql from "mysql2/promise"
import logger from "../logger/create.logger.js";


async function connectsql() {
    try {
        const db=await mysql.createConnection({
     host: 'localhost',
  user: 'root',
  password:"Sarthak@20021978$",
  database:"ml_learner"
})
    logger.info("mysql connected");
    return db
        
    } catch (error) {
        logger.error("mysql connection failed", error);
    }

    
}


export default connectsql;