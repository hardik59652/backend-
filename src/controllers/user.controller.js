import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import { response } from "express"
const registerUser=asyncHandler(async (req,res)=>{
  const {fullname,email,username,password}=req.body
  if([fullname,email,username,password].some((fileds)=>fileds?.trim()==="")){
    throw new apiError(400,"all fileds are required")
  }
  const existsuser= await User.findOne({
    $or:[{fullname},{email}]
  })
  if(existsuser){
    throw new apiError(409,"User with this email or username already exists")
  }
  // console.log(req.files)
  const avatarLocalPath=req.files?.avatar[0]?.path
  const coverImageLocalPath=req.files?.coverimage[0]?.path
   
  if(!avatarLocalPath){
    throw new apiError(400,"avatar file is mandatory")
  }
   
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  
  const coverimage=await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){
    throw new apiError(400,"Avatar field is mandatory")
  }
  const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverimage:coverimage?.url||"",
    email,
    username:username.toLowerCase(),
    password
  })
  const createadUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  console.log(createadUser)
  if(!createadUser){
    throw new apiError(500,"something went wrong while registering a user")
  }
  return res.status(201).json(new apiResponse(200,createadUser,"user registered successfully"))
})
export {
    registerUser
}