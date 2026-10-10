const SUPABASE_URL = "https://btecstbmvxknvgntwdul.supabase.co";
const SUPABASE_KEY = "sb_publishable_JKqZn5GIoDOD_4d5-BljpA_75gZQ1GC";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Đã khởi tạo Supabase!");

const form = document.querySelector(".form");
const title = document.querySelector(".title");
const deadline = document.querySelector(".deadline");
const note = document.querySelector(".note");
const taskList = document.querySelector(".task-list");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = document.createElement("div");

    task.classList.add("task");

    const taskTitle = document.createElement("p");
    taskTitle.textContent = title.value;

    const taskDeadline = document.createElement("p");
    taskDeadline.textContent = deadline.value;

    const taskNote = document.createElement("p");
    taskNote.textContent = note.value;

    task.appendChild(taskTitle);
    task.appendChild(taskDeadline);
    task.appendChild(taskNote);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Xóa";

    task.appendChild(deleteButton);

    deleteButton.addEventListener("click", function() {
        task.remove();
    });

    taskList.appendChild(task);
});
const authForm = document.querySelector(".auth-form");
const authEmail = document.querySelector(".auth-email");
const authPassword = document.querySelector(".auth-password");
const authMessage = document.querySelector(".auth-message");
const signupButton = document.querySelector(".btn-signup");
const userInfo = document.querySelector(".user-info");
const logoutButton = document.querySelector(".btn-logout");
const todoBox = document.querySelector(".to-do-box");

// Đăng nhập
authForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail.value.trim(),
        password: authPassword.value
    });

    if (error) {
        authMessage.textContent = "Lỗi đăng nhập: " + error.message;
        return;
    }

    authMessage.textContent = "Đăng nhập thành công!";
});

// Đăng ký
signupButton.addEventListener("click", async function() {
    console.log("Đã bấm nút Đăng ký!");
    
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!authForm.reportValidity()) return;

    if (password.length < 6) {
        authMessage.textContent = "Mật khẩu cần ít nhất 6 ký tự.";
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        authMessage.textContent = "Lỗi đăng ký: " + error.message;
        return;
    }

    if (data.session) {
        authMessage.textContent = "Đăng ký thành công!";
    } else {
        authMessage.textContent =
            "Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản.";
    }
});
function updateAuthUI(session) {
    const loggedIn = Boolean(session);

    authForm.hidden = loggedIn;
    userInfo.hidden = !loggedIn;
    logoutButton.hidden = !loggedIn;
    todoBox.hidden = !loggedIn;

    if (loggedIn) {
        userInfo.textContent = "Đang đăng nhập: " + session.user.email;
        authMessage.textContent = "";
    } else {
        userInfo.textContent = "";
    }
}

supabaseClient.auth.onAuthStateChange(function(event, session) {
    updateAuthUI(session);
});

logoutButton.addEventListener("click", async function() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        authMessage.textContent = "Lỗi đăng xuất: " + error.message;
    }
});