import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import Tesseract from "tesseract.js";

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Route nhận ảnh và OCR
app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Không có file" });

  try {
    const result = await Tesseract.recognize(req.file.path, "vie+eng");
    const text = result.data.text.trim();

    // Ví dụ chấm điểm đơn giản: đếm số từ
    const wordCount = text.split(/\s+/).length;
    const score = Math.min(10, Math.round(wordCount / 20)); // cứ 20 từ ~ 1 điểm
    const feedback = score > 5 ? "Bài làm khá đầy đủ" : "Bài làm còn sơ sài";

    res.json({ status: "ok", text, score, feedback });
  } catch (err) {
    res.status(500).json({ error: "OCR lỗi: " + err.message });
  }
});

app.listen(3000, () => console.log("✅ Server chạy tại http://localhost:3000"));