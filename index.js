import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";

// Import Routes
import du_material_Route from "./routes/du_material.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js"; // ✅ Fixed duplicate import

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const DB_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// ✅ Correct CORS Configuration
const allowedOrigins = [
  "https://dumaterial.vercel.app", // ✅ Your frontend URL
  "http://localhost:5173", // ✅ For local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // ✅ Allow requests from these origins
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Required for cookies, tokens, etc.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
    exposedHeaders: ["Authorization"],
  })
);

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://dumaterial.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});


// Connect to MongoDB
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) =>
    console.error("❌ MongoDB Connection Error:", error.message)
  );

// Define Routes
app.use("/app/v1/du_material", du_material_Route);
app.use("/app/v1/user", userRoute);
app.use("/app/v1/admin", adminRoute); // ✅ Removed duplicate `/app/v1`

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
