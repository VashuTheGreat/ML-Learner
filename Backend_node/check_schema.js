
import mysql from 'mysql2/promise';

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: "Vansh@1234mysql",
            database: "ml_learner"
        });
        const [rows] = await connection.execute('DESCRIBE questions');
        console.log("Table Schema:");
        console.table(rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
