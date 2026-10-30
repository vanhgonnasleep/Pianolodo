# 🎹 Piano Harmony & Ear Training Coach (`Piano-Harmony-Coach`)

> **Trợ lý Hòa Thanh, Hợp Âm Màu, Thế Bấm Piano Mượt (Voice Leading) & Huấn Luyện Cảm Âm Thực Chiến** — Dành cho người yêu âm nhạc tự học, không qua nhạc viện chính quy.

- **GitHub Repository:** `https://github.com/vanhgonnasleep/Piano-Harmony-Coach`
- **Bản Đặc Tả Kiến Trúc (Design Spec):** [docs/superpowers/specs/2026-10-30-piano-harmony-coach-design.md](./docs/superpowers/specs/2026-10-30-piano-harmony-coach-design.md)
- **Kế Hoạch Triển Khai Chi Tiết Chặng 1 (Implementation Plan):** [docs/superpowers/plans/2026-10-30-stage1-harmony-reharmonizer-plan.md](./docs/superpowers/plans/2026-10-30-stage1-harmony-reharmonizer-plan.md)

---

## 🗺️ Lộ Trình Tổng Thể 3 Chặng (Master Roadmap)

| Chặng | Phân Hệ | Tính Năng Cốt Lõi | Trạng Thái |
| :--- | :--- | :--- | :--- |
| **🟢 Chặng 1** | **Trợ Lý Hòa Thanh, Hợp Âm Màu & Thế Bấm Piano** | • Nhập vòng hợp âm theo **Bậc** (`2-5-1`, `2-6-5-1`, `4-5-3-6` + Transpose) hoặc **Tên hợp âm** (`C - Am - Dm - G` tự nhận diện giọng)<br>• Chọn **Vibe** (*Pop Ballad, R&B/Neo-Soul, Jazz/Bossa, Cinematic*) & **Mức độ pha màu (Spice 1–3)**<br>• Bấm nút **`[+]`** giữa 2 hợp âm bất kỳ để thử các **Hợp âm bắc cầu (Passing Chords)** (*Đi Bass liền bậc, Secondary Dominant, Diminished 7th, Tritone Sub*)<br>• Tự động chia **Tay Trái (Bass)** & **Tay Phải (Voicing)** với thuật toán **Smooth Voice-Leading** (di chuyển ngón tay ít nhất)<br>• Hiển thị đồng thời: **Đàn Piano 88 phím** + **Khuông nhạc VexFlow** + **Nốt chữ cái (`C2-G2 | B3-D4-E4`)** + **Giải thích đời thường**<br>• Nghe so sánh **A/B (Bản gốc vs Bản pha màu)** với tiếng Grand Piano / Rhodes và 4 kiểu nhịp đệm | 📋 **Đã chốt Spec & Plan — Sẵn sàng thi công** |
| **🟡 Chặng 2** | **Huấn Luyện Cảm Âm & Trợ Lý "Mò Nốt"** | • **Trợ lý Mò Giai Điệu:** Tô sáng (highlight) các phím thuộc Âm giai (Scale) & Nốt trụ hợp âm (Chord Tones) đang kêu để khoanh vùng cho tay phải mò nốt + Ghi lại (Record) thành Sheet đơn giản<br>• **Bài tập Đố Tai Nghe (Ear Training):** Nghe dò Nốt Bass tay trái trước $\rightarrow$ Đoán chất hợp âm (Trưởng/Thứ/7/Màu) sau | ⏳ Kế tiếp sau Chặng 1 |
| **🔵 Chặng 3** | **AI Dò Cao Độ Qua Mic & Xuất Sheet** | • Ngân nga giai điệu hoặc đánh đàn thật vào Mic $\rightarrow$ Real-time Pitch Detector chỉ ngay phím trên Piano & khớp với hợp âm<br>• Xuất bản nhạc hoàn chỉnh (MusicXML / MIDI / PDF) | ⏳ Giai đoạn nâng cao |
