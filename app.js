import express from "express";
import dotenv from "dotenv";

import { errorHandler } from "./middlewares/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// set dotenv config
dotenv.config();

// set json parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set routing
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recipe", recipeRoutes);

// set error middleware
app.use(errorHandler);

// buat server nya
app.listen(port, () => console.log(`Server running at port: ${port}`));
