const express = require('express');
const router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const {
  createUser,
  User
}=require("../models/user");

const checkLogin=require("../middleware/checklogin")

router.post('/signUp', async (req, res) => {
    try {
        const { name, email, password, image } = req.body;

        // Name validation
        if(!name || name.length < 2){
            return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
        }

        // Email validation
        if(!validator.isEmail(email)){
            return res.status(400).json({ success: false, message: "Invalid email address" });
        }

        // Password validation: min 6 chars, at least one number and one letter
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if(!password || !passwordRegex.test(password)){
            return res.status(400).json({ success: false, message: "Password must be at least 6 chars and contain one letter and one number" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await createUser({
            name,
            email,
            password: hashedPassword,
            image: image || null // default null if not provided
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: user._id
        });

    } catch (err) {
        // Duplicate email error
        if(err.code === 11000){
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Other errors
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
        res.cookie("isLoggedIn", true, {
            httpOnly: true,           // safer, not accessible via JS
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.json({ success: true, message: "Login successful",userId:user._id});

    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
});





router.put("/updateUser/:id",checkLogin, async (req, res) => {
    const userId = req.params.id;
    const updates = req.body; 

    try {
       
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true } // returns updated document & validates schema
        );

        if(!updatedUser) return res.status(404).json({ success:false, message:"User not found" });

        res.json({ success:true, message:"User updated", user: updatedUser });

    } catch(err) {
        res.status(500).json({ success:false, message: err.message });
    }
});



router.get("/getUser/:id",async (req,res)=>{
    const userId=req.params.id;
    try{
        const user=await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        res.json({success:true,user});
    }
    catch(err){
        res.status(500).json({success:false,message:err.message});
    }
})

module.exports = router;
