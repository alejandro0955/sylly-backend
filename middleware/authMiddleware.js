const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = { id: decoded.id };
			// Optionally ensure user still exists:
			const exists = await User.findById(decoded.id).select("_id");
			if (!exists) {
				res.status(401);
				throw new Error("User no longer exists");
			}
			return next();
		} catch (err) {
			res.status(401);
			throw new Error("Not authorized, invalid token");
		}
	}
	res.status(401);
	throw new Error("Not authorized, no token");
};

module.exports = { authMiddleware };
