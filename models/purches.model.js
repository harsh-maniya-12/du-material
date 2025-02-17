import mongoose from "mongoose";


import { buyAssignment } from "../controllers/du_material.controller.js";
const pruchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  assignmentId: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
  },
});

export const Purchase = mongoose.model("Purchase", pruchaseSchema);