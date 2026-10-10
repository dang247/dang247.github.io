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
let currentSession = null;


form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentSession) {
        alert("Bạn cần đăng nhập trước!");
        return;
    }

    const taskTitleValue = title.value.trim();

    if (!taskTitleValue) {
        alert("Vui lòng nhập tiêu đề công việc!");
        return;
    }

    const newTask = {
        title: taskTitleValue,
        deadline: deadline.value || null,
        note: note.value.trim() || null,
        user_id: currentSession.user.id
    };

    const { data, error } = await supabaseClient
        .from("tasks")
        .insert(newTask)
        .select()
        .single();

    if (error) {
        console.error("Lỗi thêm task:", error);
        alert("Không thể thêm công việc: " + error.message);
        return;
    }

    const task = document.createElement("div");
    task.classList.add("task");

    const taskTitle = document.createElement("p");
    taskTitle.textContent = data.title;

    const completeCheckbox = document.createElement("input");
    completeCheckbox.type = "checkbox";
    completeCheckbox.checked = data.completed;

    taskTitle.prepend(completeCheckbox);

    if (data.completed) {
        task.classList.add("completed");
    }
    completeCheckbox.addEventListener("change", function() {
        toggleTask(
            data.id,
            completeCheckbox.checked,
            task,
            completeCheckbox
        );
    });

    const taskDeadline = document.createElement("p");
    taskDeadline.textContent = data.deadline || "Chưa có hạn";

    const taskNote = document.createElement("p");
    taskNote.textContent = data.note || "";

    task.appendChild(taskTitle);
    task.appendChild(taskDeadline);
    task.appendChild(taskNote);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Xóa";

    task.appendChild(deleteButton);
    taskList.prepend(task);

    deleteButton.addEventListener("click", function() {
    deleteTask(data.id, task, deleteButton);
    });

    form.reset();
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
    currentSession = session;
    updateAuthUI(session);

    setTimeout(function() {
        loadTasks();
    }, 0);
});

logoutButton.addEventListener("click", async function() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        authMessage.textContent = "Lỗi đăng xuất: " + error.message;
    }
});


async function loadTasks() {
    console.log("loadTasks chạy, session =", currentSession);

    if (!currentSession) {
        taskList.replaceChildren();
        return;
    }

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Lỗi tải task:", error);
        return;
    }

    taskList.replaceChildren();

    data.forEach(function(item) {
        const task = document.createElement("div");
        task.classList.add("task");
 
        const taskTitle = document.createElement("p");
        taskTitle.textContent = data.title;

        const completeCheckbox = document.createElement("input");
        completeCheckbox.type = "checkbox";
        completeCheckbox.checked = item.completed;

        taskTitle.prepend(completeCheckbox);

        if (item.completed) {
            task.classList.add("completed");
        }
        completeCheckbox.addEventListener("change", function() {
            toggleTask(
                item.id,
                completeCheckbox.checked,
                task,
                completeCheckbox
            );
        });

        const taskDeadline = document.createElement("p");
        taskDeadline.textContent = item.deadline || "Chưa có hạn";

        const taskNote = document.createElement("p");
        taskNote.textContent = item.note || "";

        task.append(taskTitle, taskDeadline, taskNote);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Xóa";

        task.appendChild(deleteButton);

        deleteButton.addEventListener("click", function() {
            deleteTask(item.id, task, deleteButton);
        });

        taskList.appendChild(task);
    });
}

async function deleteTask(taskId, taskElement, deleteButton) {
    if (!currentSession) {
        alert("Bạn cần đăng nhập trước!");
        return;
    }

    //if (!confirm("Bạn có chắc muốn xóa công việc này không?")) {
    //return;
    //}

    deleteButton.disabled = true;

    const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", currentSession.user.id);

    if (error) {
        console.error("Lỗi xóa task:", error);
        alert("Không thể xóa công việc: " + error.message);
        deleteButton.disabled = false;
        return;
    }

    taskElement.remove();
}

async function toggleTask(taskId, completed, taskElement, checkbox) {
    if (!currentSession) return;

    checkbox.disabled = true;

    const { error } = await supabaseClient
        .from("tasks")
        .update({ completed: completed })
        .eq("id", taskId)
        .eq("user_id", currentSession.user.id);

    if (error) {
        console.error("Lỗi cập nhật task:", error);
        alert("Không thể cập nhật trạng thái công việc.");
        checkbox.checked = !completed;
    } else {
        taskElement.classList.toggle("completed", completed);
    }

    checkbox.disabled = false;
}
