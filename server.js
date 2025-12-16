/ index.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware để parse JSON từ body request (nếu cần POST/PUT)
app.use(express.json());

// Đọc dữ liệu exams từ file
function getExams() {
  const filePath = path.join(__dirname, "exams.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

// API: Lấy toàn bộ danh sách exams
app.get("/exams", (req, res) => {
  const exams = getExams();
  res.json(exams);
});

// API: Lấy chi tiết exam theo id
app.get("/exams/:id", (req, res) => {
  const exams = getExams();
  const exam = exams.exams.find(e => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: "Không tìm thấy exam" });
  }
  res.json(exam);
});

// API: Thêm exam mới
app.post("/exams", (req, res) => {
  const exams = getExams();
  const newExam = req.body;
  exams.exams.push(newExam);

  fs.writeFileSync(
    path.join(__dirname, "exams.json"),
    JSON.stringify(exams, null, 2),
    "utf8"
  );

  res.status(201).json(newExam);
});

// API: Xóa exam theo id
app.delete("/exams/:id", (req, res) => {
  const exams = getExams();
  const filtered = exams.exams.filter(e => e.id !== req.params.id);

  if (filtered.length === exams.exams.length) {
    return res.status(404).json({ error: "Không tìm thấy exam để xóa" });
  }

  fs.writeFileSync(
    path.join(__dirname, "exams.json"),
    JSON.stringify({ exams: filtered }, null, 2),
    "utf8"
  );

  res.json({ message: "Đã xóa thành công" });
});

// Route mặc định
app.get("/", (req, res) => {
  res.send("Server Node.js đang chạy. Truy cập /exams để xem dữ liệu.");
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});

