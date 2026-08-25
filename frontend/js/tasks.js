const API_URL = "https://smartfarm-hpam.onrender.com/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// DOM ELEMENTS
// ========================================

const taskGrid = document.getElementById("taskGrid");
const totalTasks = document.getElementById("totalTasks");

const addTaskButton = document.getElementById("addTaskButton");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const taskForm = document.getElementById("taskForm");

const taskSearch = document.getElementById("taskSearch");
const priorityFilter = document.getElementById("priorityFilter");
const statusFilter = document.getElementById("statusFilter");


// ========================================
// STORE TASKS
// ========================================

let allTasks = [];


// ========================================
// GET HEADERS
// ========================================

function getHeaders() {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    if (!taskGrid) return;

    try {

        taskGrid.innerHTML = `
            <p class="loading-message">
                Loading tasks...
            </p>
        `;

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load tasks"
            );
        }

        allTasks = data.tasks || [];

        displayTasks(allTasks);

        updateTaskCount();

    } catch (error) {

        console.error("Load tasks error:", error);

        taskGrid.innerHTML = `
            <p class="loading-message">
                Failed to load tasks.
            </p>
        `;
    }
}


// ========================================
// LOAD FARMS
// ========================================

async function loadFarms() {

    const taskFarm =
        document.getElementById("taskFarm");

    if (!taskFarm) return;

    try {

        const response = await fetch(
            `${API_URL}/farms`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load farms"
            );
        }

        taskFarm.innerHTML = `
            <option value="">
                Select Farm
            </option>
        `;

        (data.farms || []).forEach(function (farm) {

            const option =
                document.createElement("option");

            option.value = farm._id;

            option.textContent = farm.name;

            taskFarm.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Load farms error:",
            error
        );

    }
}


// ========================================
// LOAD CROPS FOR FARM
// ========================================

async function loadCrops(farmId) {

    const taskCrop =
        document.getElementById("taskCrop");

    if (!taskCrop) return;

    taskCrop.innerHTML = `
        <option value="">
            Select Crop (Optional)
        </option>
    `;

    if (!farmId) return;

    try {

        const response = await fetch(
            `${API_URL}/crops`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load crops"
            );
        }

        const crops = (data.crops || []).filter(
            function (crop) {

                const cropFarmId =
                    typeof crop.farm === "object"
                        ? crop.farm._id
                        : crop.farm;

                return cropFarmId === farmId;
            }
        );

        crops.forEach(function (crop) {

            const option =
                document.createElement("option");

            option.value = crop._id;

            option.textContent = crop.name;

            taskCrop.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Load crops error:",
            error
        );
    }
}


// ========================================
// DISPLAY TASKS
// ========================================

function displayTasks(tasks) {

    if (!taskGrid) return;

    taskGrid.innerHTML = "";

    if (!tasks || tasks.length === 0) {

        taskGrid.innerHTML = `
            <p class="loading-message">
                No tasks found. Add your first task.
            </p>
        `;

        return;
    }

    tasks.forEach(function (task) {
        addTaskCard(task);
    });
}


// ========================================
// ADD TASK CARD
// ========================================

