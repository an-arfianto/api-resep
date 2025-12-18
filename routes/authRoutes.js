import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);

router.get("/admin", protect, authorize("admin"), (req, res) => {
    res.json({ message: "Welcome Admin!" });
});

router.get("/mod", protect, authorize("moderator"), (req, res) => {
    res.json({ message: "Welcome Moderator!" });
});

export default router;
