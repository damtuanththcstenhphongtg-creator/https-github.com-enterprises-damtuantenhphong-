const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   TIỆN ÍCH ĐỌC JSON
================================ */
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/* ===============================
   API ĐĂNG NHẬP
================================ */
app.post("/api/login", (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Thiếu thông tin đăng nhập"
        });
    }

    /* ===== GIÁO VIÊN ===== */
    if (role === "teacher") {
        if (username === "admin" && password === "123456") {
            return res.json({
                success: true,
                role: "teacher",
                username: "admin"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Sai tài khoản giáo viên"
        });
    }

    /* ===== HỌC SINH ===== */
    if (role === "student") {
        const dataDir = path.join(__dirname, "data");
        const files = fs.readdirSync(dataDir);

        for (const file of files) {
            if (!file.startsWith("students_")) continue;

            const data = readJSON(path.join(dataDir, file));
            if (!data || !data.students) continue;

            const student = data.students.find(
                s => s.username === username && s.password === password
            );

            if (student) {
                return res.json({
                    success: true,
                    role: "student",
                    username: student.username,
                    class: data.class
                });
            }
        }

        return res.status(401).json({
            success: false,
            message: "Sai tài khoản hoặc mật khẩu"
        });
    }

    res.status(400).json({
        success: false,
        message: "Role không hợp lệ"
    });
});

/* ===============================
   API LẤY BÀI THEO LỚP
================================ */
app.get("/api/student_exams", (req, res) => {
    const className = req.query.class;
    if (!className) {
        return res.status(400).json({
            success: false,
            message: "Thiếu tham số lớp"
        });
    }

    const data = readJSON(path.join(__dirname, "data", "assignments.json"));
    if (!data) return res.json([]);

    const exams = data.filter(e => e.class === className);
    res.json(exams);
});

/* ===============================
   KIỂM TRA SERVER
================================ */
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        time: new Date()
    });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
    console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
