class ApiResponse:
    def __init__(self, status_code: int, data: any, message: str = "Success"):
        self.status_code = status_code
        self.data = data
        self.message = message
        self.success = status_code < 400
