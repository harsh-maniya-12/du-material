import jwt from "jsonwebtoken";
import config from "../config.js";

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ errors: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    console.log("Decoded token:", decoded); // Debugging: check token structure

    // Ensure the field exists and is correct
    req.adminId = decoded.adminId || decoded.id; // Adjust based on your JWT payload

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(401).json({ errors: "Invalid token or expired" });
  }
}

export default adminMiddleware;
