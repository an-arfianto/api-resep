import {
    createData,
    readData,
    updateData,
    deleteData,
} from "../controllers/userController.js";
import { Router } from "express";
const router = Router();

router.route("/").post(createData).get(readData);

router.route("/:id").put(updateData).delete(deleteData);

export default router;
