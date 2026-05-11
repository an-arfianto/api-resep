import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errorHandler.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import suspendMiddleware from "./middlewares/suspendMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/recipes", authMiddleware, suspendMiddleware);
app.use("/api/profile", authMiddleware, suspendMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route tidak ada",
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(` Server running on ${PORT}`);
});
