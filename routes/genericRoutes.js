const express = require("express");
const router = express.Router();
const genericGET = require("../controllers/genericController");

router.get("/basic", genericGET);

module.exports = router;
