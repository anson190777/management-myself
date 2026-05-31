import 'dart:math' as math;

import '../../models/api_models.dart';

class RoomBillInput {
  const RoomBillInput({
    required this.roomId,
    required this.billingMonth,
    required this.electricityOldReading,
    required this.electricityNewReading,
    required this.waterOldReading,
    required this.waterNewReading,
    this.wifiFee,
    this.trashFee,
    this.monthlyRent,
    this.otherFees,
    this.note,
  });

  final String roomId;
  final String billingMonth;
  final double electricityOldReading;
  final double electricityNewReading;
  final double waterOldReading;
  final double waterNewReading;
  final double? wifiFee;
  final double? trashFee;
  final double? monthlyRent;
  final List<OtherFee>? otherFees;
  final String? note;
}

typedef RoomBillComputed = ({
  String roomId,
  String billingMonth,
  double electricityOldReading,
  double electricityNewReading,
  double electricityUsed,
  double waterOldReading,
  double waterNewReading,
  double waterUsed,
  double electricityAmount,
  double waterAmount,
  double wifiFee,
  double trashFee,
  double monthlyRent,
  List<OtherFee> otherFees,
  String note,
  double totalAmount,
});

RoomBillComputed buildRoomBillPayload(RoomBillInput input, Room room) {
  final electricityUsed = math
      .max(0, input.electricityNewReading - input.electricityOldReading)
      .toDouble();
  final waterUsed =
      math.max(0, input.waterNewReading - input.waterOldReading).toDouble();
  final electricityAmount = electricityUsed * room.electricityUnitPrice;
  final waterAmount = waterUsed * room.waterUnitPrice;
  final wifiFee = input.wifiFee ?? room.wifiFee;
  final trashFee = input.trashFee ?? room.trashFee;
  final monthlyRent = input.monthlyRent ?? room.monthlyRent;
  final otherFees = input.otherFees ?? <OtherFee>[];
  final otherFeesTotal =
      otherFees.fold<double>(0, (sum, fee) => sum + fee.amount);

  final totalAmount = electricityAmount +
      waterAmount +
      wifiFee +
      trashFee +
      monthlyRent +
      otherFeesTotal;

  return (
    roomId: room.id,
    billingMonth: input.billingMonth,
    electricityOldReading: input.electricityOldReading,
    electricityNewReading: input.electricityNewReading,
    electricityUsed: electricityUsed,
    waterOldReading: input.waterOldReading,
    waterNewReading: input.waterNewReading,
    waterUsed: waterUsed,
    electricityAmount: electricityAmount,
    waterAmount: waterAmount,
    wifiFee: wifiFee,
    trashFee: trashFee,
    monthlyRent: monthlyRent,
    otherFees: otherFees,
    note: input.note ?? '',
    totalAmount: totalAmount,
  );
}
