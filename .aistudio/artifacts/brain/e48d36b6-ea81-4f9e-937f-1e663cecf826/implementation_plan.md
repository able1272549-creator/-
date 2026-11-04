# BadmintonHub (ระบบจัดก๊วนแบดมินตัน & สกอร์บอร์ดอัจฉริยะ)

แอปพลิเคชันเว็บแบบโมเดิร์นสปอร์ตสำหรับชาวก๊วนแบดมินตันและนักกีฬา ครอบคลุมระบบจัดคิวลงสนามอัตโนมัติแบบหมุนเวียนคู่แฟร์ๆ (Fair Rotation), กระดานนับคะแนน BWF แบบสดพร้อมตำแหน่งเสิร์ฟ, และระบบคำนวณหารค่าคอร์ทค่าลูกแบดมินตันพร้อมสรุปยอดรายบุคคลอย่างแม่นยำ

---

## User Review & Critical Decisions

> [!IMPORTANT]
> เนื่องจากการตอบแบบสอบถามเบื้องต้นถูกข้าม จึงได้กำหนดสเปกและฟีเจอร์หลักตามตัวเลือกแนะนำที่ดีที่สุดสำหรับคอมมูนิตี้แบดมินตันในไทย:

- **ฟังก์ชันหลักที่เลือก**: ระบบครบวงจร 3 โมดูลหลัก — (1) **ระบบจัดก๊วน & คิวสนาม (Court & Queue Manager)** มีระบบจัดคิวอัตโนมัติและจัดคู่เอง (2) **สกอร์บอร์ดนับคะแนนมาตรฐาน BWF (Live Scorekeeper)** 21 แต้ม สลับเสิร์ฟ สลับฝั่ง บันทึกผลเกม (3) **ระบบคิดเงินและแบ่งจ่าย (Expense Splitter)** คำนวณค่าสนาม + ค่าลูกแบดตามจำนวนเกมหรือเฉลี่ยคน พร้อม QR PromptPay Demo สำหรับสแกนจ่าย
- **รูปแบบการใช้งาน**: Responsive แบบ Mobile-First และขยายกว้างเต็มจอสำหรับ Tablet/Desktop (สามารถวางแท็บเล็ตข้างคอร์ทเป็นสกอร์บอร์ด หรือใช้มือถือจัดคิวก๊วนได้สะดวก)
- **การเก็บข้อมูล**: Client-side Reactive State พร้อม LocalStorage Synchronization เพื่อให้เปิดใช้งานในสนามได้ทันที ข้อมูลไม่หายแม้ออฟไลน์หรือรีเฟรชหน้าเว็บ

---

## 1. Overview & Core Concept

- **What It Does**: จัดการการเล่นแบดมินตันตั้งแต่ต้นจนจบ ตั้งแต่ลงชื่อสมาชิกในก๊วน กำหนดจำนวนคอร์ท กดสุ่ม/จับคู่ลงเล่นอัตโนมัติ (คำนวณให้ทุกคนได้เล่นจำนวนเกมใกล้เคียงกัน ไม่นั่งรอนาน) นับคะแนนสดบนคอร์ทด้วยระบบ BWF 21 แต้มพร้อมเสียงประกาศคะแนน/แอนิเมชัน และคำนวณสรุปค่าใช้จ่ายตอนจบคอร์ทพร้อมคัดลอกสรุปส่งไลน์กลุ่ม
- **Target Audience / Persona**: หัวหน้าก๊วนแบด (Organizer), ผู้เล่นในก๊วนที่ต้องการดูคิวการลงสนาม, กรรมการหรือผู้เล่นที่ต้องการนับแต้มแข่งขันจริง
- **Key Value**: หมดปัญหาเรื่องจัดคิวไม่ลงตัว คนนึงเล่นเยอะคนนึงนั่งนาน, ไม่ต้องเถียงเรื่องใครเสิร์ฟฝั่งไหน, และหมดปัญหาปวดหัวตอนคิดเงินหารค่าคอร์ทค่าลูกหลังตีเสร็จ

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Quick Setup (เริ่มต้นก๊วน)**:
   - ตั้งชื่อก๊วน กำหนดจำนวนคอร์ท (เช่น คอร์ท 1, คอร์ท 2)
   - เพิ่มรายชื่อผู้เล่น พร้อมระบุระดับฝีมือ (Beginner, Intermediate, Advanced) และสถานะพร้อมเล่น (Ready / Resting)
   - มีชุดข้อมูลตัวอย่าง (Sample Players) ให้กดโหลดทดลองเล่นได้ในคลิกเดียว

