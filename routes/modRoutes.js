import express from "express";
import ModController from "../controllers/modController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { moderatorMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// route hanya dapat diakses oleh moderator saja
router.use(authMiddleware, moderatorMiddleware);

router.get("/stats", ModController.showStats);
router.get("/pending", ModController.showPending);
router.get("/recipes", ModController.showRecipeStatus);
router.get("/recipes/all", ModController.showAllRecipes);
router.get("/recipes/:id", ModController.showRecipeDetail);
router.put("/recipes/:id/approve", ModController.approveRecipe);
router.put("/recipes/:id/reject", ModController.rejectRecipe);

export default router;
