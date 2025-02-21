// du_material.controller.js
import cloudinary from "../cloudinaryConfig.js";
import { du_material } from "../models/du_material.model.js";

export const CreateDu_material = async (req, res) => {
  try {
    console.log("Request Files:", req.files); // Log incoming files
    console.log("Request Body:", req.body); // Log incoming text fields

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const fileFields = [
      "ppt_upload",
      "lab_upload",
      "note_upload",
      "assignment_upload",
      "uni_midPaper_upload",
      "uni_finalPaper_upload",
      "gtu_paper_upload",
    ];

    const uploadResults = {};

    for (const field of fileFields) {
      if (req.files[field]) {
        const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
        console.log(`Uploading ${field}:`, file.tempFilePath); // Log file path
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "du_material",
          resource_type: "auto",
        });
        uploadResults[field] = result.secure_url;
      }
    }

    const textFields = {
      ch_number: req.body.ch_number || "",
      ch_name: req.body.ch_name || "",
      lab_number: req.body.lab_number || "",
      lab_name: req.body.lab_name || "",
      note_number: req.body.note_number || "",
      note_name: req.body.note_name || "",
      assignment_number: req.body.assignment_number || "",
      assignment_name: req.body.assignment_name || "",
      uni_midPaper_year: req.body.uni_midPaper_year || "",
      uni_finalPaper_year: req.body.uni_finalPaper_year || "",
      gtu_paper: req.body.gtu_paper || "",
      name: req.body.name || "",
      insta_url: req.body.insta_url || "",
      linkedin_url: req.body.linkedin_url || "",
      git_url: req.body.git_url || "",
      sem: req.body.sem || "",
      subject: req.body.subject || "",
    };

    const newMaterial = new du_material({
      ...textFields,
      ...uploadResults,
    });

    const savedMaterial = await newMaterial.save();

    res.status(201).json({
      message: "Materials uploaded and saved successfully",
      data: savedMaterial,
    });
  } catch (error) {
    console.error("Full Upload Error:", error.stack); // Log full error stack
    res.status(500).json({
      error: "Failed to upload materials",
      details: error.message || "Unknown error",
      stack: error.stack, // Include stack trace for debugging
    });
  }
};
