import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: [true,"fullName name cannot be empty"],
        trim:true
    },
    password: {
        type: String,
        required: [true,"password is required"],
    },
    avatar: {
        type: String ,// Cloudinary image URL

    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        trim:true
    },
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    refreshToken: {
        type: String
    },
    resumes: [{type:mongoose.Schema.ObjectId,ref:"templates",trim:true}], // URLs of previously generated resumes
    aboutUser: {type:String,trim:true}, // statements about user
    temp_data:Object
},
{
    timestamps: true // createdAt & updatedAt auto
}
);
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password:any){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema);

export default User;
