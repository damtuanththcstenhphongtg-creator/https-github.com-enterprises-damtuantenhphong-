import fs from "fs";
import path from "path";
import { exec } from "child_process";

const EXAM_DIR = path.resolve("data/exams");

console.log("👀 Đang theo dõi thư mục đề...");

fs.watch(EXAM_DIR, (event, filename) => {
    if (!filename || !filename.endsWith(".json")) return;
    console.log("🔄 Phát hiện thay đổi:", filename);
    exec("node tools/generate_index.js");
});