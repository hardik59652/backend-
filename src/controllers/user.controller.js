import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import { response } from "express"
 // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
const generateAcessAndRefreshToken=async (userID)=>{

  try {
    const user=await User.findById(userID);
    const accesstoken= user.generateAccessToken();
    const refreshtoken=  user.generateRefreshToken();
    user.refreshtoken=refreshtoken
   await user.save({validateBeforeSave:false})
   return {accesstoken,refreshtoken}

  } catch (error) {
    console.log(error.message);
    
    throw new apiError(500,"something went worng while genrating refresh token and access token")

    
  }


}
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
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

const loginUser=asyncHandler(async (req,res)=>{ 
    const {email,username,password}=req.body
    if(!(email||username)){
      throw new apiError(400,"username or email required")
    }
    const user=await User.findOne({
      $or:[{email},{username}]
    })
    if(!user){
      throw new apiError(404 ,"user does not exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      throw new apiError(401,"invalid user credential")
    }
    const {accesstoken,refreshtoken}= await generateAcessAndRefreshToken(user._id)
    const loggedinuser=await User.findById(user._id).select("-password -refreshToken")
    const options={
      httpOnly:true,
      secure:true
    }
    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
      new apiResponse(200,
        { 
          user:loggedinuser,
          accesstoken,
          refreshtoken
        },
        "User logged in successfully"
      ) 
    )
} )
const logoutUser=asyncHandler(async (req,res)=>{
  User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshtoken:undefined
        }
      },{
        new:true,
      }
  )
  const options={
    httpOnly:true,
    secure:true
  }
   return res.status(200).clearCookie("accesstoken",options).clearCookie("refreshtoken",options).json(new apiResponse(200 ,"logout"))
})   
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshtoken||req.body.refreshtoken
    if(!incomingRefreshToken){
      throw new apiError(401,"unauthorized request")

    }
   try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=User.findById(decodedToken?._id)
     if(!user){
       throw new apiError(401,"invalid user token")
 
     }
     if(incomingRefreshToken!==user?.refreshtoken){
       throw new apiError(401,"refreshtoken expires")
 
     }
     const options={
       httpOnly:true,
       secure:true
     }
     const {accesstoken,newrefreshtoken}=await generateAcessAndRefreshToken(user._id)
     return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtoken",newrefreshtoken,options).json(
       new apiResponse(
         200,
         {actiontoken,refreshtoken:newrefreshtoken},
         "action token refreshed"
       )
     )
   } catch (error) {
    throw new apiError(401,error?.message||"invalid refresh token")
    
   }
})
const changedCurrentPassword=asyncHandler(async (req,res) => {
  const {oldPassword,newPassword}=req.body
  const user =await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new apiError(400,"old password doesn't match")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new apiResponse(200,{},"password changed successfully"))
  
})
const getCurrentUser=asyncHandler(async (req,res) => {
  return res.status(200).json(200,req.user,"curret user fetch successfully")
  
})
const updateAccountDetail=asyncHandler(async (req,res) => {
  const {fullname,email}=req.body
  if(!(fullname||email)){
    throw new apiError(400,"all fields are mandatory")
  }
  const user=User.findByIdAndUpdate(req.user?._id,{
    $set:{
      fullname,
      email

    }
  },{
    new:true
  }).select("-password")
  return res.status(200).json(new apiResponse(200,user,"Account updated successfully"))

})
const updateAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new apiError(400,"avatar file is missing")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new apiError(400,"Error while uploading avatar")
  }
  const user=await User.findByIdAndUpdate(req.body._id,
    {
      $set:{
        avatar:avatar.url
      },
      
    }, {new:true}
  ).select("-password")
  return res.status(200).json(200,user,"avatar image update succesfully")
  
})
const updateCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
    throw new apiError(400,"coverimage not found")
  }
  const coverimage=await uploadOnCloudinary(coverImageLocalPath)
  if(!coverimage.url){
    throw new apiError(400,"error while upload cover image")
  }

const user=await User.findByIdAndUpdate(req.body._id,{
  $set:{
    coverimage:coverimage.url
  }

},{new:true}).select("-password")
return res.status(200).json(200,user,"cover image update succesfully")
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changedCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateAvatar,
    updateCoverImage,
}