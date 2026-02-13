
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function seed() {
    let connection;
    try {
        // 1. Connection setup
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: "Vansh@1234mysql",
            database: "ml_learner"
        });
        console.log("Connected to MySQL successfully.");

        // 2. Ensure questions table exists
        console.log("Checking if 'questions' table exists...");
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
                learn_content LONGTEXT,
                solution_code TEXT,
                test_cases JSON,
                function_name VARCHAR(255)
            )
        `;
        await connection.execute(createTableQuery);
        console.log("'questions' table is ready.");

        // 3. Ensure function_name column exists (redundant if table just created, but good for migrations)
        console.log("Checking if 'function_name' column exists...");
        const [columns] = await connection.execute('SHOW COLUMNS FROM questions LIKE "function_name"');
        if (columns.length === 0) {
            console.log("Adding 'function_name' column to 'questions' table...");
            await connection.execute('ALTER TABLE questions ADD COLUMN function_name VARCHAR(255)');
            console.log("Column added.");
        }

        // 3. Read problems.json
        const problemsPath = path.resolve('problems.json');
        const problemsData = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
        console.log(`Read ${problemsData.length} problems from JSON.`);

        // 4. Insert each problem
        for (const problem of problemsData) {
            const {
                id, title, difficulty, category, problem_description,
                starter_code, example_input, example_output, example_reasoning,
                learn_content, solution_code, test_cases, function_name
            } = problem;

            const query = `
                INSERT INTO questions (
                    id, title, difficulty, category, problem_description, 
                    starter_code, example_input, example_output, example_reasoning, 
                    learn_content, solution_code, test_cases, function_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    difficulty = VALUES(difficulty),
                    category = VALUES(category),
                    problem_description = VALUES(problem_description),
                    starter_code = VALUES(starter_code),
                    example_input = VALUES(example_input),
                    example_output = VALUES(example_output),
                    example_reasoning = VALUES(example_reasoning),
                    learn_content = VALUES(learn_content),
                    solution_code = VALUES(solution_code),
                    test_cases = VALUES(test_cases),
                    function_name = VALUES(function_name)
            `;

            const params = [
                id, title, difficulty, category.toLowerCase(), problem_description,
                starter_code, example_input, example_output, example_reasoning,
                learn_content, solution_code, JSON.stringify(test_cases), function_name
            ];

            await connection.execute(query, params);
            console.log(`Inserted/Updated problem ID ${id}: ${title}`);
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seed();
