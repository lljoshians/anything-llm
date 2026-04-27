const express = require("express");
const cors = require("cors");
const path = require("path");
const { reqBody } = require("./utils/http");
require("dotenv").config({ path: `.env` });

const app = express();
const apiRouter = express.Router();
const { PORT, SameSiteValue } = {
  PORT: process.env.SERVER_PORT || 3001,
  SameSiteValue: () => {
    if (process.env.NODE_ENV !== "production") return "lax";
    if (process.env.STORAGE_DIR) return "strict";
    return "none";
  },
};

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic health check endpoint
apiRouter.get("/ping", (req, res) => {
  res.status(200).json({ online: true });
});

// Mount API routes
app.use("/api", apiRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

app.listen(PORT, async () => {
  console.log(`Primary server started on port ${PORT}`);
  console.log(`Storage path: ${process.env.STORAGE_DIR || "./storage"}`);
});

module.exports = { app };
