import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { expressRepre } from "@vashuthegreat/vexpress"
import client from "../utils/RedisClient.js"
import validator from "validator"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/cloudinary.utils.js"
import logger from "../logger/create.logger.js"


const token_option={ httpOnly: true, secure: true };

const generateAccessRefreshToken = async (user: any) => {
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    return {accessToken, refreshToken}
}

async function ValidateAnything(dict: Record<string, any>){
    for(const [key,val] of Object.entries(dict)){
        // Skip validation if value is null or undefined
        if(val === null || val === undefined) continue;
        
        if(key.toLowerCase()=='email'){
            if(!validator.isEmail(String(val)) || (String(val)).trim()==''){
                throw new ApiError(400,"Invalid email");
            }
        }
        else if(key.toLowerCase()=='password'){
            if(String(val).trim()=='' || String(val).length<6) {
                throw new ApiError(400,"password must be at least 6 characters long");
            }
        }
        else if(key.toLowerCase()=='url'){
            if(!validator.isURL(String(val)) || (String(val)).trim()==''){
                throw new ApiError(400,"Invalid url");
            }
        }
    }
}


export const createUser = expressRepre({
    summary: "create user",
    body: { fullName: "Vansh Sharma", email: "vanshsharma123@gmail.com", password: "122344544" },
    response: "To create a user",
}, asyncHandler(async(req,res)=>{
    const {fullName, email, password, username} = req.body;
    logger.info(`Creating user with email: ${email}, username: ${username}`);
    
    if(!fullName || !email || !password || !username){
        throw new ApiError(400,"All fields (fullName, email, password, username) are required");
    }

    await ValidateAnything({email, password});

    // Check if user already exists by email or username
    const existingUser = await User.findOne({ $or: [{email}, {username}] });
    if (existingUser){
        if (existingUser.email === email) {
            throw new ApiError(400,"email already taken, please choose another");
        }
        throw new ApiError(400,"username already taken, please choose another");
    }
    
    const user = new User({
        fullName,
        email,
        password,
        username
    });
    
    const {accessToken, refreshToken} = await generateAccessRefreshToken(user);
    
    user.refreshToken = refreshToken;
    await user.save();
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if(!createdUser){
        throw new ApiError(500,"Failed to register user");
    }
    
    const userResponse = createdUser;
    
    logger.info(`User created successfully: ${userResponse?._id}`);
    
    res
        .cookie("refreshToken", refreshToken, token_option)
        .cookie("accessToken", accessToken, token_option)
        .json(new ApiResponse(200, userResponse, "User created successfully"));
}))


export const updateUser = expressRepre({
    summary: "update user",
    body: {
        fullName: null,
        password: null,
    },
    response: "user updated and the updated user "
}, asyncHandler(async (req,res)=>{
    const {fullName, password} = req.body;
    
    if(fullName && !fullName.trim()){
        throw new ApiError(400,"Full name cannot be empty")
    }

    await ValidateAnything({password});

    
    const user_id = req.user?._id;  // Changed from .id to ._id
    
    if(!user_id){
        throw new ApiError(401,"Unauthorized - User ID not found in token");
    }
    
    const userInstance = await User.findById(user_id);
    
    if(!userInstance){
        throw new ApiError(404,"User not found");
    }
    
    if (fullName) userInstance.fullName = fullName;
    if (password) userInstance.password = password;
    
    await userInstance.save();
    
    const userResponse = await User.findById(user_id).select("-password");
    
    logger.info(`User updated: ${user_id}`);
    res.json(new ApiResponse(200, userResponse, "User updated successfully"));
}))


export const login = expressRepre({
    summary: "login user by either email or email and password",
    body: {
        email: null,
        password: null,
    },
    response: "user "
}, asyncHandler(async (req,res)=>{
    const {password, email: loginIdentifier} = req.body;
    logger.info(`Login attempt for: ${loginIdentifier}`);
    
    if(!password){
        throw new ApiError(400,"Password is required");
    }
    
    if(!loginIdentifier){
        throw new ApiError(400,"Email or username is required");
    }

    const trimmedIdentifier = loginIdentifier.trim();
    const trimmedPassword = password.trim();

    await ValidateAnything({password: trimmedPassword, email: trimmedIdentifier});
    
    const userInstance = await User.findOne({
        $or: [
            { email: trimmedIdentifier },
            { username: trimmedIdentifier.toLowerCase() }
        ]
    });
    
    
    
    
    if(!userInstance){
        throw new ApiError(404,"User not found");
    }
    
    const isPasswordValid = await (userInstance as any).isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessRefreshToken(userInstance);

    userInstance.refreshToken = refreshToken;
    await userInstance.save();
    
    const userResponse = await User.findById(userInstance._id).select("-password");
    
    
    
    res
        .cookie("refreshToken", refreshToken, token_option)
        .cookie("accessToken", accessToken, token_option)
        .json(new ApiResponse(200, userResponse, "User logged in successfully"));
}))

