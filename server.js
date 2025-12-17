const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Cho phép truy cập file static
app.use("/uploads", express.static("uploads")); // Truy cập file đã upload

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// Đọc/Writing exams
function readJSON(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeJSON(fileName, data) {
  fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(data, null, 2), "utf8");
}

// ===============================
// API: Lấy danh sách đề
// ===============================
app.get("/exams", (req, res) => {
  const exams = readJSON("exams.json");
  res.json(exams);
});

// ===============================
// API: Thêm đề mới (upload file)
// ===============================
app.post("/exams", upload.single("file"), (req, res) => {
  const exams = readJSON("exams.json");
  const { id, title, subject, grade } = req.body;

  if (!id || !title || !req.file) return res.status(400).json({ error: "Thiếu dữ liệu" });

  const newExam = {
    id,
    title,
    subject: subject || "",
    grade: grade || "",
    file: req.file.filename
  };
  exams.push(newExam);
  writeJSON("exams.json", exams);
  res.status(201).json(newExam);
});

// ===============================
// API: Giao bài (giáo viên upload file + lưu assignments)
// ===============================
app.post("/assign", upload.single("file"), (req, res) => {
  const assignments = readJSON("assignments.json");
  const { className, examId, deadline, teacher } = req.body;

  if (!examId || !className || !deadline || !teacher || !req.file)
    return res.status(400).json({ error: "Thiếu dữ liệu giao bài" });

  const exam = readJSON("exams.json").find(e => e.id == examId);
  if (!exam) return res.status(404).json({ error: "Không tìm thấy đề" });

  const assignment = {
    examId,
    examTitle: exam.title,
    class: className,
    teacher,
    deadline,
    file: req.file.filename,
    assignedAt: new Date().toLocaleString()
  };

  assignments.push(assignment);
  writeJSON("assignments.json", assignments);
  res.status(201).json(assignment);
});

// ===============================
// API: Lấy danh sách bài đã giao
// ===============================
app.get("/assignments", (req, res) => {
  const assignments = readJSON("assignments.json");
  res.json(assignments);
});

// ===============================
// Server
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
