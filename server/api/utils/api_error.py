class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        message: str = "Something went wrong",
        errors: list = [],
        stack: str = ""
    ):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.errors = errors
        self.data = None
        self.success = False

        if stack:
            self.stack = stack