export const Logout=expressRepre({
    summary: "logout user ",

    response: "user logedout "

},
asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken", token_option)
    .clearCookie("accessToken", token_option)
    .json(new ApiResponse(200, "User logged out successfully"));
    logger.info(`User logged out: ${req.user?._id}`);
})
)


export const uploadAvatar=expressRepre(
    {
        summary: "upload avatar",
        FormData:{
            avatar: "avatar.png"
        },
        response: "avatar uploaded"
    },
    asyncHandler(async (req,res)=>{
        const user=await User.findById(req.user?._id);
        if(!user){
            throw new ApiError(404,"User not found");
        }
        if (user.avatar){
            throw new ApiError(400,"Avatar already exists");
        }

        const avatar = (req.files as any)?.avatar?.[0];
        
        console.log(avatar)
        if (!avatar){
            throw new ApiError(400,"Avatar is required");
        }

        const avatarUrl=await uploadOnCloudinary(avatar.path);
        if (!avatarUrl){
            throw new ApiError(500,"Failed to upload avatar");
        }

        user.avatar=avatarUrl.url;
        await user.save();

        res.status(200).json(new ApiResponse(200, user, "Avatar uploaded successfully"));
        
    })
)

export const deleteAvatar=expressRepre(
    {
        summary: "delete avatar",
        response: "avatar deleted"
    },
    asyncHandler(async (req,res)=>{
        const user=await User.findById(req.user?._id);
        if(!user){
            throw new ApiError(404,"User not found");
        }

        if (!user.avatar){
            throw new ApiError(400,"Avatar not found");
        }

        await deleteOnCloudinary(user.avatar);
        
        // Directly update the database to set profileImage to NULL
        user.avatar = null;
        await user.save();

        res.status(200).json(new ApiResponse(200, await User.findById(user._id).select("-password"), "Avatar deleted successfully"));
        
    })
)




export const addResume=expressRepre(
    {
        summary: "upload resume",
        query:{
            resume_id: "695a221e9e5f6b6f4690190e"
        },
        response: "resume uploaded list of links"
    },
    asyncHandler(async (req,res)=>{
        const user=await User.findById(req.user?._id);
        if(!user){
            throw new ApiError(404,"User not found");
        }
       

        const resume=req.query?.resume_id
        
        console.log(resume)
        if (!resume){
            throw new ApiError(400,"Resume is required");
        }

        // const resumeUrl=await uploadOnCloudinary(resume.path);
        // if (!resumeUrl){
        //     throw new ApiError(500,"Failed to upload resume");
        // }

        user.resumes.push(resume);
        await user.save();

        res.status(200).json(new ApiResponse(200, user, "Resume uploaded successfully"));
        
    })
)


export const addAboutUser=expressRepre(
    {
        summary: "add about user list of strings",
       body:{
        aboutUser: "user persuing btech user is ai engineer user is ai enthusiasm"
       },
        response: "about user added list of strings"
    },
    asyncHandler(async (req,res)=>{
        const aboutUser=req.body.aboutUser
        
        console.log(aboutUser)
        if (!aboutUser){
            throw new ApiError(400,"About user is required");
        }
        const user=await User.findByIdAndUpdate(req.user?._id,{aboutUser},{new:true});
        if(!user){
            throw new ApiError(404,"User not found");
        }
       

        

        

        res.status(200).json(new ApiResponse(200, user, "About user added successfully"));
        
    })
)


