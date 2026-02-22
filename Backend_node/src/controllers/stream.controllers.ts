import { expressRepre } from "@vashuthegreat/vexpress";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Request, Response } from "express";
import { dirname, resolve } from "path";
import { createReadStream, statSync } from "fs";
import { fileURLToPath } from "url";
import logger from "../logger/create.logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESOURCES_DIR = resolve(__dirname, '../../resources');

export const StreamVideo = expressRepre(
    {
        summary: "Stream video file with HTTP range requests support",
        response: "video stream bytes"
    },
    asyncHandler(async (req: Request, res: Response) => {
        logger.info("Entered streaming controller");
        
        const filePath = `${RESOURCES_DIR}/intro.mp4`;
        
        if (!statSync(filePath)?.isFile()) {
            throw new ApiError(404, "Video file not found");
        }
        
        const fileSize = statSync(filePath).size;
        const range = req.headers.range;
        
        if (!range) {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes'
            });
            return createReadStream(filePath).pipe(res);
        }
        
        const CHUNK_SIZE = 2**20 *Number(process.env.MB_TO_STREAM); // 1MB chunks
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
        
        const contentLength = end - start + 1;
        
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4'
        });
        
        const stream = createReadStream(filePath, { start, end });
        stream.pipe(res);
    })
);
