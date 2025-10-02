// backend/app/utils/getHardwareId.ts
import si from "systeminformation";

export const getHardwareId = async () => {
  const cpu = await si.cpu();
  const baseboard = await si.baseboard();
  const disk = await si.diskLayout();

  const hardwareId = `${cpu.manufacturer}-${cpu.brand}-${cpu.speed}-${baseboard.serial}-${disk[0]?.serialNum}`;
  return hardwareId;
};
