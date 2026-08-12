// ---------- DOM references ----------
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const clearAllBtn = document.getElementById('clearAllBtn');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const currentDateEl = document.getElementById('currentDate');

// ---------- State ----------
let tasks = [];

// ---------- Load from localStorage ----------
function loadTasks() {
    const stored = localStorage.getItem('dailyTasks');
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch {
            tasks = [];
        }
    } else {
        tasks = [];
    }
}

// ---------- Save to localStorage ----------
function saveTasks() {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
}

// ---------- Render UI ----------
function render() {
    // Clear list
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        // Sort: pending first, then completed (optional)
        const sorted = [...tasks].sort((a, b) => a.completed - b.completed);
        sorted.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.index = index;  // index in sorted order, but we need original id for actions

            const textSpan = document.createElement('span');
            textSpan.className = `task-text${task.completed ? ' completed' : ''}`;
            textSpan.textContent = task.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            // Complete button
            const completeBtn = document.createElement('button');
            completeBtn.className = 'complete-btn';
            completeBtn.innerHTML = task.completed ? '↩️' : '✅';
            completeBtn.title = task.completed ? 'Undo' : 'Complete';
            completeBtn.addEventListener('click', () => toggleComplete(task.id));

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            actionsDiv.appendChild(completeBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(textSpan);
            li.appendChild(actionsDiv);
            taskList.appendChild(li);
        });
    }

    updateStats();
    updateDate();
}

// ---------- Update stats ----------
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// ---------- Update date ----------
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// ---------- CRUD operations ----------
function addTask(text) {
    const newTask = {
        id: Date.now() + Math.random().toString(36).substr(2, 6),
        text: text.trim(),
        completed: false,
    };
    tasks.push(newTask);
    saveTasks();
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

function clearAllTasks() {
    if (tasks.length === 0) return;
    if (confirm('Delete all tasks?')) {
        tasks = [];
        saveTasks();
        render();
    }
}

// ---------- Event listeners ----------
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text) {
        addTask(text);
        taskInput.value = '';
        taskInput.focus();
    }
});

clearAllBtn.addEventListener('click', clearAllTasks);

// ---------- Init ----------
loadTasks();
render();