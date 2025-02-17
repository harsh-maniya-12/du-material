import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";

// Import Routes

import du_material_Route from "./routes/du_material.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import authRoutes from "./routes/admin.route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const DB_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(fileUpload()); // ✅ Ensure file upload middleware is before routes

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Connect to MongoDB
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error.message));
  app.use(express.json()); // 🔹 Parse JSON requests
  app.use(express.urlencoded({ extended: true })); // 🔹 Parse URL-encoded requests
  
// Define Routes
app.use("/app/v1/du_material", du_material_Route);
app.use("/app/v1/user", userRoute);
app.use("/app/v1/admin", adminRoute);
app.use("/app/v1", authRoutes);


// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
