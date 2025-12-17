// ===============================
// LOGIN.JS – Tối ưu chạy LOCAL / 127.0.0.1 / GitHub
// ===============================

// ===============================
// 1. DỮ LIỆU TÀI KHOẢN
// ===============================

// Giáo viên
const teachers = {
    "gv_damanhtuan03": "123456789",
    "gv_nguyenducthuong03": "123456789",
    "gv_lovanchinh03": "123456789",
    "gv_lochikien03": "123456789",
    "gv_nguyenthiphuong03": "123456789",
    "gv_duongquangngoc03": "123456789",
    "gv_quangvanhien03": "123456789",
    "gv_nguyenphuonglan03": "123456789",
    "gv_nguyenvanthang03": "123456789",
    "gv_nguyenvanloi03": "123456789",
    "gv_hoangthithinh03": "123456789"
};

// Học sinh (ví dụ)
const students = {
    "lau_tuan_anh": "123456",
    "sung_duy_anh": "123456",
    "lau_thi_cha": "123456",
    "mua_thi_chu": "123456",
    "giang_thi_do": "123456"
};

// Học sinh → lớp
const studentClasses = {
    "lau_tuan_anh": 6,
    "sung_duy_anh": 6,
    "lau_thi_cha": 6
};

// ===============================
// 2. BIẾN TOÀN CỤC
// ===============================
let currentRole = null; // "teacher" hoặc "student"

// ===============================
// 3. CHỌN LOẠI TÀI KHOẢN
// ===============================
function selectRole(role){
    currentRole = role;
    document.getElementById("roleTeacher").classList.remove("active");
    document.getElementById("roleStudent").classList.remove("active");

    if(role === "teacher") document.getElementById("roleTeacher").classList.add("active");
    if(role === "student") document.getElementById("roleStudent").classList.add("active");
}

// ===============================
// 4. LOGIN FUNCTION
// ===============================
function login(){
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");
    error.textContent = "";

    if(!user || !pass){
        error.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin!";
        return;
    }

    if(!currentRole){
        error.textContent = "⚠️ Vui lòng chọn loại tài khoản!";
        return;
    }

    // ===== GIÁO VIÊN =====
    if(currentRole === "teacher"){
        const correctPass = teachers[user];
        if(!correctPass){
            error.textContent = "❌ Tài khoản giáo viên không tồn tại!";
            return;
        }
        if(correctPass !== pass){
            error.textContent = "❌ Sai mật khẩu giáo viên!";
            return;
        }

        // Đăng nhập thành công
        sessionStorage.setItem("teacher", user);
        window.location.href = "teacher_dashboard.html";
        return;
    }

    // ===== HỌC SINH =====
    if(currentRole === "student"){
        const correctPass = students[user];
        if(!correctPass){
            error.textContent = "❌ Tài khoản học sinh không tồn tại!";
            return;
        }
        if(correctPass !== pass){
            error.textContent = "❌ Sai mật khẩu học sinh!";
            return;
        }

        const grade = studentClasses[user] ?? 0;
        sessionStorage.setItem("student", user);
        sessionStorage.setItem("grade", grade);
        window.location.href = "student_dashboard.html";
        return;
    }

    error.textContent = "❌ Lỗi không xác định!";
}

// ===============================
// 5. LOGOUT FUNCTION (dùng chung)
// ===============================
function logout(){
    sessionStorage.clear();
    window.location.href = "index.html";
}