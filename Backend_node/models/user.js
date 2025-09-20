const User=require("../utils/schema")

async function createUser({name,email,password,image}) {
   try{
     const newUser=new User({
        name:name,
        email:email,
        password:password,
        image:image
    });

    await newUser.save();
    console.log("User created",newUser);
    return newUser
   }
   catch(err){
    console.error("Error:",err);

   }
    
}

module.exports = {
  createUser,
  User
};
