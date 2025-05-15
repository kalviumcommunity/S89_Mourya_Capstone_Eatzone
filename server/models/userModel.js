import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:false}, // Made password optional for Google auth
    googleId:{type:String,sparse:true}, // Added for Google authentication
    profileImage:{type:String}, // Profile image URL
    cartData:{type:Object,default:{}}
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;