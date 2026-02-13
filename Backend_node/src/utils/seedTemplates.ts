import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Template from "../models/templates.models.js";

dotenv.config({
    path: "./.env"
});

const seedTemplates = async function seedTemplates() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not defined");
        return;
    }
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/interviewcracker`);
        console.log("Connected to MongoDB");

        const templatesDir = path.join(process.cwd(), "src", "templates");
        const files = fs.readdirSync(templatesDir);

        for (const file of files) {
            if (file.endsWith(".ejs")) {
                const match = file.match(/resume(\d+)\.ejs/);
                if (!match) continue;
                const id = match[1];
                const templatePath = path.join(templatesDir, file);
                const dataPath = path.join(templatesDir, `resume${id}.data.js`);

                const templateContent = fs.readFileSync(templatePath, "utf-8");
                
                // Dynamic import for the data file
                const dataModule = await import(`file://${dataPath}`);
                const tempData = dataModule[`resume${id}Data`];

                const title = `Resume Template ${id}`;

                // Check if template already exists
                const existingTemplate = await Template.findOne({ title });
                if (existingTemplate) {
                    console.log(`Template ${title} already exists, skipping...`);
                    continue;
                }

                await Template.create({
                    title,
                    template: templateContent,
                    temp_data: tempData
                });

                console.log(`Seeded template: ${title}`);
            }
        }

        console.log("Seeding completed successfully");
    } catch (error) {
        console.error("Error seeding templates:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seedTemplates();
