import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://kadalimouryas89:18011801@cluster0.gz8rg3i.mongodb.net/eat-demo').then(()=>console.log("DB COnnected"));
}