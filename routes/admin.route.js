import express from "express";
import { login, logout, signup } from "../controllers/admin.controller.js";




const router = express.Router(); // Keep the local declaration as 'router'
router.post("/signup",signup); // "/signup" is endpoint for client and "signup" is callback function  
router.post("/login",login);

router.get("/logout",logout);

export default router;
