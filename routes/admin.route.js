import express from "express";
import { login, logout, signup } from "../controllers/admin.controller.js";

const router = express.Router();

// Define routes with the correct path
router.post("/admin/signup", signup);
router.post("/login", login);
router.get("/admin/logout", logout);

export default router;
