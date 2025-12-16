import express from "express";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { gradeEssay } from "./grade_essay.js";

dotenv.config();
const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Public thư mục submissions để tải PDF
app.use(
  "/submissions",
  express.static(path.join(__dirname, "submissions"))
);

/* ===========================
   NHẬN BÀI LÀM + TẠO PDF
=========================== */
app.post("/submit", async (req, res) => {
  const submission = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!submission.student || !submission.answers) {
    return res.status(400).json({ error: "Thiếu thông tin học sinh hoặc bài làm" });
  }

  // Đảm bảo thư mục submissions tồn tại
  const submissionsDir = path.join(__dirname, "submissions");
  if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir);
  }

  // Lưu vào submissions.json
  let data = [];
  if (fs.existsSync("submissions.json")) {
    try {
      data = JSON.parse(fs.readFileSync("submissions.json", "utf8"));
    } catch (e) {
      data = [];
    }
  }
  data.push(submission);
  fs.writeFileSync("submissions.json", JSON.stringify(data, null, 2));

  // Tạo tên file PDF
  const safeName = submission.student.replace(/\s+/g, "_").toLowerCase();
  const date = submission.date || new Date().toISOString().split("T")[0];
  const fileName = `${safeName}_${date}.pdf`;
  const filePath = path.join(submissionsDir, fileName);

  // Tạo PDF
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(16).text("BÀI LÀM HỌC SINH", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Học sinh: ${submission.student}`);
  doc.text(`Ngày: ${date}`);
  doc.moveDown();
  doc.text("Nội dung bài làm:", { underline: true });
  doc.moveDown();
  doc.text(JSON.stringify(submission.answers, null, 2));
  doc.end();

  res.json({
    status: "ok",
    pdfLink: `http://localhost:3000/submissions/${fileName}`
  });
});

/* ===========================
   AI CHẤM TỰ LUẬN
=========================== */
app.post("/grade-essay", async (req, res) => {
  try {
    const { question, answer, rubric, maxPoint } = req.body;

    if (!question || !answer || !rubric || !maxPoint) {
      return res.status(400).json({ error: "Thiếu dữ liệu để chấm bài" });
    }

    const result = await gradeEssay(question, answer, rubric, maxPoint);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("✅ Server chạy tại http://localhost:3000")
);
