const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// Đọc/Ghi JSON
function readJSON(file) {
  const filePath = path.join(__dirname, file);
  if(!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath,"utf8"));
}
function writeJSON(file, data){
  fs.writeFileSync(path.join(__dirname,file), JSON.stringify(data,null,2),"utf8");
}

// ===================
// Exams API
// ===================
app.get("/exams", (req,res)=>res.json(readJSON("exams.json")));
app.post("/exams", upload.single("file"), (req,res)=>{
  const {id,title,subject,grade} = req.body;
  if(!id||!title||!req.file) return res.status(400).json({error:"Thiếu dữ liệu"});
  const exams = readJSON("exams.json");
  exams.push({id,title,subject,grade,file:req.file.filename});
  writeJSON("exams.json",exams);
  res.status(201).json({id,title});
});

// ===================
// Assignments API
// ===================
app.get("/assignments",(req,res)=>res.json(readJSON("assignments.json")));
app.post("/assign", upload.single("file"), (req,res)=>{
  const {className,examId,deadline,teacher} = req.body;
  if(!examId||!className||!deadline||!teacher||!req.file)
    return res.status(400).json({error:"Thiếu dữ liệu"});
  const exam = readJSON("exams.json").find(e=>e.id==examId);
  if(!exam) return res.status(404).json({error:"Không tìm thấy đề"});
  const assignments = readJSON("assignments.json");
  assignments.push({
    examId,
    examTitle: exam.title,
    class: className,
    teacher,
    deadline,
    file:req.file.filename,
    assignedAt:new Date().toLocaleString()
  });
  writeJSON("assignments.json",assignments);
  res.status(201).json({message:"Giao bài thành công"});
});

// ===================
// Submissions API
// ===================
app.get("/submissions",(req,res)=>res.json(readJSON("submissions.json")));
app.post("/submit", upload.single("file"), (req,res)=>{
  const {student,className,examId} = req.body;
  if(!student||!className||!examId||!req.file)
    return res.status(400).json({error:"Thiếu dữ liệu nộp bài"});
  const submissions = readJSON("submissions.json");
  submissions.push({
    student,
    class: className,
    examId,
    file:req.file.filename,
    submittedAt:new Date().toLocaleString()
  });
  writeJSON("submissions.json",submissions);
  res.status(201).json({message:"Nộp bài thành công"});
});

// ===================
// Server start
// ===================
app.listen(PORT,()=>console.log(`✅ Server chạy tại http://localhost:${PORT}`));
