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