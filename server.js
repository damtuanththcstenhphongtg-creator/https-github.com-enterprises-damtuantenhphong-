import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// PUBLIC FILE (HTML, JS)
// ===============================
app.use(express.static("public"));

// ===============================
// API LOAD ĐỀ
// ===============================
app.get("/api/exams", (req, res) => {
    const indexPath = "./data/exams/index.json";

    if (!fs.existsSync(indexPath)) {
        return res.json([]);
    }

    const data = JSON.parse(fs.readFileSync(indexPath));
    res.json(data.exams || []);
});

// ===============================
// API GIAO BÀI
// ===============================
app.post("/api/assign", (req, res) => {
    const assignFile = "./data/assignments.json";
    const newAssign = req.body;

    let assigns = [];
    if (fs.existsSync(assignFile)) {
        assigns = JSON.parse(fs.readFileSync(assignFile));
    }

    assigns.push({
        ...newAssign,
        assignedAt: new Date().toISOString()
    });

    fs.writeFileSync(assignFile, JSON.stringify(assigns, null, 2));
    res.json({ success: true });
});

app.listen(3000, () =>
    console.log("✅ Server chạy http://localhost:3000")
);
