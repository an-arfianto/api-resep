import express from "express";
import ProfileController from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// route dapat diakses jika sudah login/terautentikasi
router.use(authMiddleware);

// info profil
router.get("/", ProfileController.getProfile);

// user management
router.put("/", ProfileController.updateProfile);
router.put("/password", ProfileController.updatePassword);

export default router;
