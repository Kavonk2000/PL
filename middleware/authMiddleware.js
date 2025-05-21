const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Log the authorization header for debugging purposes
    console.log("Authorization Header:", authHeader);

    // Check if the Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];

    // Log the token for debugging purposes
    console.log("Extracted Token:", token);

    // Check if token is empty or malformed
    if (!token || token.length < 10) {  // Checking for a minimum length as a basic validity check
        return res.status(401).json({ error: "Unauthorized - Malformed token" });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);

        // Handle specific errors
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized - Token has expired" });
        }

        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};