export const deleteResume=expressRepre(
    {
        summary: "delete resume",
        params:{
            idx: 0
        },
        response: "resume deleted"
    },
    asyncHandler(async (req,res)=>{
        const user=await User.findById(req.user?._id);
        const { idx } = req.params as { idx: string };
        if(!user){
            throw new ApiError(404,"User not found");
        }
        

        if (user.resumes.length - 1 < Number(idx)) {
            throw new ApiError(400, "Resume not found");
        }

        // Directly update the database to set profileImage to NULL
        user.resumes.splice(Number(idx), 1);
        await user.save();

        res.status(200).json(new ApiResponse(200, await User.findById(user._id).select("-password"), "Resume deleted successfully"));
        
    })
)

export const getUserById = expressRepre(
  {
    summary: "send userId get userDetails",
    params: { id: '695a4de254a474d609d097ae' },
    response: "userData",
  },
  asyncHandler(async (req, res) => {
    const { id: _id } = req.params as { id: string };
    console.log(req.params)
    if (!_id) {
      throw new ApiError(400, "User id is required");
    }

    const user = await User.findById(_id).select("-password -refresstoken").lean();
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
  })
);


export const getUser=expressRepre(
    {
        summary:"simply hit get if logged in",
    
        response:"userData"
    },
    asyncHandler(
        async(req,res)=>{
            const _id=req.user?._id
            console.log(req.user._id)
            if(!_id){
                throw new ApiError(400,"user id is required")
            }
            const user=await User.findById(_id).select("-password -refresstoken")
            if(!user){
                throw new ApiError(300,"User does not exist")
            }
            

            res.status(200).json(new ApiResponse(200,user,"user fetched successfully"))
        }
    )
)

export const updateUserData=expressRepre(
    {
        summary:"Update user data json",
        body:{
            "temp_data":`{
  "personal": {
    "name": "John Doe",
    "title": "Software Engineer",
    "phone": "+1 234 567 890",
    "email": "john.doe@example.com",
    "location": "San Francisco, CA",
    "image": {
      "enabled": true,
      "url": ""
    }
  },
  "summary": "Experienced software engineer with a strong background in full-stack development and a passion for building scalable applications.",
  "education": {
    "year": "2016 - 2020",
    "college": "University of California, Berkeley",
    "degree": "Bachelor of Science in Computer Science"
  },
  "skills": {
    "technical": [
      "JavaScript",
      "Node.js",
      "React",
      "MongoDB",
      "Docker"
    ],
    "soft": [
      "Leadership",
      "Communication",
      "Problem Solving"
    ]
  },
  "languages": [
    "English",
    "Spanish"
  ],
  "experience": {
    "details": [
      {
        "role": "Senior Developer",
        "duration": "2021 - Present",
        "company": "Tech Solutions Inc.",
        "responsibilities": [
          "Lead a team of 5 developers in building a high-traffic e-commerce platform.",
          "Implemented microservices architecture using Node.js and AWS.",
          "Optimized database queries, reducing response time by 30%."
        ]
      },
      {
        "role": "Junior Developer",
        "duration": "2020 - 2021",
        "company": "Startup Hub",
        "responsibilities": [
          "Developed and maintained RESTful APIs for a mobile application.",
          "Collaborated with UI/UX designers to implement responsive web interfaces.",
          "Participated in code reviews and unit testing."
        ]
      }
    ]
  },
  "references": [
    {
      "name": "Jane Smith",
      "company": "Tech Solutions Inc.",
      "position": "CTO",
      "phone": "+1 987 654 321",
      "email": "jane.smith@techsolutions.com"
    }
  ]
}`
        },
        response:"updated user"

    },
    asyncHandler(async (req,res)=>{
        const {temp_data}=req.body;
        const user_id=req.user?._id
        if (!temp_data){
            throw new ApiError(400, "temp_data is required")
        }
        console.log(temp_data)
        const user=await User.findByIdAndUpdate(user_id,{temp_data:temp_data},{new:true})
        if (!user){
            throw new ApiError(404, "User not found")
        }
        return res.status(200).json(new ApiResponse(200,user))


    })

)





export const refreshAccessToken=expressRepre({
    summary:"Use this get route for refreshing tokens",
    response:"Token refreshed"
},asyncHandler(async (req,res)=>{

    const incommingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;

    if(!incommingRefreshToken) throw new ApiError(401,"unautherized request");

    const decoded_token = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;

    const user = await User.findById(decoded_token?._id);

    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");

    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessRefreshToken(user);
    if (user) {
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });
    }

    return res.status(200)
    .cookie("accessToken",accessToken,token_option)
    .cookie("refreshToken",newRefreshToken,token_option)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access token refreshed"
        )
    )
    



}))
