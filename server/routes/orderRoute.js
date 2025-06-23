import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, verifyOrder,userOrders,listOrders,updateStatus,deleteOrder,editOrder } from "../controllers/orderController.js"

const orderRouter = express.Router()

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.get('/list',listOrders)
orderRouter.post('/status',updateStatus)
orderRouter.post('/delete',deleteOrder)  // Admin only - delete order
orderRouter.post('/edit',editOrder)      // Admin only - edit order

export default orderRouter;
