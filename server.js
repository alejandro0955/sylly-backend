const express = require("express");
const dotenv = require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const genericRoutes = require("./routes/genericRoutes");
const errorHandler = require("./middleware/errorHandler");
const { requiresAuth } = require("express-openid-connect");

const config = {
	authRequired: true,
	auth0Logout: true,
	secret: "a long, randomly-generated string stored in env",
	baseURL: "http://localhost:8000",
	clientID: "lKseY7zGnwNgt0NlTkYiW2zUDPQ6vpzA",
	issuerBaseURL: "https://dev-0ceg57njy81fq6g8.us.auth0.com",
};

const server = express();

server.use(express.json());

// auth router attaches /login, /logout, and /callback routes to the baseURL

// server.use("/api/users", auth(config), userRoutes);
server.use("/api/generic", auth(config), genericRoutes);

server.use(errorHandler);

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
