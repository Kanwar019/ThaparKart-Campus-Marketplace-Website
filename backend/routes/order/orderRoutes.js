// backend/routes/order/orderRoutes.js
import express from "express";
import { authRequired } from "../../middleware/authMiddleware.js";
import { createOrder, getMyOrders } from "../../controllers/orderController.js";

const router = express.Router();

router.post("/", authRequired, createOrder);
router.get("/", authRequired, getMyOrders);

export default router;
