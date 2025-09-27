const express = require("express");
const {
	register,
	login,
	getUsers,
	getCurrent,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getUsers);
router.get("/current", getCurrent);

module.exports = router;
