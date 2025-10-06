import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getDeliveryCosts,
  updateDeliveryCosts,
} from "../controllers/deliveryCostController.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// Delivery cost routes
router.get("/", getDeliveryCosts);
router.post("/", updateDeliveryCosts);

export default router;