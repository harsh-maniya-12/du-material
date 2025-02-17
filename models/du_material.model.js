import mongoose from "mongoose";

const du_materialSchema = new mongoose.Schema({
  ch_number: { type: String },
  ch_name: { type: String },
  ppt_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  lab_number: { type: String },
  lab_name: { type: String },
  lab_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  note_number: { type: String },
  note_name: { type: String },
  note_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  assignment_number: { type: String },
  assignment_name: { type: String },
  assignment_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  uni_midPaper_year: { type: String },
  uni_midPaper_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  uni_finalPaper_year: { type: String },
  uni_finalPaper_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  gtu_paper: { type: String },
  gtu_paper_upload: {
    public_id: { type: String },
    url: { type: String },
  },
  name: { type: String },
  photo: {
    public_id: { type: String },
    url: { type: String },
  },
  insta_url: { type: String },
  linkedin_url: { type: String },
  git_url: { type: String },
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  sem: { type: String },
  subject: { type: String },
});

export const du_material = mongoose.model("du_material", du_materialSchema);
