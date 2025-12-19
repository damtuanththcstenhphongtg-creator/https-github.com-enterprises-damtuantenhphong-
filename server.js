const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ===============================
// LOAD DATA HỌC SINH
// ===============================
function loadStudents() {
    const filePath = path.join(__dirname, "data", "students_6A1.json");
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
}

// ===============================
// API ĐĂNG NHẬP
// ===============================
app.post("/api/login", (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Thiếu thông tin đăng nhập"
        });
    }

    // ===============================
    // GIÁO VIÊN (demo)
    // ===============================
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

    // ===============================
    // HỌC SINH
    // ===============================
    if (role === "student") {
        const data = loadStudents();
        const student = data.students.find(
            s => s.username === username && s.password === password
        );

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        return res.json({
            success: true,
            role: "student",
            username: student.username,
            class: data.class
        });
    }

    res.status(400).json({
        success: false,
        message: "Role không hợp lệ"
    });
});

// ===============================
// SERVER START
// ===============================
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
