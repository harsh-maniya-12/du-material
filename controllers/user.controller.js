import { User } from "../models/user.model.js";
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
  const userSchema = z.object({
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
  const validationData = userSchema.safeParse(req.body);
  if (!validationData.success) {
    return res.status(400).json({
      errors: validationData.error.issues.map((err) => err.message),
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      FirstName,
      LastName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ errors: "Internal server error during signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ errors: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    //jwt code
    const token=jwt.sign({
      id:user._id,
    },config.JWT_USER_PASSWORD)

    res.cookie("jwt",token);

    // Respond with success
    res.status(200).json({ message: "Login successful", user,token});
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ errors: "Internal server error during login" });
  }
};

export const logout=(req,res)=>{
  try {
    res.clearCookie("jwt");
    res.status(200).json({message:"log out succussfull"});

    
  } catch (error) {
    res.status(500).json({message:"error in log out"});
    console.log("error in log out",error);
    
    
  }

}
