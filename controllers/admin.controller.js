import { Admin } from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";


export const signup = async (req, res) => {
  const { FirstName, LastName, email, password } = req.body;

  if (!FirstName || !LastName || !email || !password) {
    return res.status(400).json({ errors: "All fields are required" });
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // Validation schema
  const adminSchema = z.object({
    FirstName: z
      .string()
      .min(3, { message: "First name must be at least 3 characters long" }),
    LastName: z
      .string()
      .min(3, { message: "Last name must be at least 3 characters long" }),
    email: z
      .string()
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
  });

  // Validate input
  const validationData = adminSchema.safeParse(req.body);
  if (!validationData.success) {
    return res.status(400).json({
      errors: validationData.error.issues.map((err) => err.message),
    });
  }

  try {
    // Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "Admin already exists" });
    }

    // Create new Admin
    const newAdmin = new Admin({
      FirstName,
      LastName,
      email,
      password: hashPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Signup successful", admin: newAdmin });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ errors: "Internal server error during signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errors: "Email and password are required" });
  }

  try {
    // Find Admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, config.JWT_ADMIN_PASSWORD, { expiresIn: "7d" });

    // Set JWT as HTTP-Only Cookie
    res.cookie("jwt", token, {
      httpOnly: true,  // Prevents access from JavaScript
      secure: process.env.NODE_ENV === "production",  // Secure in production
      sameSite: "None", // Required for cross-site cookies
    });

    res.status(200).json({ message: "Login successful", admin, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ errors: "Internal server error during login" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Error in logout" });
  }
};
