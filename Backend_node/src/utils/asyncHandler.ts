import { Request, Response, NextFunction } from "express";

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(error.statusCode || 500).json({ 
            success: false,
            message: error.message || "Something went wrong" 
        });
    });
};

export default asyncHandler;