import mysql from "mysql2/promise"
import logger from "../logger/create.logger.js";


async function connectsql() {
    try {

       const db = mysql.createPool({

    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
    // ssl: { rejectUnauthorized: true } // agar SSL enforce ho to

  });
  
    logger.info("mysql pool created");
    // Ensure the questions table exists to prevent ER_NO_SUCH_TABLE errors
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS questions (
          id INT PRIMARY KEY,
          title VARCHAR(255),
          difficulty VARCHAR(50),
          category VARCHAR(100),
          problem_description TEXT,
          starter_code TEXT,
          example_input TEXT,
          example_output TEXT,
          example_reasoning TEXT,
          learn_content TEXT,
          solution_code TEXT,
          test_cases JSON,
          function_name VARCHAR(255)
      )
    `;
    await db.execute(createTableQuery);

    return db
        
    } catch (error) {
        logger.error("mysql connection failed", error);
    }

    
}


export default connectsql;