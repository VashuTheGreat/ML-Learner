import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "../logger/create.logger.js";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function uploadOnCloudinary(localFilePath: string) {
    try {
        if (!localFilePath) return null;

        // Determine file type from extension
        const fileExt = localFilePath.split('.').pop()?.toLowerCase();
        const resourceType = fileExt === 'pdf' ? 'raw' : 'auto'; // PDFs -> raw, others -> auto

        logger.info(`Uploading file to Cloudinary: ${localFilePath}`);
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        logger.info("File uploaded successfully to Cloudinary", { public_id: uploadResult.public_id });

        // Delete file from local server
        fs.unlinkSync(localFilePath);

        return uploadResult;

    } catch (err) {
        logger.error("Cloudinary upload error:", err);

        // Delete temp file even if upload fails
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return null;
    }
}

async function deleteOnCloudinary(url: string){
    const public_id = url.split("/").pop()?.split(".").shift();
    if(!public_id){
        throw new Error("Invalid file path")
    }
    try{
        logger.info(`Deleting file from Cloudinary: ${public_id}`);
        await cloudinary.uploader.destroy(public_id); 
        logger.info(`File deleted from Cloudinary: ${public_id}`);
    } catch(e) {
        logger.error("Cloudinary delete error:", e);
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };
