# Lựa chọn giao diện mobile — ManagementMyself

Chọn **một** hướng (A/B/C), nhắn agent: *"dùng UI A"* / *"dùng UI B"* / *"dùng UI C"*.

---

## A — SaaS Dashboard (đang áp dụng mặc định)

- Nền xám nhạt `#F3F5F7`, card trắng bo góc 12px, shadow nhẹ  
- Màu chủ đạo xanh `#1565C0` (gần web Ant Design)  
- Bottom nav + AppBar gọn  
- Danh sách dạng **card** (phòng, hóa đơn), tap → sheet chi tiết  
- **Phù hợp:** quản lý phòng trọ, giống web hiện tại  

```
┌─────────────────────────┐
│ ManagementMyself    ⎋  │
├─────────────────────────┤
│ 🔍 Tìm phòng...         │
│ ┌─────────────────────┐ │
│ │ P.101 · Nguyễn A    │ │
│ │ 3.500.000 ₫/tháng   │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Phòng │ HĐ │ NH │ DT    │
└─────────────────────────┘
```

---

## B — Compact Operations (tối, nhiều thông tin)

- Nền trắng, viền 1px, ít shadow  
- Typography nhỏ gọn, list **dense**  
- Filter chips ngang (phòng, năm)  
- FAB ít màu, icon outline  
- **Phù hợp:** thao tác nhanh, nhiều dòng trên màn nhỏ  

---

## C — Warm Property (ấm, thân thiện)

- Màu chủ đạo teal/amber, card kem `#FFFBF5`  
- Icon bo tròn, nhãn tiếng Việt lớn hơn  
- **Phù hợp:** cảm giác “chủ nhà”, ít cảm giác công cụ IT  

---

## Đã làm trong bản hiện tại (A + tính năng bill)

- Theme dashboard (A)  
- Tap hóa đơn → **chi tiết** điện/nước + quy đổi tiền  
- **Chụp / chia sẻ** ảnh hóa đơn + QR (giống web preview)  

Muốn đổi sang B hoặc C: chỉ cần đổi `app_theme.dart` + vài widget list.
