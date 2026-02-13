class ApiResponse<T> {
    public status: number;
    public data: T;
    public message: string;
    public success: boolean;

    constructor(status = 200, data: T, message = "Success") {
        this.status = status;
        this.data = data;
        this.message = message;
        this.success = status < 400;
    }
}

export default ApiResponse;