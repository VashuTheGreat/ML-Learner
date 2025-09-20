function checkLogin(req,res,next){
    const isLoggedIn=req.cookies.isLoggedIn;
    if(!isLoggedIn){
        return res.status(401).json({success:false,message:"You are not logged in,please login first"});

    }
    req.isLoggedIn=true;
    next();
}
module.exports=checkLogin;