const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, email }

    // Block deactivated accounts even if they still hold a valid token
    const currentUser = await User.findById(decoded.id).select("isActive");
    if (!currentUser || currentUser.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Use after requireAuth. Usage: requireRole('admin') or requireRole('admin', 'storeOwner')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have access to this resource." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };