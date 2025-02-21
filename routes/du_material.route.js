// routes/du_material.route.js
import express from "express";
import { CreateDu_material, updateDu_material, deleteDu_material, getDu_material, getByIdDu_material, downloadDuMaterial } from "../controllers/du_material.controller.js"; // Import getSignedUrl correctly
import adminMiddleware from "../middleware/admin.mid.js";

const router = express.Router();



router.post("/upload", adminMiddleware, CreateDu_material);
router.put("/update/:du_materialId", adminMiddleware, updateDu_material);
router.delete("/delete/:du_materialId", adminMiddleware, deleteDu_material);
router.get("/get", getDu_material);
router.get("/get/:du_materialId", getByIdDu_material);



// Add the download route here
router.get("/download/:du_materialId", downloadDuMaterial); // This route handles download requests

// Add the signed URL route
router.get('/get-signed-url', getSignedUrl); // Fixed import

export default router;
