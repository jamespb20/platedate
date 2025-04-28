import express from "express";
import authMiddleware from "../utils/authMiddleware";
import admin from "./admin";
import auth from "./auth";
import chats from "./chats";
import match from "./match";
import preferenceUpdate from "./preferenceUpdate";
import userProfile from "./userProfile";
import report from "./report";

const router = express.Router();

router.use("/auth", auth);
router.use("/userprofile", authMiddleware, userProfile);
router.use("/admin", authMiddleware, admin);
router.use("/chats", authMiddleware, chats);
router.use("/preference", authMiddleware, preferenceUpdate);
router.use("/match", authMiddleware, match);
router.use("/report", authMiddleware, report);
export default router;
