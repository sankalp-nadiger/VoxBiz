import express from "express";
import { register, login , sendResetCode , verifyCode , resetPassword,logout , me} from "../controllers/Auth.controller.js";
import { getGoogleAuthURL, handleGoogleCallback } from "../controllers/GoogleAuth.controller.js";


const router = express.Router();
router.get('/me', me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout)
router.post("/send-reset-code", sendResetCode);
router.post("/verify", verifyCode);
router.post("/reset-password", resetPassword);
router.get("/google-url", getGoogleAuthURL);
router.post("/google/callback", handleGoogleCallback);


export default router;