import mongoose from "mongoose";

const adminSchema=new mongoose.Schema({
  FirstName: {
    type: String, 
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  email: {
    type: String, 
    required: true
  },
  password: {
    type: String, 
    required: true
  }

});
export const Admin=mongoose.model("Admin",adminSchema);