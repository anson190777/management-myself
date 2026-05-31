class Pagination {
  const Pagination({
    required this.page,
    required this.limit,
    required this.totalItems,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int totalItems;
  final int totalPages;
}

class PaginatedResponse<T> {
  const PaginatedResponse({required this.items, required this.pagination});

  final List<T> items;
  final Pagination pagination;
}

class AccountBank {
  const AccountBank({
    required this.id,
    required this.customerCode,
    required this.customerName,
    required this.bank,
    required this.accountNumber,
    required this.isDefault,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String customerCode;
  final String customerName;
  final String bank;
  final String accountNumber;
  final bool isDefault;
  final String? createdAt;
  final String? updatedAt;
}

class Room {
  const Room({
    required this.id,
    required this.name,
    required this.nameUser,
    required this.monthlyRent,
    required this.electricityUnitPrice,
    required this.waterUnitPrice,
    required this.wifiFee,
    required this.trashFee,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
    this.billSheetName,
  });

  final String id;
  final String name;
  final String nameUser;
  final double monthlyRent;
  final double electricityUnitPrice;
  final double waterUnitPrice;
  final double wifiFee;
  final double trashFee;
  final bool isActive;
  final String? createdAt;
  final String? updatedAt;
  final String? billSheetName;
}

class OtherFee {
  const OtherFee({required this.name, required this.amount});

  final String name;
  final double amount;

  factory OtherFee.fromJson(Map<String, dynamic> json) => OtherFee(
        name: json['name']?.toString() ?? '',
        amount: (json['amount'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toJson() => {'name': name, 'amount': amount};
}

class RoomBill {
  const RoomBill({
    required this.id,
    required this.roomId,
    this.room,
    this.roomName,
    required this.billingMonth,
    required this.electricityOldReading,
    required this.electricityNewReading,
    required this.electricityUsed,
    required this.waterOldReading,
    required this.waterNewReading,
    required this.waterUsed,
    required this.electricityAmount,
    required this.waterAmount,
    required this.wifiFee,
    required this.trashFee,
    required this.monthlyRent,
    required this.totalAmount,
    this.otherFees = const [],
    this.note,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String roomId;
  final Room? room;
  final String? roomName;
  final String billingMonth;
  final double electricityOldReading;
  final double electricityNewReading;
  final double electricityUsed;
  final double waterOldReading;
  final double waterNewReading;
  final double waterUsed;
  final double electricityAmount;
  final double waterAmount;
  final double wifiFee;
  final double trashFee;
  final double monthlyRent;
  final double totalAmount;
  final List<OtherFee> otherFees;
  final String? note;
  final String? createdAt;
  final String? updatedAt;
}
