// ==============================
// GLOBAL CONFIG
// ==============================
const DATA_PATH = "data/";

// Load JSON helper
async function loadJSON(file) {
    const res = await fetch(DATA_PATH + file);
    return res.json();
}

// Save to localStorage
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Load from localStorage
function load(key, def = null) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
}

// ==============================
// TEACHER LOGIN
// ==============================
async function teacherLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    const teachers = await loadJSON("teachers.json");

    if (teachers[user] && teachers[user] === pass) {
        save("teacher_logged_in", user);
        window.location.href = "teacher_dashboard.html";
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
}

// Check login on each teacher page
function checkTeacherLogin() {
    const t = load("teacher_logged_in");
    if (!t) {
        window.location.href = "teacher_login.html";
    }
}

// Logout
function logoutTeacher() {
    localStorage.removeItem("teacher_logged_in");
    window.location.href = "teacher_login.html";
}

// ==============================
// LOAD STUDENTS BY CLASS
// ==============================
async function loadStudents(classId, elementId) {
    const students = await loadJSON(`students_${classId}.json`);
    const box = document.getElementById(elementId);
    box.innerHTML = "";

    students.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.id} - ${s.name}`;
        box.appendChild(li);
    });
}

// ==============================
// EXAM CREATION
// ==============================
function saveExamTemplate() {
    const title = document.getElementById("exam_title").value;
    const duration = document.getElementById("exam_time").value;
    const content = document.getElementById("exam_content").value;

    const exam = {
        id: "EX" + Date.now(),
        title,
        duration,
        content,
        created_by: load("teacher_logged_in")
    };

    let bank = load("exam_bank", []);
    bank.push(exam);
    save("exam_bank", bank);

    alert("Đã lưu đề!");
}

// Load exam list
function loadExamBank(elementId) {
    const bank = load("exam_bank", []);
    const box = document.getElementById(elementId);

    box.innerHTML = "";
    bank.forEach(exam => {
        const div = document.createElement("div");
        div.className = "exam_item";
        div.innerHTML = `
            <b>${exam.title}</b><br>
            Thời gian: ${exam.duration} phút<br>
            <button onclick="assignExam('${exam.id}')">Giao</button>
        `;
        box.appendChild(div);
    });
}

// ==============================
// ASSIGN EXAM TO CLASS
// ==============================
function assignExam(examId) {
    const classId = document.getElementById("class_select").value;

    let assignments = load("assignments", []);

    assignments.push({
        examId,
        classId,
        assigned_by: load("teacher_logged_in"),
        time: Date.now()
    });

    save("assignments", assignments);
    alert("Đã giao bài kiểm tra!");
}

// ==============================
// SUBMISSIONS — STUDENT SUBMITS
// ==============================
function submitStudentExam(studentId, examId, answers) {
    let submits = load("submissions", []);

    submits.push({
        studentId,
        examId,
        answers,
        time: Date.now()
    });

    save("submissions", submits);
}

// Teacher view submissions
function loadTeacherSubmissions(elementId) {
    const subs = load("submissions", []);
    const box = document.getElementById(elementId);

    box.innerHTML = "";
    subs.forEach(s => {
        const div = document.createElement("div");
        div.className = "submit_item";
        div.innerHTML = `
            <b>Học sinh:</b> ${s.studentId}<br>
            <b>Bài thi:</b> ${s.examId}<br>
            <b>Thời gian:</b> ${new Date(s.time).toLocaleString()}<br>
            <button onclick="reviewSubmission('${s.studentId}', '${s.examId}')">
                Xem bài
            </button>
        `;
        box.appendChild(div);
    });
}

// ==============================
// REVIEW SUBMISSION
// ==============================
function reviewSubmission(studentId, examId) {
    save("review_target", { studentId, examId });
    window.location.href = "teacher_review.html";
}

// Load review
function loadReview() {
    const target = load("review_target");
    const subs = load("submissions", []);

    const submission = subs.find(
        s => s.studentId === target.studentId && s.examId === target.examId
    );

    document.getElementById("review_box").innerText =
        JSON.stringify(submission, null, 2);
}