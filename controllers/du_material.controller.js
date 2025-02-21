// du_material.controller.js
import cloudinary from "../cloudinaryConfig.js"; // Ensure path is correct
import { du_material } from "../models/du_material.model.js"; // MongoDB model

// Create a new DU material with file uploads and save to MongoDB
export const CreateDu_material = async (req, res) => {
  try {
    console.log("Received req.files:", JSON.stringify(req.files, null, 2)); // Log incoming files
    console.log("Received req.body:", req.body); // Log incoming text fields

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
        console.log(`Processing ${field}:`, {
          name: file.name,
          tempFilePath: file.tempFilePath,
          size: file.size,
        });

        // Check if tempFilePath is valid
        if (!file.tempFilePath || file.tempFilePath === '') {
          // Fallback: Use file.data (buffer) if tempFilePath is missing
          if (!file.data) {
            throw new Error(`No valid tempFilePath or data for ${field}`);
          }
          console.log(`Using file buffer for ${field} since tempFilePath is missing`);
          const result = await cloudinary.uploader.upload_stream(
            { folder: "du_material", resource_type: "auto" },
            (error, result) => {
              if (error) throw error;
              return result;
            }
          ).end(file.data);
          uploadResults[field] = result.secure_url;
        } else {
          // Normal upload with tempFilePath
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "du_material",
            resource_type: "auto",
          });
          uploadResults[field] = result.secure_url;
        }
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
      stack: error.stack,
    });
  }
};

// Update an existing DU material
export const updateDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const uploadResults = {};
    if (req.files && Object.keys(req.files).length > 0) {
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
        if (req.files[field]) {
          const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
          if (!file.tempFilePath || file.tempFilePath === '') {
            if (!file.data) throw new Error(`No valid tempFilePath or data for ${field}`);
            const result = await cloudinary.uploader.upload_stream(
              { folder: "du_material", resource_type: "auto" },
              (error, result) => {
                if (error) throw error;
                return result;
              }
            ).end(file.data);
            uploadResults[field] = result.secure_url;
          } else {
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: "du_material",
              resource_type: "auto",
            });
            uploadResults[field] = result.secure_url;
          }
        }
      }
    }

    const updatedData = {
      ...req.body,
      ...uploadResults,
    };

    const updatedMaterial = await du_material.findByIdAndUpdate(
      du_materialId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.status(200).json({ message: "Update successful", data: updatedMaterial });
  } catch (error) {
    console.error("Update Error:", error.stack);
    res.status(500).json({ error: "Error updating material", details: error.message });
  }
};

// Delete a DU material
export const deleteDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const material = await du_material.findById(du_materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
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

    for (const field of fileFields) {
      if (material[field]) {
        const publicId = material[field].split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`du_material/${publicId}`).catch(err => {
          console.error(`Failed to delete ${field} from Cloudinary:`, err);
        });
      }
    }

    await du_material.findByIdAndDelete(du_materialId);

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.stack);
    res.status(500).json({ error: "Error deleting material", details: error.message });
  }
};

// Download a DU material file
export const downloadDuMaterial = async (req, res) => {
  const { du_materialId } = req.params;
  const { file: fileField } = req.query;

  try {
    const material = await du_material.findById(du_materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
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

    if (!fileFields.includes(fileField)) {
      return res.status(400).json({ error: "Invalid file type requested" });
    }

    const downloadUrl = material[fileField];
    if (!downloadUrl) {
      return res.status(404).json({ error: "File not found" });
    }

    res.redirect(downloadUrl);
  } catch (error) {
    console.error("Download Error:", error.stack);
    res.status(500).json({ error: "Error downloading material", details: error.message });
  }
};

// Get all DU materials
export const getDu_material = async (req, res) => {
  try {
    const duMaterials = await du_material.find({});
    if (!duMaterials || duMaterials.length === 0) {
      return res.status(404).json({ error: "No materials found" });
    }
    res.status(200).json({ message: "Materials fetched successfully", data: duMaterials });
  } catch (error) {
    console.error("Fetch Error:", error.stack);
    res.status(500).json({ error: "Error fetching data", details: error.message });
  }
};

// Get a single DU material by ID
export const getByIdDu_material = async (req, res) => {
  const { du_materialId } = req.params;

  try {
    const material = await du_material.findById(du_materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json({ message: "Material fetched successfully", data: material });
  } catch (error) {
    console.error("Fetch By ID Error:", error.stack);
    res.status(500).json({ error: "Error retrieving data", details: error.message });
  }
};

// Get a signed URL for a file
export const getSignedUrl = async (req, res) => {
  try {
    const { file: filePath } = req.query;
    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const signedUrl = cloudinary.url(filePath, {
      sign_url: true,
      resource_type: "auto",
      secure: true,
    });

    res.status(200).json({ message: "Signed URL generated", signedUrl });
  } catch (error) {
    console.error("Signed URL Error:", error.stack);
    res.status(500).json({ error: "Error generating signed URL", details: error.message });
  }
};
