require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const publicRoutes = require("./routes/publicRoutes");
const userRoutes = require("./routes/userRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const googleRoutes = require("./routes/googleRoutes");

const app = express();
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/public", publicRoutes);
app.use("/api/users", userRoutes);
app.use("/api/syllabi", syllabusRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/google", googleRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const payload = {
    error: err.message || "Internal server error",
  };

  if (err.code) {
    payload.code = err.code;
  }

  if (status >= 500) {
    console.error("Unhandled error", err);
  }

  res.status(status).json(payload);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));

