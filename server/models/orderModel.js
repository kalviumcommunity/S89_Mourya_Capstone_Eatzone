import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,required:true,default:"Food processing"},
    date:{type:Date,default:Date.now()},
    payment:{type:Boolean,default:false},
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' }, // Associate with admin
    firebaseUID: { type: String } // Store admin's Firebase UID for quick queries
}, {
    timestamps: true // Add createdAt and updatedAt
})
  
const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);

export default orderModel;

