import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Note: Prices are now stored directly in INR, no conversion needed

//placing user order for client
const placeOrder = async (req,res) =>{
    const FRONTEND_URL = "http://localhost:5173"

    try {
        console.log("Received order data (INR prices):", req.body);

        // Validate required fields
        if (!req.body.userId) {
            return res.json({success:false,message:"User ID is required"});
        }
        if (!req.body.items || req.body.items.length === 0) {
            return res.json({success:false,message:"Order items are required"});
        }
        if (!req.body.amount) {
            return res.json({success:false,message:"Order amount is required"});
        }
        if (!req.body.address) {
            return res.json({success:false,message:"Delivery address is required"});
        }

        const newOrder = new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save();
        console.log("Order saved successfully:", newOrder._id);

        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});
        console.log("Cart cleared for user:", req.body.userId);

        const line_items = req.body.items.map((item)=>{
            // Prices are already in INR, just convert to paise for Stripe
            console.log(`Item: ${item.name}, INR: ₹${item.price}`);

            return {
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:item.name
                    },
                    unit_amount:Math.round(item.price*100) // Convert INR to paise
                },
                quantity:item.quantity
            };
        })

        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:50*100 // ₹50 in paise
            },
            quantity:1
        })

        // Amount is already in INR, just add delivery fee
        const totalAmountINR = req.body.amount; // Already includes delivery fee from frontend
        const stripeMinimumInINR = 50; // Stripe's minimum for INR currency

        console.log(`Order total: ₹${totalAmountINR} (including ₹50 delivery)`);

        // If order is below Stripe minimum, add a small order fee to meet the requirement
        if (totalAmountINR < stripeMinimumInINR) {
            const smallOrderFee = stripeMinimumInINR - totalAmountINR + 1; // Add ₹1 buffer
            line_items.push({
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:"Small Order Fee (to meet payment processor minimum)"
                    },
                    unit_amount:Math.round(smallOrderFee * 100)
                },
                quantity:1
            });
            console.log(`Added small order fee of ₹${smallOrderFee} to meet minimum requirement`);
        } else {
            console.log(`Order total ₹${totalAmountINR} meets Stripe minimum requirement`);
        }

        // Calculate total amount being sent to Stripe
        const stripeTotal = line_items.reduce((total, item) => {
            return total + (item.price_data.unit_amount * item.quantity);
        }, 0);

        console.log("Creating Stripe session with line_items:", line_items);
        console.log(`Total amount being sent to Stripe: ₹${stripeTotal/100} (${stripeTotal} paise)`);

        // Verify all line items have INR currency
        const currencyCheck = line_items.every(item => item.price_data.currency === "inr");
        console.log("All line items using INR currency:", currencyCheck);

        const sessionConfig = {
            line_items:line_items,
            mode:"payment",
            locale:"auto", // Let Stripe auto-detect locale
            payment_method_types:["card"], // Specify payment methods
            billing_address_collection: "required",
            customer_creation: "always", // Always create customer
            metadata: {
                currency: "INR",
                country: "IN"
            },
            success_url:`${FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
        };

        console.log("Session configuration:", JSON.stringify(sessionConfig, null, 2));

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log("Stripe session details:", {
            id: session.id,
            currency: session.currency,
            amount_total: session.amount_total,
            url: session.url
        });

        console.log("Stripe session created successfully:", session.id);
        res.json({success:true,session_url:session.url})
    } catch (error) {
        console.log("Error in placeOrder:", error);
        res.json({success:false,message:"Error placing order: " + error.message})
    }

}

const verifyOrder = async (req,res) => {
    const {orderId,success} = req.body;
    try {
        if (success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"not paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


//user orders for frontend
const userOrders = async (req,res) =>{
    try {
        // For GET requests, userId comes from auth middleware via req.userId
        const userId = req.userId || req.body.userId;
        console.log("Fetching orders for user:", userId);

        const orders = await orderModel.find({userId:userId})
        console.log("Found orders:", orders.length);

        res.json({success:true,data:orders})
    } catch (error) {
        console.log("Error fetching user orders:", error);
        res.json({success:false,message:"Error"})
    }
}

//Listing orders for admin panel
const listOrders = async (req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status
const updateStatus = async (req,res)=>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}