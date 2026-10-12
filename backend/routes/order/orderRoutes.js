// backend/routes/order/orderRoutes.js
import express from "express";
import { authRequired } from "../../middleware/authMiddleware.js";
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus } from "../../controllers/orderController.js";

const router = express.Router();

router.post("/", authRequired, createOrder);
router.get("/", authRequired, getMyOrders);
router.get("/selling", authRequired, getSellerOrders);
router.patch("/:id/status", authRequired, updateOrderStatus);

export default router;
