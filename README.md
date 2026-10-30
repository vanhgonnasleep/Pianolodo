# 🎹 Pianolodo • Trợ Lý Hòa Thanh Piano AI & Voicing Studio

> **Pianolodo** (`Piano-Harmony-Coach`) là nền tảng AI hỗ trợ hòa thanh, tái hòa âm (Reharmonization), tạo thế bấm piano mượt mà (Voice Leading) và học đệm hát thực chiến chuẩn công thái học. Được thiết kế chuyên biệt cho nhạc sĩ, producer, ca sĩ và người tự học piano.

[![Vitest](https://img.shields.io/badge/tests-34%20passed-success)](https://github.com/vanhgonnasleep/Pianolodo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-vanhgonnasleep%2FPianolodo-orange)](https://github.com/vanhgonnasleep/Pianolodo)

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. 🪄 Liệt Kê Hợp Âm & Áp Dụng 2-5-1 / Hòa Thanh Vào Input (Interactive Chord List & 2-5-1 Workbench)
- **Liệt kê danh sách thẻ hợp âm trực quan:** Phân rã chuỗi input thành các token hợp âm có đánh số thứ tự (`#1 C`, `#2 Am`, `#3 F`, `#4 G`), hỗ trợ xóa nhanh (`✕`) hoặc thêm mới (`+`).
- **Chọn đích đến (Target Chord Selection):** Bấm chọn bất kỳ hợp âm nào trong danh sách làm đích dẫn lối.
- **Tính toán tự động các phương án 2-5-1 và Cadence:**
  - *Secondary 2-5-1 cho hợp âm thứ:* Ví dụ chọn `Am` $\rightarrow$ sinh ra `Bm7b5 ➔ E7 ➔ Am` (iiø - V7 - i).
  - *Standard 2-5-1 cho hợp âm trưởng:* Ví dụ chọn `C` $\rightarrow$ sinh ra `Dm7 ➔ G7 ➔ C` (ii - V - I).
  - *Thế ba cung (Tritone Sub 2-5):* `Dm7 ➔ Db7 ➔ C` hoặc `Bm7b5 ➔ Bb7 ➔ Am` lướt bass nửa cung sang trọng.
  - *Backdoor 2-5:* `Fm7 ➔ Bb7 ➔ C` (iv7 - bVII7 - I) mượn màu u tối giải tỏa về chủ âm.
  - *Hợp âm giảm dẫn lối (Passing Diminished):* Nửa cung tiếp cận đích (ví dụ `G#dim7 ➔ Am`).
  - *Turnaround 1-6-2-5 & Asian Ballad 2-6-5-1:* Vòng lặp xoay tua nối vào cuối bài.
- **Thao tác 1-Click đa năng:**
  - *Chèn trước [Target]* (Insert Before)
  - *Thay thế [Target]* (Replace Target)
  - *Nối vào cuối* (Append)
  - *Nghe thử 1-click* (Audition)
  - *Hoàn tác an toàn (Undo):* Khôi phục ngay input trước đó nếu muốn thử nghiệm phương án khác.

### 2. ✨ AI Đề Xuất Các Phương Án Hòa Thanh Toàn Dải (AI Progression Suggester)
- **Nhập chuỗi bất kỳ:** Nhập theo bậc số (`1 - 6`, `2 - 5`, `1 - 6 - 2 - 5`, `4 - 5 - 3 - 6`) hoặc tên hợp âm thực tế (`C - Am - Dm - G`, `Fmaj7 - Em7 - Dm7 - C`).
- **5 Phương án đa phong cách tự động:**
  1. **Pop Ballad Lãng Mạn:** Bổ sung nốt 9th bay bổng (maj9, m9), bass lùi bậc V/7 dịu êm.
  2. **R&B / Neo-Soul Ấm Áp:** Thế bấm Rootless dầy dặn, hợp âm át phụ thắt nút lôi cuốn.
  3. **Jazz & Bossa Nova Sang Trọng:** Kỹ thuật thế ba cung Tritone Sub (bII7) vuốt nửa cung lịch lãm.
  4. **Cinematic U Uất Sâu Lắng:** Kỹ thuật mượn âm giai song song (Modal Interchange / Minor Subdominant Borrow).
  5. **Neo-Soul Đậm Màu (Altered 7#9):** Gia vị hòa thanh căng thẳng nghệ thuật rồi đáp nhẹ về nốt chủ.
- **Nghe thử (Audition) 1-click & Áp dụng (Apply) 1-click.**

### 3. 🎼 Voice-Leading & Chia Tay Trái / Tay Phải Công Thái Học
- **Tách bè thông minh:**
  - **Tay trái (Bass):** Nốt gốc, quãng 5 hoặc quãng 7 quãng 8 cách xa, tránh hiện tượng mờ đục (Muddy Low-Interval Limit).
  - **Tay phải (Voicing):** Giữ nốt dẫn 3rd & 7th, xếp nốt màu (9th, 11th, 13th) trong quãng từ C3 đến C5.
- **Thuật toán Voice-Leading cực tiểu quãng:** Chuyển thế đảo (Inversions) thông minh để khoảng cách ngón tay di chuyển giữa các hợp âm là nhỏ nhất ($\le 2$ nửa cung), chấm điểm độ mượt (`Smoothness Score %`).

### 4. 🌉 Hợp Âm Bắc Cầu Tương Tác (Interactive Bridge Chords `[+]`)
- Bấm dấu **`[+]`** giữa 2 ô hợp âm bất kỳ để thử ngay 4 loại hợp âm nối:
  - *Đi Bass Liền Bậc (Passing Bass / Slash Chords)*
  - *Hợp âm át phụ (Secondary Dominants)*
  - *Hợp âm giảm dẫn lối (Passing Diminished 7th)*
  - *Thế ba cung (Tritone Substitutions)*

### 5. 🎹 Trực Quan Hóa Đa Chiều
- **Bàn phím Piano 88 phím:** Hiển thị màu sắc tách biệt giữa tay trái (xanh lam) và tay phải (hổ phách/cam).
- **Khuông nhạc VexFlow:** Khóa Fa (Bass Clef) và Khóa Sol (Treble Clef) chuẩn nhạc lý.
- **Nốt chữ cái & Bậc âm:** Xem chi tiết các nốt cấu thành (`C2 | E3 G3 B3 D4`).
- **Giải thích đời thường:** Phân tích bản chất vì sao hợp âm nghe hay, cảm xúc mang lại và mẹo bấm ngón.

### 6. 🎧 Nhạc Nền Tập Trung Chuyên Sâu (Focus Soundscapes)
- Bộ sinh âm thanh nền thời gian thực bằng Web Audio API & Tone.js:
  - *Lofi Tape Warmth (Pink Noise + Wow/Flutter)*
  - *Binaural Alpha Waves (Sóng não Alpha 10Hz kích hoạt trạng thái Deep Focus)*
  - *Warm Vinyl Rain (Mưa đêm và tiếng nổ đĩa than ấm áp)*

### 7. 🎨 Thiết Kế Warm Ivory & Studio Paper Chuẩn Cao Cấp
- Tông màu giấy ký âm phòng thu ấm áp (`#FAF8F5`, `#FFFFFF`, `#E5DFD7`), điểm nhấn màu Hổ phách (`#D97706`) và Xanh Navy (`#2563EB`).
- Hỗ trợ song ngữ toàn diện: **Tiếng Việt 🇻🇳** & **English 🇬🇧**.
- Chế độ **Luyện tập lặp lại (Loop Practice Mode)**, phím tắt nhanh (`Space` Play/Stop, `ArrowLeft/Right` chuyển hợp âm) và 1-click sao chép thế bấm (`Copy Voicing`).

---

## 🚀 Cài Đặt & Chạy Cục Bộ (Quickstart)

### Yêu Cầu
- **Node.js:** v18.0.0 trở lên
- **Trình duyệt:** Chrome, Edge, Safari hoặc Firefox hỗ trợ Web Audio API & Web MIDI API.

```bash
# 1. Clone repository
git clone https://github.com/vanhgonnasleep/Pianolodo.git
cd Pianolodo

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy dev server
npm run dev

# 4. Chạy kiểm thử tự động (Unit & Integration Tests)
npm test

# 5. Build bản production
npm run build
```

---

## 🏛️ Cấu Trúc Mã Nguồn (Architecture)

```
src/
├── audio/
│   ├── pianoAudioEngine.ts       # Bộ phát âm piano Tone.js, sampler, synth & groove patterns
│   ├── soundscapeGenerators.ts   # Bộ tạo sóng Binaural Alpha 10Hz, Lofi Tape & Vinyl Rain
│   └── webMidiService.ts         # Giao tiếp đàn Piano điện vật lý qua Web MIDI API
├── components/
│   ├── ChordCadenceWorkbench.tsx # Bộ liệt kê hợp âm & áp dụng 2-5-1 / cadence trực tiếp vào input
│   ├── AiProgressionSuggester.tsx # Card AI đề xuất các phương án hòa thanh toàn dải
│   ├── ClarionSidebar.tsx        # Menu điều hướng Clarion Docked Sidebar
│   ├── ClarionTopNav.tsx         # Thanh điều khiển Tone, Tempo, Groove, Playback & Loop
│   ├── ProgressionControlBar.tsx # Thanh nhập bậc, chọn Vibe & mức độ Spice Level
│   ├── ChordTimeline.tsx         # Dòng thời gian hợp âm kèm các nút [+] chèn Bridge Chords
│   ├── Piano88Keyboard.tsx       # Bàn phím 88 phím SVG/CSS tương tác tách tay trái/phải
│   ├── NotationAndNotesPanel.tsx # Khuông nhạc VexFlow & danh sách nốt chữ cái
│   ├── ExplanationAndCurriculum.tsx # Phân tích nhạc lý bằng lời giải thích đời thường
│   ├── CurriculumView.tsx        # Giáo trình 8 Vibe thực chiến
│   ├── PresetsView.tsx           # Thư viện vòng hòa thanh kinh điển (Pop, R&B, Jazz, V-Pop)
│   └── FocusMusicView.tsx        # Trình phát nhạc nền tập trung chuyên sâu
├── engine/
│   ├── cadenceGenerator.ts       # Thuật toán tính toán 2-5-1, Tritone Sub, Backdoor & token actions
│   ├── progressionParser.ts      # Parser bậc Roman Numerals & hợp âm thực tế
│   ├── reharmonizer.ts           # Lõi reharmonization theo phong cách âm nhạc
│   ├── progressionSuggester.ts   # Thuật toán đề xuất 5 phương án hòa thanh đa dạng
│   ├── voiceLeadingSolver.ts     # Bộ giải voice-leading cực tiểu quãng ngón bấm
│   └── bridgeSuggester.ts        # Thuật toán gợi ý Passing & Secondary Dominant chords
├── i18n/
│   └── translations.ts           # Hệ thống từ điển song ngữ Tiếng Việt & English
└── types/
    └── harmony.ts                # Toàn bộ Type definitions và Interfaces nhạc lý
```

---

## 🧪 Kết Quả Kiểm Thử (Test Suite Verification)

```
Test Files  10 passed (10)
     Tests  34 passed (34)
  Duration  3.72s
```
- `cadenceGenerator.test.ts`: Kiểm định tính toán 2-5-1 đích, Tritone Sub, Backdoor, Token actions.
- `curriculum.test.ts`: Kiểm định tính toàn vẹn của 8 Vibe profiles.
- `i18n.test.ts`: Kiểm định từ điển Tiếng Việt & English.
- `progressionParser.test.ts`: Kiểm định phân tích bậc Roman (`1-6-2-5`, `bVII`, `IV/5`) và nhận diện giọng chủ.
- `voiceLeadingSolver.test.ts`: Kiểm định thuật toán chuyển thế đảo cực tiểu quãng tay bấm.
- `reharmonizer.test.ts`: Kiểm định các cấp độ pha màu Spice Level 1-3.
- `progressionSuggester.test.ts`: Kiểm định bộ sinh phương án hòa thanh AI.
- `bridgeSuggester.test.ts`: Kiểm định thuật toán hợp âm bắc cầu.
- `focusSoundscape.test.ts`: Kiểm định Tone.js Web Audio audio nodes.
- `App.test.tsx`: Kiểm định tích hợp giao diện người dùng và tương tác thực tế.

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
Được phát triển với niềm đam mê âm nhạc và công nghệ trợ lý AI.
