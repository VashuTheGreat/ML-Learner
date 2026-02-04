class ApiError extends Error{
    constructor(status,message="something went wrong"){
        super(message)
        this.statusCode=status
        this.message=message
        this.success=false
    }
}

export default ApiError;