import { Router } from "express";
import {
  register,
  verifyOtp,
  login,
  refreshToken,
  resendOTP,
  forgotPassword,
  resetPassword,
  logout,
  googleCallbackRedirect,
  loginAdmin,
} from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import {
  forgotSchema,
  loginAdminSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetSchema,
  verifyOtpSchema,
} from "./auth.validation";
import { auth } from "@/middlewares/auth.middleware";
import passport from "passport";
import { env } from "@/config/env";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOTP);
router.post("/login", validate(loginSchema), login);
router.post("/login/admin", validate(loginAdminSchema), loginAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logout);
router.post("/forgot-password", validate(forgotSchema), forgotPassword);
router.post("/reset-password", validate(resetSchema), resetPassword);

router.get("/login/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: `${env.FRONTEND_URL}/auth/login`,
  })(req, res, next);
});

router.get("/google/callback", googleCallbackRedirect);

export default router;
