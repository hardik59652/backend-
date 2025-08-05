import mongoose from "mongoose";
const subscriptionschema=mongoose.Schema({
    subsciber:{
        type:mongoose.Schema.Types.ObjectId,
    ref:"User"},
    channel:{
        type:{
            type:mongoose.Schema.Types.ObjectId,
        ref:"User"}
    }
    
},{
    timestamps:true
})
export const Subscription=mongoose.model("Subscription",subscriptionschema)