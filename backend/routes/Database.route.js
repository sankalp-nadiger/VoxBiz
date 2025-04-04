import express from "express";
import { createDatabase, connectDatabase, disconnectDatabase, listDatabases } from "../controllers/Database.controller.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/create", AuthUser, createDatabase);
router.post("/connect", AuthUser, connectDatabase);
router.post("/disconnect", AuthUser, disconnectDatabase);
router.get("/list", AuthUser, listDatabases);

export default router;