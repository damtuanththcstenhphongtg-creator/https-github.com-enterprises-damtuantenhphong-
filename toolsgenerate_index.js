/**
 * AUTO GENERATE index.json
 * Author: ChatGPT
 */

import fs from "fs";
import path from "path";

const EXAM_DIR = path.resolve("data/exams");
const INDEX_FILE = path.join(EXAM_DIR, "index.json");

const exams = [];

const files = fs.readdirSync(EXAM_DIR);

files.forEach(file => {
    if (!file.endsWith(".json")) return;
    if (file === "index.json") return;

    const fullPath = path.join(EXAM_DIR, file);

    try {
        const raw = fs.readFileSync(fullPath, "utf8");
        const json = JSON.parse(raw);

        exams.push({
            grade: json.grade || "?",
            subject: json.subject || "Tin học",
            title: json.title || file,
            file: `data/exams/${file}`
        });

    } catch (err) {
        console.error("❌ Lỗi file:", file, err.message);
    }
});

const indexData = {
    exams
};

fs.writeFileSync(
    INDEX_FILE,
    JSON.stringify(indexData, null, 2),
    "utf8"
);

console.log("✅ Đã sinh index.json với", exams.length, "đề");