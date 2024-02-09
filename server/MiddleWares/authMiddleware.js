const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(String(token), "your-secret-key", (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Unauthorized access", success: false });
      } else {
        console.log(decoded);
        req.body.userId = decoded.id
        next();
      }
    });
  } catch (error) {
    console.log("Error from auth middleware", error);
    res.status(401).send({ message: "Authentication failed", success: false });
  }
};
