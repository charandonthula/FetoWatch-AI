
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        // 1. Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Token missing."
            });
        }

        // 2. Extract token
        const token = authHeader.split(" ")[1];

        // 3. Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Attach decoded information to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        // 5. Continue to the requested controller
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized. Invalid or expired token."
        });
    }
};

module.exports = { protect };
