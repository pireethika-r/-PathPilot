import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const protect = (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(String(decoded.id))) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};
