// ==============================
// GLOBAL CONFIG
// ==============================
const DATA_PATH = "data/";

// Lưu trữ / lấy dữ liệu
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, def = null) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
}

// ==============================
// HỌC SINH LOGIN
// ==============================
async function studentLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    
    // Lấy danh sách học sinh lớp 6-9
    let students = [];
    for (let grade = 6; grade <= 9; grade++) {
        const s = await fetch(`${DATA_PATH}students_class${grade}.json`)
            .then(res => res.json())
            .catch(() => []);
        students = students.concat(s);
    }

    const match = students.find(s => s.username === user && s.password === pass);
    if (match) {
        save("student_logged_in", { username: user, grade: match.grade || "6" });
        window.location.href = "student_dashboard.html";
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
}

// Kiểm tra login trên dashboard
function checkStudentLogin() {
    const student = load("student_logged_in");
    if (!student) window.location.href = "student_login.html";
    return student;
}

// Logout
function logoutStudent() {
    localStorage.removeItem("student_logged_in");
    window.location.href = "student_login.html";
}

// ==============================
// LOAD MÔN HỌC THEO LỚP
// ==============================
function loadSubjects(subjectListId) {
    const student = checkStudentLogin();
    const subjectsByGrade = {
        "6": ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Tin học", "Công nghệ"],
        "7": ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Tin học", "Công nghệ"],
        "8": ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Tin học", "Công nghệ"],
        "9": ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Tin học", "Công nghệ"]
    };

    const list = document.getElementById(subjectListId);
    list.innerHTML = "";
    const subjects = subjectsByGrade[student.grade];

    subjects.forEach(sub => {
        const div = document.createElement("div");
        div.className = "subject-item";
        div.textContent = sub;

        div.onclick = () => {
            const fileName = `grade${student.grade}_${toFileName(sub)}.html`;
            window.location.href = fileName;
        };

        list.appendChild(div);
    });
}

// Convert tên môn -> file
function toFileName(sub) {
    return sub
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ /g, "_");
}

// ==============================
// LÀM BÀI KIỂM TRA
// ==============================
function loadExam(examId) {
    const bank = load("exam_bank", []);
    const exam = bank.find(e => e.id === examId);
    if (!exam) {
        alert("Không tìm thấy bài kiểm tra!");
        return null;
    }
    return exam;
}

// Submit bài
function submitExam(examId, answers) {
    const student = checkStudentLogin();
    let submissions = load("submissions", []);
    submissions.push({
        studentId: student.username,
        examId,
        answers,
        time: Date.now()
    });
    save("submissions", submissions);
    alert("Đã nộp bài thành công!");
}

// ==============================
// XEM KẾT QUẢ
// ==============================
function loadResults(elementId) {
    const student = checkStudentLogin();
    const submissions = load("submissions", []);
    const box = document.getElementById(elementId);

    box.innerHTML = "";
    const mySubs = submissions.filter(s => s.studentId === student.username);

    mySubs.forEach(s => {
        const exam = load("exam_bank", []).find(e => e.id === s.examId);
        const div = document.createElement("div");
        div.className = "result_item";
        div.innerHTML = `
            <b>Bài kiểm tra:</b> ${exam ? exam.title : s.examId}<br>
            <b>Thời gian nộp:</b> ${new Date(s.time).toLocaleString()}<br>
            <b>Điểm:</b> ${s.score !== undefined ? s.score : "Chưa chấm"}<br>
        `;
        box.appendChild(div);
    });
}