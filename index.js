// index.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Phục vụ file tĩnh (HTML, CSS, JS, và thư mục files)
app.use(express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "files")));

// Đọc dữ liệu từ exams.json
function getExams() {
  const filePath = path.join(__dirname, "exams.json");
  if (!fs.existsSync(filePath)) {
    return { exams: [] };
  }
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

// Ghi dữ liệu vào exams.json
function saveExams(exams) {
  const filePath = path.join(__dirname, "exams.json");
  fs.writeFileSync(filePath, JSON.stringify(exams, null, 2), "utf8");
}

// API: Lấy danh sách bài học/đề thi
app.get("/exams", (req, res) => {
  const exams = getExams();
  res.json(exams.exams); // trả về mảng
});

// API: Lấy chi tiết theo id
app.get("/exams/:id", (req, res) => {
  const exams = getExams();
  const exam = exams.exams.find(e => String(e.id) === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: "Không tìm thấy bài" });
  }
  res.json(exam);
});

// API: Giáo viên thêm bài mới
app.post("/exams", (req, res) => {
  const exams = getExams();
  const newExam = req.body;
  if (!newExam.id) {
    return res.status(400).json({ error: "Bài phải có id" });
  }
  exams.exams.push(newExam);
  saveExams(exams);
  res.status(201).json(newExam);
});

// API: Xóa bài theo id
app.delete("/exams/:id", (req, res) => {
  const exams = getExams();
  const filtered = exams.exams.filter(e => String(e.id) !== req.params.id);

  if (filtered.length === exams.exams.length) {
    return res.status(404).json({ error: "Không tìm thấy bài để xóa" });
  }

  saveExams({ exams: filtered });
  res.json({ message: "Đã xóa thành công" });
});

// Route mặc định
app.get("/", (req, res) => {
  res.send("Server Node.js đang chạy. Truy cập /exams để xem danh sách bài học.");
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

