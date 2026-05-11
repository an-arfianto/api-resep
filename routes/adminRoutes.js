import express from "express";
import AdminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", AdminController.showAllUsers);
router.put("/users/:id/suspend", AdminController.suspendUser);
router.put("/users/:id/unsuspend", AdminController.unsuspendUser);
router.delete("/users/:id", AdminController.deleteUser);

router.get("/recipes", AdminController.showAllRecipes);
router.get("/recipes/pending", AdminController.showPendingRecipes);
router.get("/recipes/status", AdminController.showRecipesByStatus);
router.get("/recipes/:id", AdminController.showRecipe);
router.put("/recipes/:id/approve", AdminController.approveRecipe);
router.put("/recipes/:id/reject", AdminController.rejectRecipe);
router.delete("/recipes/:id", AdminController.deleteRecipe);

router.get("/stats", AdminController.showStats);

export default router;
