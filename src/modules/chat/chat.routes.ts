import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { chatController } from "./chat.controller";

const router = express.Router();

router.use(auth);

router.get("/", chatController.getChatRooms);

router.post("/start", role(["tenant", "owner"]), chatController.startChat);
router.get(
  "/owner/:roomTypeId/:tenantId",
  role(["owner"]),
  chatController.getChatOwner
);
router.get("/:chatRoomId", chatController.getChatMessages);
router.post("/:chatRoomId/send", chatController.sendMessage);

export default router;
