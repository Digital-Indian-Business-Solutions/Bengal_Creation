const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.headers.authorization;

  if (!token)
    return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    if (decoded.role !== "vendor")
      return res.status(403).json({ msg: "Access denied" });

    req.vendor = decoded;
    next();

  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};