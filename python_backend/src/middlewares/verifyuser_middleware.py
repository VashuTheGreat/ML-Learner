

from fastapi import Request,HTTPException,status

async def verify_jwt(request: Request):
    print(request)
    # token = request.headers.get("Authorization")
    # if not token or token != "Bearer my_secret_token":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
    #                         detail="Invalid or missing JWT token")
    # return True  # ya user info return kar sakte ho
    return True