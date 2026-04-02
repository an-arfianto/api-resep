import express from "express";
import AdminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// route hanya dapat diakses oleh admin saja
router.use(authMiddleware, adminMiddleware);

router.get("/users", AdminController.showAllUsers);
router.put("/users/:id/promote", AdminController.promote);
router.put("/users/:id/demote", AdminController.demote);
router.delete("/users/:id", AdminController.deleteUser);
router.get("/recipes", AdminController.showAllRecipes);
router.delete("/recipes/:id", AdminController.deleteRecipe);
router.get("/stats", AdminController.showStats);

export default router;
