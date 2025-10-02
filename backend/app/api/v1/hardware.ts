// backend/app/api/v1/hardware.ts
import express from "express";
import { getHardwareId } from "../../utils/getHardwareId";

const router = express.Router();

router.get("/hardware-id", async (req, res) => {
  try {
    const hwId = await getHardwareId();
    res.json({ hardware_id: hwId });
  } catch (err) {
    res.status(500).json({ error: "Failed to get hardware ID" });
  }
});

export default router;