2. **Court & Queue Rotation (จัดคิวและสนามแข่งขัน)**:
   - แสดงคอร์ทที่กำลังเล่นอยู่ (Active Courts) พร้อมตัวจับเวลาเวลาที่เล่นไปแล้ว
   - ปุ่ม "Auto Matchmaker" จัดทีม 4 คน (ประเภทคู่) หรือ 2 คน (ประเภทเดี่ยว) ลงคอร์ทที่ว่าง โดยกระจายคนอย่างเป็นธรรม
   - Drag-and-drop หรือเลือกสลับตัวผู้เล่นระหว่างคิวรอ (Waiting Bench) และคอร์ทได้อิสระ
   - ปุ่มจบแมตช์ (Finish Match) ที่บันทึกแต้มและส่งผู้เล่นกลับไปพักในคิวรอโดยอัตโนมัติ

3. **BWF Match Scoreboard (กระดานนับคะแนนสด)**:
   - หน้าจอสกอร์บอร์ดขนาดใหญ่ ตัวเลขชัดเจนระดับสายตามองเห็นได้ทั่วคอร์ท
   - ระบบนับแต้มกติกา BWF: แตะเพิ่มแต้ม (+1), แตะลดแต้ม (-1 ในกรณีแต้มผิด)
   - คำนวณฝั่งเสิร์ฟซ้าย/ขวา (คู่/คี่) และตำแหน่งผู้เสิร์ฟ-ผู้รับอัตโนมัติตามกติกาสากล
   - ตรวจจับ Deuce (ดิวส์) และ Match Point พร้อมแจ้งเตือนผู้ชนะ (Set Winner / Match Summary)

4. **Expense Splitter & Payment Summary (คิดเงินและสรุปค่าใช้จ่าย)**:
   - บันทึกค่าเช่าคอร์ท (บาท/ชม. หรือราคารวม)
   - บันทึกจำนวนลูกแบดที่ใช้และราคาต่อลูก
   - เลือกระบบหาร: หารเท่ากันทุกคน หรือหารตามสัดส่วนจำนวนเกมที่ลงเล่น
   - สร้างการ์ดสรุปยอดต่อคน พร้อมปุ่ม Copy Summary สำหรับส่งเข้ากลุ่ม LINE และมี PromptPay QR Code generator ตัวอย่างสำหรับรับโอน

### Visual Identity & Theme

