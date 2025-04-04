import express from "express";
import { generateChart } from "../controllers/Visualization.controller.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/generate", AuthUser, generateChart);

export default router;