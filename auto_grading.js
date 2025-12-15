// ==============================
// TỰ ĐỘNG CHẤM ĐIỂM TRẮC NGHIỆM
// ==============================

// Lấy dữ liệu từ localStorage
function load(key, def = []) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
}

// Lưu dữ liệu vào localStorage
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Tính điểm cho một submission
function gradeSubmission(submission) {
    const examBank = load("exam_bank", []);
    const exam = examBank.find(e => e.id === submission.examId);

    if (!exam) {
        console.error("Không tìm thấy bài kiểm tra:", submission.examId);
        return 0;
    }

    let correctCount = 0;

    // Giả sử exam.questions là mảng {id, question, options, answer}
    exam.questions.forEach((q, idx) => {
        const studentAnswer = submission.answers[idx];
        if (studentAnswer !== undefined && studentAnswer === q.answer) {
            correctCount++;
        }
    });

    const score = (correctCount / exam.questions.length) * exam.totalScore;
    return score;
}

// Chấm tất cả submission chưa chấm
function gradeAllSubmissions() {
    let submissions = load("submissions", []);
    let updated = false;

    submissions.forEach(sub => {
        if (sub.score === undefined) {
            sub.score = gradeSubmission(sub);
            updated = true;
        }
    });

    if (updated) {
        save("submissions", submissions);
        console.log("✅ Đã chấm xong tất cả bài kiểm tra chưa chấm!");
    } else {
        console.log("Tất cả bài kiểm tra đã được chấm trước đó.");
    }
}

// ==============================
// Xem kết quả cho học sinh
// ==============================
function showMyResults(elementId) {
    const student = JSON.parse(localStorage.getItem("student_logged_in"));
    if (!student) {
        alert("Vui lòng đăng nhập!");
        return;
    }

    const submissions = load("submissions", []).filter(s => s.studentId === student.username);
    const examBank = load("exam_bank", []);

    const container = document.getElementById(elementId);
    container.innerHTML = "";

    submissions.forEach(s => {
        const exam = examBank.find(e => e.id === s.examId);
        const div = document.createElement("div");
        div.className = "result_item";
        div.innerHTML = `
            <b>Bài kiểm tra:</b> ${exam ? exam.title : s.examId}<br>
            <b>Thời gian nộp:</b> ${new Date(s.time).toLocaleString()}<br>
            <b>Điểm:</b> ${s.score !== undefined ? s.score.toFixed(2) : "Chưa chấm"}<br>
        `;
        container.appendChild(div);
    });
}