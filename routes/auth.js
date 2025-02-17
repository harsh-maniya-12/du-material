const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Refresh Token Route
router.post('/auth/refresh-token', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).send("Refresh token is required");

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);

    // Create a new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Optionally, issue a new refresh token
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Failed to refresh token", error);
    res.status(401).send("Invalid or expired refresh token");
  }
});

module.exports = router;
