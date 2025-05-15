import express from "express";
import { getCart, updateCart, clearCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

// Cart routes
cartRouter.get("/", getCart);
cartRouter.post("/update", updateCart);
cartRouter.post("/clear", clearCart);

export default cartRouter;
