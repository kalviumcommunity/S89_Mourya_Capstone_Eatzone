import express from "express";
import { getCart, updateCart, clearCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

// Cart routes
cartRouter.get("/", getCart);
cartRouter.post("/get", getCart); // Add POST route for /api/cart/get
cartRouter.post("/add", updateCart); // Add POST route for /api/cart/add (maps to updateCart)
cartRouter.post("/update", updateCart);
cartRouter.post("/clear", clearCart);

export default cartRouter;
