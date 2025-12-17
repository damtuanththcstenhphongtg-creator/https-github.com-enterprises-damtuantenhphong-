const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Đọc dữ liệu exams từ file
function getExams() {
  const filePath = path.join(__dirname, "exams.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

// Ghi dữ liệu exams ra file
function saveExams(exams) {
  const filePath = path.join(__dirname, "exams.json");
  fs.writeFileSync(filePath, JSON.stringify(exams, null, 2), "utf8");
}

// API: Lấy toàn bộ danh sách exams
app.get("/exams", (req, res) => {
  const exams = getExams();
  res.json(exams.exams); // trả về mảng
});

// API: Lấy chi tiết exam theo id
app.get("/exams/:id", (req, res) => {
  const exams = getExams();
  const exam = exams.exams.find(e => String(e.id) === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: "Không tìm thấy exam" });
  }
  res.json(exam);
});

// API: Thêm exam mới
app.post("/exams", (req, res) => {
  const exams = getExams();
  const newExam = req.body;
  if (!newExam.id) {
    return res.status(400).json({ error: "Exam phải có id" });
  }
  exams.exams.push(newExam);
  saveExams(exams);
  res.status(201).json(newExam);
});

// API: Xóa exam theo id
app.delete("/exams/:id", (req, res) => {
  const exams = getExams();
  const filtered = exams.exams.filter(e => String(e.id) !== req.params.id);

  if (filtered.length === exams.exams.length) {
    return res.status(404).json({ error: "Không tìm thấy exam để xóa" });
  }

  saveExams({ exams: filtered });
  res.json({ message: "Đã xóa thành công" });
});

// API: Gán giáo viên cho exam
app.put("/assign/:id", (req, res) => {
  const exams = getExams();
  const exam = exams.exams.find(e => String(e.id) === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: "Không tìm thấy exam" });
  }
  exam.teacher = req.body.teacherName;
  saveExams(exams);
  res.json({ message: "Đã gán giáo viên thành công", exam });
});

// Route mặc định
app.get("/", (req, res) => {
  res.send("Server Node.js đang chạy. Truy cập /exams để xem dữ liệu.");
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