- **Aesthetic Direction**: Athletic Modernism — ผสมผสานความเฉียบคมของอุปกรณ์กีฬาแบดมินตันชั้นนำ (Yonex / Victor / Li-Ning) เข้ากับความโปร่งโล่ง ใช้งานง่ายในสนามจริง
- **Color Palette & Mood**:
  - Dominant Neutral Canvas (60%): Deep Slate Dark Mode (`bg-slate-950` / `bg-slate-900`) และ Clean Sport Light Mode (`bg-slate-50` / `bg-white`)
  - Structural Surfaces (30%): Deep Court Green & Graphite (`bg-slate-900/90`, `border-slate-800`, Court Turf Green subtle undertones)
  - Athletic Accent (10%): Electric Shuttlecock Neon Lime (`#22c55e` / `#4ade80` / `#a3e635`) เสริมด้วย Shuttle Orange (`#f97316`) สำหรับสถานะ Warning/Deuce
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` / `Outfit` ผสมตัวเลขแบบ Tabular Monospace (`tabular-nums`) สำหรับแต้มและเวลา
  - Micro-metadata: ข้อความคลีนสะดาด ปราศจากกรอบ Pill ซ้ำซ้อน โดยใช้สัญลักษณ์คั่น (`·`) อย่างเป็นระเบียบ
- **Touch & Ergonomics**:
  - ปุ่มกดขนาดใหญ่สำหรับหน้าจอสกอร์บอร์ด (Tap Area $\ge 64\text{px}$) เหมาะสำหรับคนนิ้วเหงื่อหรือแตะจากระยะห่าง
  - Haptic-ready visual feedback & Quick sound toggle (เสียง whistle / beep จำลองเมื่อได้แต้ม)

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Fair Matchmaking Algorithm (ระบบกระจายคิวแบบคำนวณเกม)**
  - *Chosen Approach*: ใช้อัลกอริทึมให้คะแนนความพร้อม (Fairness Score) โดยให้ความสำคัญกับ: 1) ผู้เล่นที่มีจำนวนเกมเล่นน้อยที่สุดก่อน 2) ผู้เล่นที่นั่งพักนานที่สุด 3) จับคู่ระดับฝีมือที่สมดุล
  - *Why*: ปัญหาหลักของการจัดก๊วนแบดคือคนที่เกรงใจมักได้เล่นน้อย หรือเพื่อนสนิทจับคู่กันเองตลอด อัลกอริทึมนี้ช่วยให้ทุกคนในก๊วนแฮปปี้และโปร่งใส
  - *Alternatives Considered*: สุ่มแบบบริสุทธิ์ (Pure Random) ซึ่งอาจทำให้คนเดิมได้ลงติดๆ กันจนหมดแรง

- **Decision 2: Seamless Scoreboard to Court Linking**
  - *Chosen Approach*: เมื่อกดคอร์ทที่กำลังแข่งขัน ผู้ใช้สามารถเปิด Fullscreen Scoreboard สำหรับคอร์ทนั้นๆ ได้ทันที และเมื่อจบเกม ผลคะแนนจะถูกบันทึกกลับเข้าสถิติผู้เล่นและคอร์ทนั้นโดยอัตโนมัติ
  - *Why*: ทำให้การจัดคิวกับการนับคะแนนเป็นระบบเดียวกัน ไม่ต้องพิมพ์ชื่อผู้เล่นซ้ำสองรอบ

- **Decision 3: Offline-Ready Local Storage Persistence**
  - *Chosen Approach*: บันทึกสถานะก๊วน ผู้เล่น ประวัติแมตช์ และการคิดเงินลงใน `localStorage` ทุกครั้งที่มีการเปลี่ยนแปลง พร้อมฟังก์ชัน Export/Import JSON และ Reset Session
  - *Why*: สนามแบดมินตันบางแห่งมีสัญญาณอินเทอร์เน็ตไม่เสถียร การรันบนไคลเอนต์ 100% ทำให้แอปลื่นไหลและไม่มีวันล่มระหว่างการแข่งขัน

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BadmintonHub Web App                            │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: App Identity · Mode Navigation · Sound Toggle · Theme Toggle │
├────────────────────────────────────────────────────────────────────────┤
│  View Switcher:                                                        │
│  [ ก๊วน & จัดคิว (Courts/Queue) ]  [ สกอร์บอร์ด (Live Match) ]           │
│  [ ผู้เล่น & สถิติ (Players) ]     [ คิดเงิน & หารค่าคอร์ท (Expenses) ]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │   Active Courts Grid   │  │           Waiting Bench (Queue)       │ │
│  │   - Court 1: Doubles   │  │   - Ready Players (Games played, Rest)│ │
│  │   - Court 2: Available │  │   - Auto Matchmaker Button            │ │
│  │   - Live Duration      │  │   - Quick Add / Status Toggle         │ │
│  └────────────────────────┘  └───────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Interactive Modules                                              │ │
│  │  - BWF Scoreboard Engine (Serve Indicator, Deuce, Game Tracker)    │ │
│  │  - Expense Calculator (Court Fee + Shuttles -> Per-Player Split)  │ │
│  │  - PromptPay QR Simulation & Share Summary to Clipboard           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  State Layer: React Context / Hooks + LocalStorage Synchronizer        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Core Entities

```typescript
interface Player {
  id: string;
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'ready' | 'playing' | 'resting';
  gamesPlayed: number;
  gamesWon: number;
  restDurationMinutes: number;
  courtId?: string;
}

interface CourtMatch {
  courtId: string;
  courtName: string;
  isOccupied: boolean;
  matchType: 'doubles' | 'singles';
  teamA: Player[];
  teamB: Player[];
  startTime?: number;
  scoreA: number;
  scoreB: number;
  servingSide?: 'teamA' | 'teamB';
  serverPlayerId?: string;
  receiverPlayerId?: string;
  gameHistory: Array<{ scoreA: number; scoreB: number; winner: 'teamA' | 'teamB' }>;
}

interface ExpenseSession {
  courtHourlyRate: number;
  totalCourtHours: number;
  shuttlePricePerUnit: number;
  shuttlesUsed: number;
  otherExpenses: number;
  splitMethod: 'equal' | 'per_game';
  promptPayId?: string;
}
```

### Interactive State Transitions

- **Matchmaking Trigger**: ค้นหาคอร์ทที่ว่าง $\to$ คัดเลือก 4 ผู้เล่นสถานะ `ready` ที่มี `gamesPlayed` ต่ำสุดและพักนานสุด $\to$ ย้ายเป็น `playing` และเริ่มจับเวลาแมตช์
- **BWF Score Click**: เพิ่มแต้ม $\to$ ตรวจสอบเงื่อนไขดิวส์ (เมื่อแต้มเสมอตั้งแต่ 20-20 ต้องนำ 2 แต้ม หรือใครถึง 30 ก่อนชนะ) $\to$ อัปเดตตำแหน่งเสิร์ฟซ้าย/ขวาตามแต้มคู่/คี่ $\to$ ตรวจสอบจบเซ็ต
- **Expense Recalculation**: คำนวณแบบ Real-time ตามฟอร์มผู้ใช้ ปรับยอดต่อหัวอัตโนมัติ และฟอร์แมตสรุปพร้อมคัดลอกลง Clipboard ได้ทันที
