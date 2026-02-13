import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken"
import client from "../utils/RedisClient.js";


export const verifyJWT=asyncHandler(async (req,res,next)=>{
    const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","");

    if (!token) throw new ApiError(401,"Unauthorized request")
     
    const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    
    console.log(' Decoded token:', decoded_token);

let user;
    const st_to_red=`user:${token}`;

    try {
        user = await client.get(st_to_red); // Fetch user from Redis
        if (user) { 
            user = JSON.parse(user as string); 
            console.log(" User fetched from Redis");
        }
    } catch (error) {
        // Silently falling back to database
    }


    if (!user){
        
        user=await User.findById(decoded_token?._id)
        
        try {
            if (user) {
                await client.set(st_to_red, JSON.stringify(user));
                await client.expire(st_to_red, 30);
                console.log(" User cached in Redis");
            }
        } catch (error) {
            // Silently failing to cache
        }
    }



    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }

    // Set both the user object and the _id from token
    req.user = {
        ...(user as any),
        _id: (decoded_token as any)._id
    };
    
    console.log('✅ req.user set with _id:', req.user._id);
    
    next();
})

