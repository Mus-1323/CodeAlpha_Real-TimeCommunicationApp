import mongoose from "mongoose";
const meetingSchema=new mongoose.Schema({
    username:{
        type:String,required:true
    },
    mettingcode:{type:Number,required:true},
    date:{type:Date,default:Date.now,required:true},
});
const Meeting =mongoose.model("Meet",meetingSchema);
export {Meeting};