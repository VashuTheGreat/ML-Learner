class ApiError extends Error {
    public statusCode: number;
    public success: boolean;

    constructor(status: number, message = "something went wrong") {
        super(message);
        this.statusCode = status;
        this.message = message;
        this.success = false;
        
        // Ensure the prototype is correctly set for built-in Error extension
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export default ApiError;