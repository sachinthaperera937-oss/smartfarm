const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader);

        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided"
            });
        }

        // Extract token from: Bearer <token>
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        console.log(
            "TOKEN START:",
            token ? token.substring(0, 20) : "NO TOKEN"
        );

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format"
            });
        }

        // Check if JWT_SECRET exists
        console.log(
            "JWT SECRET EXISTS:",
            !!process.env.JWT_SECRET
        );

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT VERIFIED:", decoded);

        // Save decoded user data to request
        req.user = decoded;

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error(
            "JWT ERROR:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;