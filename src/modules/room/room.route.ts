import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";

import { validate } from "@/middlewares/validate.middleware";
import { createRoomSchema, updateRoomSchema } from "./room.validation";
import { RoomController } from "./room.controller";

const router = express.Router();

router.use(auth);

router.get("/", role(["owner"]), RoomController.getRoom);
router.post(
  "/:roomTypeId",
  validate(createRoomSchema),
  RoomController.createRoom
);
router.get("/:roomTypeId", RoomController.getRoomsByKostType);
router.put("/:roomId", validate(updateRoomSchema), RoomController.updateRoom);
router.delete("/:roomId", RoomController.deleteRoom);

export default router;
