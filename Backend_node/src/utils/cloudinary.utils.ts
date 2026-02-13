import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded:", uploadResult);

        // Delete file from local server
        fs.unlinkSync(localFilePath);

        return uploadResult;

    } catch (err) {
        console.log("Cloudinary upload error:", err);

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
        await cloudinary.uploader.destroy(public_id); 
        console.log("File deleted:", public_id);
    } catch(e) {
        console.log("Cloudinary delete error:", e);
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };
