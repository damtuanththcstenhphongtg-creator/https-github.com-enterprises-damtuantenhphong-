import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

// =====================
// STATIC FILES
// =====================
app.use(express.static("public"));
app.use(express.json());

// =====================
// PATH
// =====================
const EXAM_DIR = path.join(process.cwd(), "data", "exams");
const INDEX_PATH = path.join(EXAM_DIR, "index.json");

// =====================
// API: DANH SÁCH ĐỀ
// =====================
app.get("/api/exams", (req, res) => {
    if (!fs.existsSync(INDEX_PATH)) {
        return res.status(404).json({ error: "Không tìm thấy index.json" });
    }

    try {
        const data = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Lỗi đọc index.json" });
    }
});

// =====================
// API: CHI TIẾT ĐỀ
// =====================
app.get("/api/exams/:file", (req, res) => {
    const file = req.params.file;

    if (file.includes("..")) {
        return res.status(400).json({ error: "Tên file không hợp lệ" });
    }

    const examPath = path.join(EXAM_DIR, file);

    if (!fs.existsSync(examPath)) {
        return res.status(404).json({ error: "Không tìm thấy đề" });
    }

    try {
        const exam = JSON.parse(fs.readFileSync(examPath, "utf8"));
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: "Lỗi đọc file đề" });
    }
});

// =====================
// START
// =====================
app.listen(PORT, () => {
    console.log("✅ Server running at http://localhost:" + PORT);
});
