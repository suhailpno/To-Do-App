const API_URL = "https://66dfc3272fb67ac16f270bf1.mockapi.io/api/ToDO";

// Select elements
const taskNameInput = document.getElementById("taskName");
const taskDeadlineInput = document.getElementById("taskDeadline");
const taskPriorityInput = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

// Edit Task Modal Elements
const editTaskModal = document.getElementById("editTaskModal");
const editTaskName = document.getElementById("editTaskName");
const editTaskDeadline = document.getElementById("editTaskDeadline");
const editTaskPriority = document.getElementById("editTaskPriority");
const saveEditBtn = document.getElementById("saveEditBtn");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");

let tasks = [];
let currentTaskId = null;

// Fetch tasks from API
async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    tasks = await response.json();
    displayTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// Add task to API
async function addTask() {
  const taskName = taskNameInput.value.trim();
  const taskDeadline = taskDeadlineInput.value;
  const taskPriority = taskPriorityInput.value;

  if (!taskName || !taskDeadline) {
    alert("Please enter both task name and deadline.");
    return;
  }

  if (new Date(taskDeadline) < new Date()) {
    alert("Deadline cannot be in the past.");
    return;
  }

  const newTask = {
    toDoName: taskName,
    priority: taskPriority,
    deadline: new Date(taskDeadline).getTime(),
    status: "pending",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    const addedTask = await response.json();
    tasks.push(addedTask);
    displayTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// Delete task from API
async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    tasks = tasks.filter((task) => task.id !== id);
    displayTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// Toggle task status
async function toggleTaskStatus(id) {
  const task = tasks.find((t) => t.id === id);
  task.status = task.status === "pending" ? "completed" : "pending";

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    displayTasks();
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}

// Display tasks
function displayTasks() {
  const statusFilterValue = statusFilter.value;
  const priorityFilterValue = priorityFilter.value;

  taskList.innerHTML = "";

  let filteredTasks = tasks;
  if (statusFilterValue !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === statusFilterValue
    );
  }
  if (priorityFilterValue !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === priorityFilterValue
    );
  }

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.classList.add(
      "task",
      "shadow-md",
      "rounded-lg",
      "p-4",
      "flex",
      "justify-between",
      "items-center"
    );
    taskItem.setAttribute("data-status", task.status);
    taskItem.setAttribute("data-priority", task.priority);
    taskItem.innerHTML = `
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800">${
                  task.toDoName
                }</h3>
                <p class="text-sm text-gray-600">Deadline: ${new Date(
                  task.deadline
                ).toLocaleDateString()}</p>
                <p class="text-sm text-gray-600">Priority: ${task.priority}</p>
            </div>
            <div class="flex items-center space-x-2">
                <select class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300" onchange="toggleTaskStatus('${
                  task.id
                }')">
                    <option value="pending" ${
                      task.status === "pending" ? "selected" : ""
                    }>Pending</option>
                    <option value="completed" ${
                      task.status === "completed" ? "selected" : ""
                    }>Completed</option>
                </select>
                <button class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300" onclick="deleteTask('${
                  task.id
                }')">Delete</button>
                ${
                  task.status === "pending"
                    ? `<button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300" onclick="toggleTaskStatus('${task.id}')">Complete</button>`
                    : `<span class="bg-green-400 text-white px-4 py-2 rounded-md">Completed</span>`
                }
                <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300" onclick="openEditModal('${
                  task.id
                }')">Edit</button>
            </div>
        `;
    taskList.appendChild(taskItem);
  });
}

// Open edit modal
function openEditModal(id) {
  currentTaskId = id;
  const task = tasks.find((t) => t.id === id);
  editTaskName.value = task.toDoName;
  editTaskDeadline.value = new Date(task.deadline).toISOString().split("T")[0];
  editTaskPriority.value = task.priority;

  editTaskModal.classList.remove("hidden");
}

// Close edit modal
closeEditModalBtn.addEventListener("click", () => {
  editTaskModal.classList.add("hidden");
});

// Save edited task
saveEditBtn.addEventListener("click", async () => {
  const updatedTask = {
    toDoName: editTaskName.value,
    deadline: new Date(editTaskDeadline.value).getTime(),
    priority: editTaskPriority.value,
    status: tasks.find((task) => task.id === currentTaskId).status, // Preserve current status
  };

  try {
    await fetch(`${API_URL}/${currentTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    tasks = tasks.map((task) =>
      task.id === currentTaskId ? { ...task, ...updatedTask } : task
    );
    displayTasks();
    editTaskModal.classList.add("hidden");
  } catch (error) {
    console.error("Error updating task:", error);
  }
});

// Filter tasks
statusFilter.addEventListener("change", () => {
  displayTasks();
});

priorityFilter.addEventListener("change", () => {
  displayTasks();
});

// Add task button click
addTaskBtn.addEventListener("click", addTask);

// Fetch tasks on load
fetchTasks();
