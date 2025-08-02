import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";
dotenv.config({
    path:"./env"
})

connectDB()
.then(
    ()=>{
        app.listen(process.env.PORT||8000,()=>{
            console.log(`server is running on the ${process.env.PORT}`)
        })
    }
)
.catch((err)=>{
    console.log("mongo db connection failed",err)
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
