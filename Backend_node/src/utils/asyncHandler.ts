import { Request, Response, NextFunction } from "express";
import logger from "../logger/create.logger.js";
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
        logger.error(error);
        res.status(error.statusCode || 500).json({ 
            success: false,
            message: error.message || "Something went wrong" 
        });
    });
};

export default asyncHandler;