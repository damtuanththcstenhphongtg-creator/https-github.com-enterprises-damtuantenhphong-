// ===============================
// SERVER.JS – WEB ĐỘNG GIAO & NỘP BÀI
// ===============================

import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// Public folder (HTML, CSS, JS)
app.use(express.static("public"));

// ===============================
// ĐƯỜNG DẪN GỐC
// ===============================
const DATA_DIR = path.join(process.cwd(), "data");
const EXAM_DIR = path.join(DATA_DIR, "exams");
const SUBMIT_DIR = path.join(DATA_DIR, "submissions");

// Tạo thư mục nếu chưa có
[DATA_DIR, EXAM_DIR, SUBMIT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ===============================
// API 1️⃣ LOAD DANH SÁCH ĐỀ
// ===============================
app.get("/api/exams", (req, res) => {
    const indexPath = path.join(EXAM_DIR, "index.json");

    if (!fs.existsSync(indexPath)) {
        console.warn("⚠️ Không tìm thấy index.json");
        return res.json([]);
    }

    try {
        const raw = fs.readFileSync(indexPath, "utf-8");
        const json = JSON.parse(raw);

        // Hỗ trợ 2 cấu trúc
        if (Array.isArray(json)) return res.json(json);
        if (Array.isArray(json.exams)) return res.json(json.exams);

        res.json([]);
    } catch (err) {
        console.error("❌ Lỗi đọc index.json:", err);
        res.status(500).json([]);
    }
});

// ===============================
// API 2️⃣ LOAD NỘI DUNG 1 ĐỀ
// ===============================
app.get("/api/exams/:file", (req, res) => {
    const examFile = req.params.file;
    const examPath = path.join(EXAM_DIR, examFile);

    if (!fs.existsSync(examPath)) {
        return res.status(404).json({ error: "Không tìm thấy đề" });
    }

    try {
        const raw = fs.readFileSync(examPath, "utf-8");
        const json = JSON.parse(raw);
        res.json(json);
    } catch (err) {
        console.error("❌ Lỗi đọc đề:", err);
        res.status(500).json({ error: "Lỗi đọc đề" });
    }
});

// ===============================
// API 3️⃣ GIAO BÀI (LƯU)
// ===============================
app.post("/api/assign", (req, res) => {
    const assignment = req.body;
    const filePath = path.join(DATA_DIR, "assignments.json");

    let assignments = [];
    if (fs.existsSync(filePath)) {
        assignments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    assignments.push({
        ...assignment,
        assignedAt: new Date().toISOString()
    });

    fs.writeFileSync(filePath, JSON.stringify(assignments, null, 2));
    res.json({ success: true });
});

// ===============================
// API 4️⃣ HỌC SINH XEM BÀI ĐƯỢC GIAO
// ===============================
app.get("/api/assignments/:className", (req, res) => {
    const filePath = path.join(DATA_DIR, "assignments.json");

    if (!fs.existsSync(filePath)) return res.json([]);

    const assignments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const classAssignments = assignments.filter(
        a => a.class === req.params.className
    );

    res.json(classAssignments);
});

// ===============================
// API 5️⃣ HỌC SINH NỘP BÀI
// ===============================
app.post("/api/submit", (req, res) => {
    const submission = req.body;
    const fileName = `submit_${Date.now()}.json`;
    const savePath = path.join(SUBMIT_DIR, fileName);

    submission.submittedAt = new Date().toISOString();

    fs.writeFileSync(savePath, JSON.stringify(submission, null, 2));
    res.json({ success: true });
});

// ===============================
// SERVER START
// ===============================
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy: http://localhost:${PORT}`);
});
