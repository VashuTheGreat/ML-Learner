import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken"
import client from "../utils/RedisClient.js";


export const verifyJWT=asyncHandler(async (req,res,next)=>{
    const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","");

    if (!token) throw new ApiError(401,"Unauthorized request")
     
    const decoded_token=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    console.log('🔍 Decoded token:', decoded_token);

let user;
    const st_to_red=`user:${token}`;

    try {
             user= await client.get(st_to_red);
             user=JSON.parse(user)

        
    } catch (error) {
        console.log("Value ddn't fetched in redis")
        
    }


    if (!user){
        
        user=await User.findById(decoded_token?._id)
        
try {
    // console.log(user)
            const res=await client.set(st_to_red,JSON.stringify(user))
            
            await client.expire(st_to_red,30)
    console.log("User seted in catch",res)
} catch (error) {
    console.log("Error while seting to redis",error)
    
}
    }



    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }

    // Set both the user object and the _id from token
    req.user = {
        ...user,
        _id: decoded_token._id
    };
    
    console.log('✅ req.user set with _id:', req.user._id);
    
    next();
})

