import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv"



connectDB()
dotenv.config({
    path:"./env"
})














// const app =express()
// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log(error)
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("app is listening on port ")
//         })
//     } catch (error) {
//         console.log(error)
//         throw error;
        
//     }
// })()
