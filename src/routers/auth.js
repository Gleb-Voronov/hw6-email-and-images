import express from "express";
import {
  registerController,
  loginController,
  logoutController,
  sendResetEmailController,
  resetPasswordController,
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";

const router = express.Router();

// -------------------- AUTH ROUTES --------------------
router.post("/register", validateBody(["name", "email", "password"]), registerController);
router.post("/login", validateBody(["email", "password"]), loginController);
router.post("/logout", validateBody(["refreshToken"]), logoutController);

// -------------------- PASSWORD RESET --------------------
router.post("/send-reset-email", validateBody(["email"]), sendResetEmailController);
router.post("/reset-pwd", validateBody(["token", "password"]), resetPasswordController);

export default router;
