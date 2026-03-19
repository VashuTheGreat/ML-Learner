import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { DB_NAME } from '../constants/constants';
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
        const connectionString = process.env.MONGODB_URI 
          ? `${process.env.MONGODB_URI}/${DB_NAME}`
          : `mongodb://localhost:27017/${DB_NAME}`;
      await mongoose.connect(connectionString);
      console.log(`Connected to MongoDB: ${DB_NAME}`);

        const templatesDir = path.join(process.cwd(), "src", "templates");
        const files = fs.readdirSync(templatesDir);

        for (const file of files) {
            if (file.endsWith(".ejs")) {
                const match = file.match(/resume(\d+)\.ejs/);
                if (!match) continue;
                const id = match[1];
                const templatePath = path.join(templatesDir, file);
                const dataPath = path.join(templatesDir, `resume${id}.data.json`);

                const templateContent = fs.readFileSync(templatePath, "utf-8");
                
                // Read the JSON data file synchronously
                const tempDataRaw = fs.readFileSync(dataPath, "utf-8");
                const tempData = JSON.parse(tempDataRaw);

                const title = `Resume Template ${id}`;

                // Update or create template
                await Template.findOneAndUpdate(
                    { title },
                    {
                        template: templateContent,
                        temp_data: tempData
                    },
                    { upsert: true, new: true }
                );

                console.log(`Seeded/Updated template: ${title}`);
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
