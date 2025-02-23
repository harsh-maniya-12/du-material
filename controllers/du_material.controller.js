import { v2 as cloudinary } from "cloudinary";

// import path from "path";
import path  from "path";
// import fs from "fs";
import fs from "fs";
import { fileURLToPath } from "url";
import { du_material } from "../models/du_material.model.js";




// Ensure Cloudinary is configured (move to a config file in production)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Create New DU Material
export const CreateDu_material = async (req, res) => {
  const adminId = req.adminId; // Set by adminMiddleware

  try {
    // Validate adminId (from middleware)
    if (!adminId) {
      return res.status(403).json({ error: "Unauthorized: Admin ID missing" });
    }

    // Define file fields
    const fileFields = [
      "ppt_upload",
      "lab_upload",
      "note_upload",
      "assignment_upload",
      "uni_midPaper_upload",
      "uni_finalPaper_upload",
      "gtu_paper_upload",
    ];

    // Check for uploaded files
    const uploadedFiles = {};
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    for (const field of fileFields) {
      if (req.files[field]) {
        uploadedFiles[field] = req.files[field]; // Expecting multer or similar
      }
    }

    // Upload files to Cloudinary
    const cloudinaryResults = {};
    for (const field in uploadedFiles) {
      const file = uploadedFiles[field];
      const uploadPath = path.join(__dirname, "../uploads", file.name);

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to temporary path
      await file.mv(uploadPath);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(uploadPath, {
        resource_type: "raw",
        folder: "du_material",
      });

      // Clean up temporary file
      fs.unlinkSync(uploadPath);

      cloudinaryResults[field] = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create new material document
    const newMaterial = new du_material({
      ch_number: req.body.ch_number || "",
      ch_name: req.body.ch_name || "",
      ppt_upload: cloudinaryResults.ppt_upload || null,
      lab_number: req.body.lab_number || "",
      lab_name: req.body.lab_name || "",
      lab_upload: cloudinaryResults.lab_upload || null,
      note_number: req.body.note_number || "",
      note_name: req.body.note_name || "",
      note_upload: cloudinaryResults.note_upload || null,
      assignment_number: req.body.assignment_number || "",
      assignment_name: req.body.assignment_name || "",
      assignment_upload: cloudinaryResults.assignment_upload || null,
      uni_midPaper_year: req.body.uni_midPaper_year || "",
      uni_midPaper_upload: cloudinaryResults.uni_midPaper_upload || null,
      uni_finalPaper_year: req.body.uni_finalPaper_year || "",
      uni_finalPaper_upload: cloudinaryResults.uni_finalPaper_upload || null,
      gtu_paper: req.body.gtu_paper || "",
      gtu_paper_upload: cloudinaryResults.gtu_paper_upload || null,
      name: req.body.name || "",
      photo: req.body.photo || null, // Assuming photo is a URL or null
      insta_url: req.body.insta_url || "",
      linkedin_url: req.body.linkedin_url || "",
      git_url: req.body.git_url || "",
      creatorId: adminId,
      sem: req.body.sem || "",
      subject: req.body.subject || "",
    });

    // Save to MongoDB
    const savedMaterial = await newMaterial.save();
    console.log("Saved Material:", JSON.stringify(savedMaterial, null, 2));

    res.status(201).json({
      message: "Files uploaded and data saved!",
      data: savedMaterial,
    });
  } catch (error) {
    console.error("CreateDu_material Error:", error);
    res.status(500).json({ error: "An error occurred", details: error.message });
  }
};

// 🔹 Update DU Material
export const updateDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const updatedMaterial = await du_material.findByIdAndUpdate(
      du_materialId,
      { ...req.body, updatedAt: Date.now() }, // Add timestamp
      { new: true, runValidators: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Update successful", data: updatedMaterial });
  } catch (error) {
    console.error("updateDu_material Error:", error);
    res.status(500).json({ error: "Error updating material", details: error.message });
  }
};

// 🔹 Delete DU Material
export const deleteDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const deletedMaterial = await du_material.findByIdAndDelete(du_materialId);

    if (!deletedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Optionally delete files from Cloudinary
    const fileFields = [
      "ppt_upload",
      "lab_upload",
      "note_upload",
      "assignment_upload",
      "uni_midPaper_upload",
      "uni_finalPaper_upload",
      "gtu_paper_upload",
    ];
    for (const field of fileFields) {
      if (deletedMaterial[field]?.public_id) {
        await cloudinary.uploader.destroy(deletedMaterial[field].public_id, {
          resource_type: "raw",
        });
      }
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("deleteDu_material Error:", error);
    res.status(500).json({ error: "Error deleting material", details: error.message });
  }
};

// 🔹 Download DU Material File
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
    console.error("downloadDuMaterial Error:", error);
    res.status(500).json({ error: "Error downloading material", details: error.message });
  }
};

// 🔹 Get All DU Materials
export const getDu_material = async (req, res) => {
  try {
    const duMaterials = await du_material.find({}).lean(); // Use lean for performance
    if (!duMaterials || duMaterials.length === 0) {
      return res.status(404).json({ error: "No materials found" });
    }

    console.log("Fetched Materials Count:", duMaterials.length);
    res.status(200).json({ duMaterials });
  } catch (error) {
    console.error("getDu_material Error:", error);
    res.status(500).json({ error: "Error fetching data", details: error.message });
  }
};

// 🔹 Get DU Material by ID
export const getByIdDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const material = await du_material.findById(du_materialId).lean();
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Material fetched successfully", data: material });
  } catch (error) {
    console.error("getByIdDu_material Error:", error);
    res.status(500).json({ error: "Error retrieving data", details: error.message });
  }
};

// 🔹 Generate Signed URL for Secure Download
export const getSignedUrl = async (req, res) => {
  try {
    const filePath = req.query.file;
    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const signedUrl = cloudinary.url(filePath, {
      sign_url: true,
      resource_type: "raw",
      secure: true,
    });

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error("getSignedUrl Error:", error);
    res.status(500).json({ error: "Error generating signed URL", details: error.message });
  }
};
