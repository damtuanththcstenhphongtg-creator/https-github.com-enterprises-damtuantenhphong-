import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =======================
// PATH CỐ ĐỊNH
// =======================
const EXAM_DIR = path.join(process.cwd(), "data", "exams");
const INDEX_FILE = path.join(EXAM_DIR, "index.json");

// =======================
// API: LẤY DANH SÁCH ĐỀ
// =======================
app.get("/api/exams", (req, res) => {
    try {
        if (!fs.existsSync(INDEX_FILE)) {
            return res.status(404).json({ error: "Không tìm thấy index.json" });
        }

        const data = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Lỗi đọc index.json" });
    }
});

// =======================
// API: LẤY 1 ĐỀ CỤ THỂ
// =======================
app.get("/api/exams/:file", (req, res) => {
    const fileName = req.params.file;

    // 🔒 CHỐNG TRUY CẬP LINH TINH
    if (fileName.includes("..")) {
        return res.status(400).json({ error: "File không hợp lệ" });
    }

    const examPath = path.join(EXAM_DIR, fileName);

    if (!fs.existsSync(examPath)) {
        return res.status(404).json({ error: "Không tìm thấy đề" });
    }

    try {
        const examData = JSON.parse(fs.readFileSync(examPath, "utf-8"));
        res.json(examData);
    } catch (err) {
        res.status(500).json({ error: "Lỗi đọc file đề" });
    }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy: http://localhost:${PORT}`);
});
