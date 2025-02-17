import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { du_material } from "../models/du_material.model.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const CreateDu_material = async (req, res) => {
  const adminId = req.adminId;

  try {
    const requiredFields = [
      "ppt_upload",
      "lab_upload",
      "note_upload",
      "assignment_upload",
      "uni_midPaper_upload",
      "uni_finalPaper_upload",
      "gtu_paper_upload",
    ];

    const uploadedFiles = {};
    for (const field of requiredFields) {
      if (req.files && req.files[field]) {
        uploadedFiles[field] = req.files[field];
      }
    }

    const cloudinaryResults = {};
    for (const field in uploadedFiles) {
      const file = uploadedFiles[field];
      const uploadPath = path.join(__dirname, "../uploads", file.name);

      await file.mv(uploadPath);

      const result = await cloudinary.uploader.upload(uploadPath, {
        resource_type: "raw",
        folder: "du_material",
      });

      fs.unlinkSync(uploadPath);

      cloudinaryResults[field] = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const newMaterial = new du_material({
      ch_number: req.body.ch_number,
      ch_name: req.body.ch_name,
      ppt_upload: cloudinaryResults.ppt_upload || null,
      lab_number: req.body.lab_number,
      lab_name: req.body.lab_name,
      lab_upload: cloudinaryResults.lab_upload || null,
      note_number: req.body.note_number,
      note_name: req.body.note_name,
      note_upload: cloudinaryResults.note_upload || null,
      assignment_number: req.body.assignment_number,
      assignment_name: req.body.assignment_name,
      assignment_upload: cloudinaryResults.assignment_upload || null,
      uni_midPaper_year: req.body.uni_midPaper_year,
      uni_midPaper_upload: cloudinaryResults.uni_midPaper_upload || null,
      uni_finalPaper_year: req.body.uni_finalPaper_year,
      uni_finalPaper_upload: cloudinaryResults.uni_finalPaper_upload || null,
      gtu_paper: req.body.gtu_paper,
      gtu_paper_upload: cloudinaryResults.gtu_paper_upload || null,
      name: req.body.name,
      photo: req.body.photo,
      insta_url: req.body.insta_url,
      linkedin_url: req.body.linkedin_url,
      git_url: req.body.git_url,
      creatorId: adminId,
      sem: req.body.sem,
      subject: req.body.subject,
    });

    await newMaterial.save();
    res.status(201).json({ message: "Files uploaded and data saved!" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred", details: error.message });
  }
};


export const updateDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const updatedMaterial = await du_material.findByIdAndUpdate(
      du_materialId,
      { ...req.body },
      { new: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Update successful", data: updatedMaterial });
  } catch (error) {
    res.status(500).json({ error: "Error updating material", details: error.message });
  }
};


export const deleteDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const deletedMaterial = await du_material.findByIdAndDelete(du_materialId);

    if (!deletedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting material", details: error.message });
  }
};


export const downloadDuMaterial = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const material = await du_material.findById(du_materialId);

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    const fileField = req.query.file;
    const fileFields = [
      "ppt_upload",
      "lab_upload",
      "note_upload",
      "assignment_upload",
      "uni_midPaper_upload",
      "uni_finalPaper_upload",
      "gtu_paper_upload",
    ];

    if (!fileFields.includes(fileField)) {
      return res.status(400).json({ error: "Invalid file type requested" });
    }

    const downloadUrl = material[fileField]?.url;
    if (!downloadUrl) {
      return res.status(404).json({ error: "File not found" });
    }

    res.redirect(downloadUrl);
  } catch (error) {
    res.status(500).json({ error: "Error downloading material", details: error.message });
  }
};


export const getDu_material = async (req, res) => {
  try {
    const duMaterials = await du_material.find({});
    
    if (!duMaterials || duMaterials.length === 0) {
      return res.status(404).json({ error: "No materials found" });
    }
    
    // Respond with the duMaterials array
    res.status(200).json({ duMaterials });
  } catch (error) {
    res.status(500).json({ error: "Error fetching data", details: error.message });
  }
};



export const getByIdDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const material = await du_material.findById(du_materialId);

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Material fetched successfully", data: material });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving data", details: error.message });
  }
};


export const getSignedUrl = async (req, res) => {
  try {
    const filePath = req.query.file;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const signedUrl = cloudinary.url(filePath, {
      sign_url: true,
      resource_type: "raw",
    });

    res.json({ signedUrl });
  } catch (error) {
    res.status(500).json({ error: "Error generating signed URL", details: error.message });
  }
};
