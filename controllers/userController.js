// const User = require("../models/userModel");

// @desc    Get current user profile
// @route   GET /api/users/current
// @access  Private
const getCurrent = async (req, res, next) => {
	// req.user is set by auth middleware
	// const user = await User.findById(req.user.id);
	res.json("Current user");
};

// @desc    Get all users
// @route   GET /api/users/
// @access  Private
const getUsers = async (req, res, next) => {
	// const users = await User.find().select("-password");
	res.json("All users");
};

// @desc    Login user
// @route   GET /api/users/login
// @access  public
const login = async (req, res, next) => {
	// const users = await User.find().select("-password");
	const { username, email, password } = req.body;
	if (!username || !password || !email) {
		res.status(400);
		return next(new Error("All fields are required"));
	}
	res.json("Logged in");
};

// @desc    Register user
// @route   GET /api/users/register
// @access  Public
const register = async (req, res, next) => {
	// const users = await User.find().select("-password");
	const { username, email, password } = req.body;
	if (!username || !password || !email) {
		res.status(400);
		return next(new Error("All fields are required"));
	}
	res.json("Registered");
};

module.exports = { getCurrent, getUsers, login, register };
