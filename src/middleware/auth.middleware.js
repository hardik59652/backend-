import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import JWT from "jsonwebtoken"
import { User } from "../models/user.models.js"
export const verifyJWT=asyncHandler(async (req,_,next)=>{
    try {
        const token=req.cookies?.accesstoken || (req.header("Authorization")?.replace(
            "Bearer ",""
        ))
        console.log(token);
        
        if(!token){
            throw new apiError(401,"unauthorized request")
        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshtoken")
        console.log(user)
        if(!user){
            throw new apiError(401,"invalid access 5 token")

        }
        req.user=user;
        next()
    } catch (error) {
        throw new apiError(401,"invalid access token")
    }
})
