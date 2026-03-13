import express from "express";
import SearchController from "../controllers/searchController.js";
import { validateSearch } from "../middlewares/validation.js";

const router = express.Router();

// boolean retrieval
router.post("/", validateSearch, SearchController.searchRecipes);

export default router;
