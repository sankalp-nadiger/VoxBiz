import express from "express";
import { visualizeData } from "../controllers/Visualization.controller.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/generate", AuthUser, visualizeData);

export default router;