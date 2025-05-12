import mongoose from "mongoose";

//db connection

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://kadalimouryas89:18011801@cluster0.cbk0vyf.mongodb.net/eatzone').then(()=>console.log("DB COnnected"));
}