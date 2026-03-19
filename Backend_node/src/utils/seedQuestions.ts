import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({
    path: "./.env"
});

async function seedQuestions() {
    console.log("Starting question seeding...");
    
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sarthak@20021978$',
        database: process.env.DB_NAME || 'ml_learner'
    });

    try {
        const problemsPath = path.join(process.cwd(), "problems.json");
        const problemsRaw = fs.readFileSync(problemsPath, "utf-8");
        const problems = JSON.parse(problemsRaw);

        console.log(`Found ${problems.length} questions in problems.json`);

        for (const q of problems) {
            // Check if exists
            const [existing] = await db.execute("SELECT id FROM questions WHERE id = ?", [q.id]);
            if ((existing as any[]).length > 0) {
                // console.log(`Question ${q.id} (${q.title}) already exists, skipping...`);
                continue;
            }

            const query = `
                INSERT INTO questions 
                (id, title, difficulty, category, problem_description, starter_code, example_input, example_output, example_reasoning, learn_content, solution_code, test_cases, function_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await db.execute(query, [
                q.id,
                q.title,
                q.difficulty,
                q.category,
                q.problem_description,
                q.starter_code,
                q.example_input,
                q.example_output,
                q.example_reasoning,
                q.learn_content,
                q.solution_code,
                JSON.stringify(q.test_cases),
                q.function_name
            ]);
            
            if (q.id % 10 === 0) {
                console.log(`Seeded ${q.id} questions...`);
            }
        }

        console.log("Question seeding completed successfully");
    } catch (error) {
        console.error("Error seeding questions:", error);
    } finally {
        await db.end();
    }
}

seedQuestions();
