import jwt from "jsonwebtoken";

export function auth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            console.log("No token found in cookies");
            return res.status(401).json({ message: "Not logged in" });
        }
        
        const decoded = jwt.verify(token, "Bedrock");
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verify error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
}
