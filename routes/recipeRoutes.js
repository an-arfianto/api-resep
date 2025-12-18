import express from "express";
import { findRecipes } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/search", findRecipes);

export default router;
