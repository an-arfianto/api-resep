import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/", (res) => {
    res.json({
        success: true,
        message: "REST API Resep",
        version: "1.0.0",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(` Server running on ${PORT}`);
});
