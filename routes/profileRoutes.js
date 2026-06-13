import express from "express";
import ProfileController from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import suspendMiddleware from "../middlewares/suspendMiddleware.js";

const router = express.Router();

// route dapat diakses jika sudah login/terautentikasi
router.use(authMiddleware, suspendMiddleware);

router.get("/", ProfileController.getProfile);
router.put("/", ProfileController.updateProfile);
router.put("/password", ProfileController.updatePassword);

export default router;
