const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // phục vụ file tĩnh

// ----------------------------
// Hàm đọc/ghi file JSON
// ----------------------------
function readJSON(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function writeJSON(file, data) {
  const filePath = path.join(__dirname, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// ----------------------------
// API: Lấy danh sách đề
// ----------------------------
app.get("/exams", (req, res) => {
  const exams = readJSON("exams.json");
  res.json(exams.exams || []);
});

// ----------------------------
// API: Lấy danh sách bài đã giao
// ----------------------------
app.get("/assignments", (req, res) => {
  const assignments = readJSON("assignments.json");
  res.json(assignments);
});

// ----------------------------
// API: Giao bài (PUT)
// ----------------------------
app.put("/assign/:id", (req, res) => {
  const examId = req.params.id;
  const { teacherName, assignedClass, deadline } = req.body;

  if (!teacherName || !assignedClass || !deadline) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  const exams = readJSON("exams.json");
  const exam = exams.exams.find(e => String(e.id) === String(examId));
  if (!exam) return res.status(404).json({ error: "Không tìm thấy đề" });

  // Lưu vào assignments.json
  const assignments = readJSON("assignments.json");
  const newAssignment = {
    examId,
    class: assignedClass,
    teacher: teacherName,
    deadline,
    assignedAt: new Date().toISOString()
  };
  assignments.push(newAssignment);
  writeJSON("assignments.json", assignments);

  res.json({ message: "Đã giao bài thành công", assignment: newAssignment });
});

// ----------------------------
// API: Lấy chi tiết exam
// ----------------------------
app.get("/exams/:id", (req, res) => {
  const exams = readJSON("exams.json");
  const exam = exams.exams.find(e => String(e.id) === req.params.id);
  if (!exam) return res.status(404).json({ error: "Không tìm thấy đề" });
  res.json(exam);
});

// ----------------------------
// Serve file đề
// ----------------------------
app.use("/files", express.static(path.join(__dirname, "public/files")));

// ----------------------------
app.get("/", (req, res) => {
  res.send("Server Node.js đang chạy. Truy cập /exams hoặc /assignments");
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
