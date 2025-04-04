import { verifyToken } from "../jwt/AuthToken.js";

const AuthUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }

    req.user = decoded.userId; // Attach user ID to request object
    next(); // Proceed to next middleware/controller
};

export default AuthUser;