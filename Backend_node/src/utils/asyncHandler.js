const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(error.statusCode || 500).json({ 
            success: false,
            message: error.message || "Something went wrong" 
        });
    });
};

export default asyncHandler;