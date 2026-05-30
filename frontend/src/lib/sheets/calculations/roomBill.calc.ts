import type { OtherFee, Room, RoomBill } from '../../../types/api';

export interface RoomBillInput {
  roomId: string;
  billingMonth: string;
  electricityOldReading: number;
  electricityNewReading: number;
  waterOldReading: number;
  waterNewReading: number;
  wifiFee?: number;
  trashFee?: number;
  monthlyRent?: number;
  otherFees?: OtherFee[];
  note?: string;
}

export const buildRoomBillPayload = (
  input: RoomBillInput,
  room: Room,
): Omit<RoomBill, '_id' | 'createdAt' | 'updatedAt'> & { roomId: string } => {
  const electricityUsed = Math.max(
    0,
    input.electricityNewReading - input.electricityOldReading,
  );
  const waterUsed = Math.max(0, input.waterNewReading - input.waterOldReading);
  const electricityAmount = electricityUsed * room.electricityUnitPrice;
  const waterAmount = waterUsed * room.waterUnitPrice;
  const wifiFee = input.wifiFee ?? room.wifiFee;
  const trashFee = input.trashFee ?? room.trashFee;
  const monthlyRent = input.monthlyRent ?? room.monthlyRent;
  const otherFees = input.otherFees ?? [];
  const otherFeesTotal = otherFees.reduce((sum, fee) => sum + (fee.amount ?? 0), 0);

  const totalAmount =
    electricityAmount + waterAmount + wifiFee + trashFee + monthlyRent + otherFeesTotal;

  return {
    roomId: room._id,
    billingMonth: input.billingMonth,
    electricityOldReading: input.electricityOldReading,
    electricityNewReading: input.electricityNewReading,
    electricityUsed,
    waterOldReading: input.waterOldReading,
    waterNewReading: input.waterNewReading,
    waterUsed,
    electricityAmount,
    waterAmount,
    wifiFee,
    trashFee,
    monthlyRent,
    otherFees,
    note: input.note ?? '',
    totalAmount,
  };
};