function addTaskCard(task) {

    const card =
        document.createElement("article");

    card.className = "task-card";

    const priority =
        task.priority || "Medium";

    const status =
        task.status || "Pending";

    const farmName =
        task.farm && typeof task.farm === "object"
            ? task.farm.name
            : "Unknown Farm";

    const cropName =
        task.crop && typeof task.crop === "object"
            ? task.crop.name
            : "No Crop";

    card.innerHTML = `

        <div class="task-card-header">

            <span class="task-priority">
                ${priority}
            </span>

            <button
                class="more-button"
                onclick="deleteTask('${task._id}')"
            >
                🗑
            </button>

        </div>


        <div class="task-card-body">

            <h3>
                ${task.title || "Untitled Task"}
            </h3>

            <p>
                ${task.description || "No description provided."}
            </p>


            <div class="task-info">

                <p>
                    🌱 Farm:
                    <strong>${farmName}</strong>
                </p>

                <p>
                    🌾 Crop:
                    <strong>${cropName}</strong>
                </p>

                <p>
                    📅 Due:
                    <strong>
                        ${formatDate(task.dueDate)}
                    </strong>
                </p>

                <p>
                    Status:
                    <strong>${status}</strong>
                </p>

            </div>


            <div class="task-actions">

                <button
                    onclick="toggleTaskStatus(
                        '${task._id}',
                        '${status}'
                    )"
                >
                    ${
                        status === "Completed"
                            ? "Completed ✓"
                            : "Mark Completed"
                    }
                </button>


                <button
                    onclick="deleteTask('${task._id}')"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

    taskGrid.appendChild(card);
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    if (!date) {
        return "Not specified";
    }

    const formattedDate =
        new Date(date);

    if (isNaN(formattedDate.getTime())) {
        return "Not specified";
    }

    return formattedDate.toLocaleDateString();
}


// ========================================
// UPDATE TASK COUNT
// ========================================

function updateTaskCount() {

    if (totalTasks) {
        totalTasks.textContent =
            allTasks.length;
    }
}


// ========================================
// OPEN MODAL
// ========================================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        async function () {

            if (taskForm) {
                taskForm.reset();
            }

            await loadFarms();

            if (taskModal) {
                taskModal.classList.add("show");
            }

        }
    );
}


// ========================================
// CLOSE MODAL
// ========================================

function closeTaskModal() {

    if (taskModal) {
        taskModal.classList.remove("show");
    }

    if (taskForm) {
        taskForm.reset();
    }
}


if (closeModal) {
    closeModal.addEventListener(
        "click",
        closeTaskModal
    );
}


if (cancelModal) {
    cancelModal.addEventListener(
        "click",
        closeTaskModal
    );
}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        function (event) {

            if (event.target === taskModal) {
                closeTaskModal();
            }

        }
    );
}


// ========================================
// FARM CHANGE
// ========================================

const taskFarm =
    document.getElementById("taskFarm");

if (taskFarm) {

    taskFarm.addEventListener(
        "change",
        function () {

            loadCrops(
                taskFarm.value
            );

        }
    );
}


// ========================================
// CREATE TASK
// ========================================

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                document
                    .getElementById("taskTitle")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("taskDescription")
                    .value
                    .trim();

            const farm =
                document
                    .getElementById("taskFarm")
                    .value;

            const cropElement =
                document.getElementById("taskCrop");

            const crop =
                cropElement
                    ? cropElement.value
                    : "";

            const dueDate =
                document
                    .getElementById("dueDate")
                    .value;

            const priority =
                document
                    .getElementById("taskPriority")
                    .value;

            const status =
                document
                    .getElementById("taskStatus")
                    .value;

            if (!title || !farm || !dueDate) {

                alert(
                    "Please enter task title, farm, and due date."
                );

                return;
            }

            const taskData = {
                title,
                description,
                farm,
                dueDate,
                priority,
                status
            };

            if (crop) {
                taskData.crop = crop;
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/tasks`,
                        {
                            method: "POST",
                            headers: getHeaders(),
                            body: JSON.stringify(taskData)
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create task"
                    );
                }

                alert(
                    "Task created successfully!"
                );

                closeTaskModal();

                await loadTasks();

            } catch (error) {

                console.error(
                    "Create task error:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to create task"
                );
            }
        }
    );
}


// ========================================
// UPDATE TASK STATUS
// ========================================

async function toggleTaskStatus(
    taskId,
    currentStatus
) {

    const newStatus =
        currentStatus === "Completed"
            ? "Pending"
            : "Completed";

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",
                    headers: getHeaders(),

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update task"
            );
        }

        await loadTasks();

    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        alert(
            error.message ||
            "Failed to update task"
        );
    }
}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(taskId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "DELETE",
                    headers: getHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete task"
            );
        }

        alert(
            "Task deleted successfully!"
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete task"
        );
    }
}


// ========================================
// MAKE FUNCTIONS GLOBAL
// ========================================

window.deleteTask = deleteTask;

window.toggleTaskStatus =
    toggleTaskStatus;


// ========================================
// FILTER TASKS
// ========================================

function filterTasks() {

    const search =
        taskSearch
            ? taskSearch.value
                .toLowerCase()
                .trim()
            : "";

    const priority =
        priorityFilter
            ? priorityFilter.value
            : "all";

    const status =
        statusFilter
            ? statusFilter.value
            : "all";

    const filteredTasks =
        allTasks.filter(
            function (task) {

                const title =
                    (task.title || "")
                        .toLowerCase();

                const description =
                    (task.description || "")
                        .toLowerCase();

                const matchesSearch =
                    title.includes(search) ||
                    description.includes(search);

                const matchesPriority =
                    priority === "all" ||
                    priority === "" ||
                    task.priority === priority;

                const matchesStatus =
                    status === "all" ||
                    status === "" ||
                    task.status === status;

                return (
                    matchesSearch &&
                    matchesPriority &&
                    matchesStatus
                );
            }
        );

    displayTasks(filteredTasks);
}


// ========================================
// FILTER EVENTS
// ========================================

if (taskSearch) {
    taskSearch.addEventListener(
        "input",
        filterTasks
    );
}

if (priorityFilter) {
    priorityFilter.addEventListener(
        "change",
        filterTasks
    );
}

if (statusFilter) {
    statusFilter.addEventListener(
        "change",
        filterTasks
    );
}


// ========================================
// INITIALIZE
// ========================================

loadTasks();
loadFarms();