import store from './store.js';

const form = document.getElementById("form");
let noTasks = store.get("noTasks") || 0;
let completed = store.get("completedCount") || 0;
const noTasksMsg = document.getElementById("no-tasks");
const taskList = document.getElementById("task-list");

const changeTasks = () => {
  let currentScreen = document.querySelector(".activePage");
  const div = document.querySelector(".tasks");
  if (currentScreen !== div) {
    if (currentScreen) currentScreen.classList.remove("activePage");
    if (div) div.classList.add("activePage");
    localStorage.setItem("currentPage", "tasks");
    renderPage("tasks");
  }
};
document.querySelector('.tasks').addEventListener('click', changeTasks);

const changeStats = () => {
  let currentScreen = document.querySelector(".activePage");
  const div = document.querySelector(".stats");
  if (currentScreen !== div) {
    if (currentScreen) currentScreen.classList.remove("activePage");
    if (div) div.classList.add("activePage");
    localStorage.setItem("currentPage", "stats");
    renderPage("stats");
  }
};
document.querySelector('.stats').addEventListener('click', changeStats);

const changeFocus = () => {
  let currentScreen = document.querySelector(".activePage");
  const div = document.querySelector(".focus");
  if (currentScreen !== div) {
    if (currentScreen) currentScreen.classList.remove("activePage");
    if (div) div.classList.add("activePage");
    localStorage.setItem("currentPage", "focus");
    renderPage("focus");
  }
};
document.querySelector('.focus').addEventListener('click', changeFocus);

const changeCompletedTasks = () => {
  let currentScreen = document.querySelector(".activePage");
  const div = document.querySelector(".completed-tasks");
  if (currentScreen !== div) {
    if (currentScreen) currentScreen.classList.remove("activePage");
    if (div) div.classList.add("activePage");
    localStorage.setItem("currentPage", "completed");
    renderPage("completed");
  }
};
document.querySelector('.completed-tasks').addEventListener('click', changeCompletedTasks);

let numLow = 0 , numMedium = 0 , numHigh = 0;

const checkPriorityCounts = () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    if (btn.classList.contains('low')) {
      btn.disabled = (numLow === 0);
      if (numLow === 0) btn.classList.remove('active');
    } else if (btn.classList.contains('medium')) {
      btn.disabled = (numMedium === 0);
      if (numMedium === 0) btn.classList.remove('active');
    } else if (btn.classList.contains('high')) {
      btn.disabled = (numHigh === 0);
      if (numHigh === 0) btn.classList.remove('active');
    }
  });
};


function showNoTasks(show) {
  if (noTasksMsg) noTasksMsg.style.display = show ? '' : 'none';
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.style.display = show ? 'none' : 'inline-block';
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

  let currentPage = localStorage.getItem("currentPage") || "tasks";
  renderPage(currentPage);
 if(currentPage == "tasks"){
    changeTasks();
 }
 else if(currentPage == "completed"){
   changeCompletedTasks();
 }
 else if(currentPage == "stats"){
   changeStats();
 }
 else{
    changeFocus();
 }
  const tasks = store.get("tasks") || [];
  if (tasks.length === 0) {
    showNoTasks(true);
  } else {
    showNoTasks(false);
    tasks.forEach((task) =>
      addTask(
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        true
      )
    );
    noTasks = tasks.length;
    if (noTasks >= 2) addDeleteAll();
  }
  checkPriorityCounts();

  const completedTasks = store.get("completedTasks") || [];
  completedTasks.forEach((task) =>
    addCompletedCard(
      task.title,
      task.description,
      task.dueDate,
      task.priority
    )
  );

});

const filterContainer = document.querySelector('.filters');
let currentFilter = null;

function filterTasks(priority) {
  const allTasks = document.querySelectorAll('.task-item');
  allTasks.forEach(task => {
    const priSpan = task.querySelector('.task-priority span');
    const pri = priSpan ? priSpan.textContent : null;
    if (!priority || pri === priority) {
      task.style.display = '';
    } else {
      task.style.display = 'none';
    }
  });
}

if (filterContainer) {
  filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      const pri = e.target.classList.contains('low') ? 'low' : e.target.classList.contains('medium') ? 'medium' : 'high';
      if (currentFilter === pri) {
        filterTasks(null);
        currentFilter = null;
        e.target.classList.remove('active');
      } else {
        e.target.classList.add('active');
        filterTasks(pri);
        currentFilter = pri;
      }
    }
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let task = document.getElementById("task").value;
  let description = document.getElementById("description").value;
  let dueDate = document.getElementById("due-date").value;
  let priority = document.getElementById("priority").value;

  if (noTasks === 0) {
    showNoTasks(false);
  }
  addTaskWithChartUpdate(task, description, dueDate, priority);
});

const addTask = (task, description, dueDate, priority, skipSave = false) => {
  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  let priorityClass = "";
  if (priority === "low"){
     priorityClass = "priorityLow";
  }
  else if (priority === "medium") {
    priorityClass = "priorityMedium";
  }
  else if (priority === "high") {
    priorityClass = "priorityHigh";
  }
  taskItem.innerHTML = `
        <h3 class="task-title">${task}</h3>
        ${description ? `<p class="task-description">${description}</p>` : ""}
        ${dueDate ? `<p class="task-due-date">Due: ${dueDate}</p>` : ""}
        ${
          priority
            ? `<p class="task-priority">Priority: <span class="${priorityClass}">${priority}</span></p>`
            : ""
        }
        <div class="task-actions">
        <button class="complete-btn">Complete</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
        </div>
    `;
  taskList.appendChild(taskItem);
  form.reset();
  recountPriorities();
  checkPriorityCounts();
  if (!skipSave) {
    const tasks = store.get("tasks") || [];
    tasks.push({
      title: task,
      description,
      dueDate,
      priority,
      completed: false,
    });
    store.set("tasks", tasks);
    noTasks = tasks.length;
    store.set("noTasks", noTasks);
    if (noTasks === 2) addDeleteAll();
    updateStatsAndCharts();
  }
  showNoTasks(false);
};

function recountPriorities() {
  numLow = 0; numMedium = 0; numHigh = 0;
  document.querySelectorAll('.task-item').forEach(task => {
    const priSpan = task.querySelector('.task-priority span');
    if (priSpan) {
      if (priSpan.textContent === 'low') numLow++;
      else if (priSpan.textContent === 'medium') numMedium++;
      else if (priSpan.textContent === 'high') numHigh++;
    }
  });
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const taskItem = event.target.closest(".task-item");
    const title = taskItem.querySelector(".task-title").textContent;
    if (taskItem) {
      if (taskItem.querySelector(".priorityLow")) numLow--;
      else if (taskItem.querySelector(".priorityMedium")) numMedium--;
      else if (taskItem.querySelector(".priorityHigh")) numHigh--;
      checkPriorityCounts();

      taskItem.remove();
      let tasks = store.get("tasks") || [];
      tasks = tasks.filter((t) => t.title !== title);
      store.set("tasks", tasks);
      noTasks = tasks.length;
      store.set("noTasks", noTasks);
      updateStatsAndCharts();
      if (taskList.querySelectorAll(".task-item").length === 0) {
        const deleteAllBtn = document.querySelector(".delete-all-btn");
        if (deleteAllBtn) deleteAllBtn.remove();
        showNoTasks(true);
        noTasks = 0;
        store.set("noTasks", 0);
      }
    }
  }
  if (event.target.classList.contains("complete-btn")) {
    const taskItem = event.target.closest(".task-item");
    const title = taskItem.querySelector(".task-title").textContent;
    const description = taskItem.querySelector(".task-description")?.textContent || "";
    const dueDateText = taskItem.querySelector(".task-due-date")?.textContent || "";
    const dueDate = dueDateText.replace("Due: ", "");
    const prioritySpan = taskItem.querySelector(".task-priority span");
    const priority = prioritySpan ? prioritySpan.textContent : "";
    if (taskItem) {
      addCompletedCardWithChartUpdate(title, description, dueDate, priority);
      let tasks = store.get("tasks") || [];
      tasks = tasks.filter((t) => t.title !== title);
      store.set("tasks", tasks);
      let completedTasks = store.get("completedTasks") || [];
      completedTasks.push({
        title,
        description,
        dueDate,
        priority,
        completed: true,
        completedAt: new Date().toISOString()
      });
      if (taskItem.querySelector(".priorityLow")) numLow--;
      else if (taskItem.querySelector(".priorityMedium")) numMedium--;
      else if (taskItem.querySelector(".priorityHigh")) numHigh--;
      checkPriorityCounts();
      store.set("completedTasks", completedTasks);
      noTasks = tasks.length;
      completed = (store.get("completedCount") || 0) + 1;
      store.set("noTasks", noTasks);
      store.set("completedCount", completed);
      taskItem.remove();
      updateStatsAndCharts();
      if (taskList.querySelectorAll(".task-item").length === 0) {
        const deleteAllBtn = document.querySelector(".delete-all-btn");
        if (deleteAllBtn) deleteAllBtn.remove();
        showNoTasks(true);
        noTasks = 0;
        store.set("noTasks", 0);
      }
    }
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-btn")) {
    const taskItem = event.target.closest(".task-item");
    const title = taskItem.querySelector(".task-title").textContent;
    const description = taskItem.querySelector(".task-description")?.textContent || "";
    const dueDateText = taskItem.querySelector(".task-due-date")?.textContent || "";
    const dueDate = dueDateText.replace("Due: ", "");
    const prioritySpan = taskItem.querySelector(".task-priority span");
    const priority = prioritySpan ? prioritySpan.textContent : "";
    const tasks = store.get("tasks") || [];
    const oldTitle = title;
    const overlay = document.createElement("div");
    overlay.className = "edit-form-overlay";
    const popup = document.createElement("div");
    popup.className = "edit-form-popup";
    const editForm = document.createElement("form");
    editForm.className = "edit-form";
    editForm.innerHTML = `
      <h2>Edit Task</h2>
      <input type="text" name="edit-task" value="${title}" required placeholder="Task Title" />
      <input type="text" name="edit-description" value="${description}" placeholder="Description" />
      <input type="date" name="edit-due-date" value="${dueDate}" />
      <select name="edit-priority">
        <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
        <option value="medium" ${priority === "medium" ? "selected" : ""}>Medium</option>
        <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
      </select>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button type="submit">Save</button>
        <button type="button" class="cancel-edit-btn">Cancel</button>
      </div>
    `;
    popup.appendChild(editForm);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    editForm.querySelector(".cancel-edit-btn").addEventListener("click", () => {
      overlay.remove();
    });
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newTitle = editForm.elements["edit-task"].value;
      const newDescription = editForm.elements["edit-description"].value;
      const newDueDate = editForm.elements["edit-due-date"].value;
      const newPriority = editForm.elements["edit-priority"].value;
      
      const oldPriority = (priority || "").toLowerCase().trim();
      const updatedPriority = (newPriority || "").toLowerCase().trim();
      if (oldPriority !== updatedPriority) {
        setTimeout(() => {
          recountPriorities();
          checkPriorityCounts();
          if (currentFilter && ((currentFilter === 'low' && numLow === 0) || (currentFilter === 'medium' && numMedium === 0) || (currentFilter === 'high' && numHigh === 0))) {
            filterTasks(null);
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            currentFilter = null;
          }
        }, 0);
      } else {
        recountPriorities();
        checkPriorityCounts();
      }
      taskItem.querySelector(".task-title").textContent = newTitle;
      if (taskItem.querySelector(".task-description")) {
        if (newDescription) {
          taskItem.querySelector(".task-description").textContent = newDescription;
        } else {
          taskItem.querySelector(".task-description").remove();
        }
      } else if (newDescription) {
        const desc = document.createElement("p");
        desc.className = "task-description";
        desc.textContent = newDescription;
        taskItem.insertBefore(
          desc,
          taskItem.querySelector(".task-due-date") ||
            taskItem.querySelector(".task-priority") ||
            taskItem.querySelector(".task-actions")
        );
      }
      if (taskItem.querySelector(".task-due-date")) {
        if (newDueDate) {
          taskItem.querySelector(".task-due-date").textContent = `Due: ${newDueDate}`;
        } else {
          taskItem.querySelector(".task-due-date").remove();
        }
      } else if (newDueDate) {
        const due = document.createElement("p");
        due.className = "task-due-date";
        due.textContent = `Due: ${newDueDate}`;
        taskItem.insertBefore(
          due,
          taskItem.querySelector(".task-priority") ||
            taskItem.querySelector(".task-actions")
        );
      }
      if (taskItem.querySelector(".task-priority")) {
        if (newPriority) {
          let priorityClass = "";
          if (newPriority === "low") priorityClass = "priorityLow";
          else if (newPriority === "medium") priorityClass = "priorityMedium";
          else if (newPriority === "high") priorityClass = "priorityHigh";
          taskItem.querySelector(".task-priority span").className = priorityClass;
          taskItem.querySelector(".task-priority span").textContent = newPriority;
        } else {
          taskItem.querySelector(".task-priority").remove();
        }
      } else if (newPriority) {
        let priorityClass = "";
        if (newPriority === "low") priorityClass = "priorityLow";
        else if (newPriority === "medium") priorityClass = "priorityMedium";
        else if (newPriority === "high") priorityClass = "priorityHigh";
        const pri = document.createElement("p");
        pri.className = "task-priority";
        pri.innerHTML = `Priority: <span class="${priorityClass}">${newPriority}</span>`;
        taskItem.insertBefore(pri, taskItem.querySelector(".task-actions"));
      }
      overlay.remove();
      const updatedTasks = tasks.map((t) =>
        t.title === oldTitle
          ? {
              ...t,
              title: newTitle,
              description: newDescription,
              dueDate: newDueDate,
              priority: newPriority,
            }
          : t
      );
      store.set("tasks", updatedTasks);
      updateStatsAndCharts();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
});

const addDeleteAll = () => {
  const oldBtn = document.querySelector(".delete-all-btn");
  if (oldBtn) oldBtn.remove();
  const deleteAllBtn = document.createElement("button");
  deleteAllBtn.textContent = "Delete All Tasks";
  deleteAllBtn.className = "delete-all-btn";
  deleteAllBtn.type = "button";
  deleteAllBtn.addEventListener("click", () => {
    taskList.innerHTML = "";
    deleteAllBtn.remove();
    store.set("tasks", []);
    store.set("noTasks", 0);
    noTasks = 0;
    showNoTasks(true);
    updateStatsAndCharts();
  });
  taskList.parentElement.insertBefore(deleteAllBtn, taskList.nextSibling);
};

const fullscreenBtn = document.querySelector(".fullscreen");

const fullscreenIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fullscreen-icon lucide-fullscreen"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>
`;

const minimizeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-icon lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
`;

function setFullscreenIcon(isFullscreen) {
  if (fullscreenBtn) {
    fullscreenBtn.innerHTML = isFullscreen ? minimizeIcon : fullscreenIcon;
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}

document.addEventListener("fullscreenchange", () => {
  setFullscreenIcon(!!document.fullscreenElement);
});

window.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('aside');
  const resizer = document.querySelector('.aside-resizer');
  const main = document.querySelector('.content');
  if (aside && main) {
    const savedWidth = localStorage.getItem('asideWidth');
    const width = savedWidth ? Math.max(180, Math.min(600, parseInt(savedWidth, 10))) : aside.offsetWidth;
    aside.style.width = width + 'px';
    document.querySelectorAll('.content').forEach(content => {
      content.style.marginRight = width + 'px';
    });
  }
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  if (resizer && aside && main) {
    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = aside.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      let newWidth = startWidth + (startX - e.clientX);
      newWidth = Math.max(180, Math.min(600, newWidth));
      aside.style.width = newWidth + 'px';
       document.querySelectorAll('.content').forEach(content => {
        content.style.marginRight = newWidth + 'px';
      });
    });
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    const savedWidth = localStorage.getItem('asideWidth');
    if (savedWidth) {
      const width = Math.max(180, Math.min(600, parseInt(savedWidth, 10)));
      aside.style.width = width + 'px';
      main.style.marginRight = width + 'px';
    }
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('asideWidth', aside.offsetWidth);
    });

  }
});


const renderPage = (page) => {
  const tasksSection = document.getElementById('tasks');
  const completedSection = document.getElementById('completed');
  const statsSection = document.getElementById('stats');
  const focusSection = document.getElementById('focus');
  if (tasksSection) tasksSection.style.display = (page === 'tasks') ? '' : 'none';
  if (completedSection) completedSection.style.display = (page === 'completed') ? '' : 'none';
  if (statsSection) statsSection.style.display = (page === 'stats') ? '' : 'none';
  if (focusSection) focusSection.style.display = (page === 'focus') ? '' : 'none';
}

const addCompletedCard = (title, description, dueDate, priority) => {
  const compList = document.getElementById("comp-list");
  if (compList) {
    const compItem = document.createElement("div");
    compItem.className = "comp-item";
    const backgroundSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`

    let priorityClass = "";
    if (priority === "low"){
       priorityClass = "priorityLow";
    }
    else if (priority === "medium") {
      priorityClass = "priorityMedium";
    }
    else if (priority === "high") {
      priorityClass = "priorityHigh";
    }
    compItem.innerHTML = `
          <h3 class="comp-title">${title}</h3>
          ${description ? `<p class="comp-description">${description}</p>` : ""}
          ${dueDate ? `<p class="comp-due-date">Due: ${dueDate}</p>` : ""}
          ${
            priority
              ? `<p class="comp-priority">Priority: <span class="${priorityClass}">${priority}</span></p>`
              : ""
          }
      `;
    compItem.appendChild(new DOMParser().parseFromString(backgroundSVG, 'image/svg+xml').documentElement);
    compList.appendChild(compItem);
    const noCompMsg = document.querySelector(".no-comp");
    if (noCompMsg) noCompMsg.style.display = 'none';
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".comp-item")) {
    const compItem = event.target.closest(".comp-item");
    const title = compItem.querySelector(".comp-title").textContent;
    const overlay = document.createElement("div");
    overlay.className = "delete-comp-overlay";
    const popup = document.createElement("div");
    popup.className = "delete-comp-popup";
    popup.innerHTML = `
      <h2>Delete Completed Task?</h2>
      <p>Are you sure you want to delete "<strong>${title}</strong>"?</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="confirm-delete-comp">Delete</button>
        <button class="cancel-delete-comp">Cancel</button>
      </div>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    overlay.querySelector(".cancel-delete-comp").addEventListener("click", () => {
      overlay.remove();
    });

    overlay.querySelector(".confirm-delete-comp").addEventListener("click", () => {
      compItem.remove();
      let completedTasks = store.get("completedTasks") || [];
      completedTasks = completedTasks.filter((t) => t.title !== title);
      store.set("completedTasks", completedTasks);
      completed = completedTasks.length;
      store.set("completedCount", completed);
      overlay.remove();
      updateStatsAndCharts();
      if (completedTasks.length === 0) {
        const noCompMsg = document.querySelector(".no-comp");
        if (noCompMsg) noCompMsg.style.display = '';
      }
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
});


const timerDisplay = document.getElementById('timer');
const breakDisplay = document.getElementById('break-timer');
const stopwatchDisplay = document.getElementById('stopwatch');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const settingsBtn = document.getElementById('settings-btn');
const settingsPopup = document.getElementById('settings-popup');
const settingsPopupContent = document.querySelector('.settings-popup-content');
const focusDurationInput = document.getElementById('focus-duration');
const breakDurationInput = document.getElementById('break-duration');
const saveSettingsBtn = document.getElementById('save-settings');
const cancelSettingsBtn = document.getElementById('cancel-settings');

const startBreakBtn = document.getElementById('start-break');
const pauseBreakBtn = document.getElementById('pause-break');
const resetBreakBtn = document.getElementById('reset-break');

const startStopwatchBtn = document.getElementById('start-stopwatch');
const pauseStopwatchBtn = document.getElementById('pause-stopwatch');
const resetStopwatchBtn = document.getElementById('reset-stopwatch');

let focusDuration = parseInt(localStorage.getItem('focusDuration')) || 25;
let breakDuration = parseInt(localStorage.getItem('breakDuration')) || 5;
let timerSeconds = parseInt(localStorage.getItem('focusTimerSeconds')) || focusDuration * 60;
let breakSeconds = parseInt(localStorage.getItem('breakTimerSeconds')) || breakDuration * 60;
let stopwatchSeconds = parseInt(localStorage.getItem('stopwatchSeconds')) || 0;

let timerInterval = null;
let breakInterval = null;
let stopwatchInterval = null;
let timerRunning = false;
let breakRunning = false;
let stopwatchRunning = false;

function formatTime(seconds, showHours=false) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (showHours) {
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateDisplays() {
  timerDisplay.textContent = formatTime(timerSeconds);
  breakDisplay.textContent = formatTime(breakSeconds);
  stopwatchDisplay.textContent = formatTime(stopwatchSeconds, true);
}
updateDisplays();

startPauseBtn.addEventListener('click', () => {
  if (!timerRunning) {
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        localStorage.setItem('focusTimerSeconds', timerSeconds);
        updateDisplays();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        startPauseBtn.textContent = 'Start';
        alert('Focus session complete!');
        recordPomodoroSession(focusDuration, 0);
      }
    }, 1000);
    timerRunning = true;
    startPauseBtn.textContent = 'Pause';
  } else {
    clearInterval(timerInterval);
    timerRunning = false;
    startPauseBtn.textContent = 'Start';
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = focusDuration * 60;
  localStorage.setItem('focusTimerSeconds', timerSeconds);
  updateDisplays();
  startPauseBtn.textContent = 'Start';
});

settingsBtn.addEventListener('click', () => {
  settingsPopup.classList.remove('hidden');
  focusDurationInput.value = focusDuration;
  breakDurationInput.value = breakDuration;
});

saveSettingsBtn.addEventListener('click', () => {
  focusDuration = parseInt(focusDurationInput.value) || 25;
  breakDuration = parseInt(breakDurationInput.value) || 5;
  localStorage.setItem('focusDuration', focusDuration);
  localStorage.setItem('breakDuration', breakDuration);
  timerSeconds = focusDuration * 60;
  breakSeconds = breakDuration * 60;
  localStorage.setItem('focusTimerSeconds', timerSeconds);
  localStorage.setItem('breakTimerSeconds', breakSeconds);
  updateDisplays();
  settingsPopup.classList.add('hidden');
});

cancelSettingsBtn.addEventListener('click', () => {
  settingsPopup.classList.add('hidden');
});

settingsPopup.addEventListener('click', (e) => {
  if (e.target === settingsPopup) settingsPopup.classList.add('hidden');
});

startBreakBtn.addEventListener('click', () => {
  if (!breakRunning) {
    breakInterval = setInterval(() => {
      if (breakSeconds > 0) {
        breakSeconds--;
        localStorage.setItem('breakTimerSeconds', breakSeconds);
        updateDisplays();
      } else {
        clearInterval(breakInterval);
        breakRunning = false;
        startBreakBtn.textContent = 'Start';
        alert('Break is over!');
        recordPomodoroSession(0, breakDuration);
      }
    }, 1000);
    breakRunning = true;
    startBreakBtn.textContent = 'Pause';
  } else {
    clearInterval(breakInterval);
    breakRunning = false;
    startBreakBtn.textContent = 'Start';
  }
});

pauseBreakBtn.addEventListener('click', () => {
  clearInterval(breakInterval);
  breakRunning = false;
  startBreakBtn.textContent = 'Start';
});

resetBreakBtn.addEventListener('click', () => {
  clearInterval(breakInterval);
  breakRunning = false;
  breakSeconds = breakDuration * 60;
  localStorage.setItem('breakTimerSeconds', breakSeconds);
  updateDisplays();
  startBreakBtn.textContent = 'Start';
});

startStopwatchBtn.addEventListener('click', () => {
  if (!stopwatchRunning) {
    stopwatchInterval = setInterval(() => {
      stopwatchSeconds++;
      localStorage.setItem('stopwatchSeconds', stopwatchSeconds);
      updateDisplays();
    }, 1000);
    stopwatchRunning = true;
    startStopwatchBtn.textContent = 'Pause';
  } else {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    startStopwatchBtn.textContent = 'Start';
  }
});

pauseStopwatchBtn.addEventListener('click', () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
  startStopwatchBtn.textContent = 'Start';
});

resetStopwatchBtn.addEventListener('click', () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
  stopwatchSeconds = 0;
  localStorage.setItem('stopwatchSeconds', stopwatchSeconds);
  updateDisplays();
  startStopwatchBtn.textContent = 'Start';
});



let maxStreak = store.get("maxStreak") || 0;
let currentStreak = 0;
const getStreak = () => {
  let streak = 0;
  let completedTasks = store.get("completedTasks") || [];
  const completedDates = new Set(
    completedTasks
      .map(task => {
        const dateStr = task.completedAt || task.completedDate;
        if (!dateStr) return null;
        return new Date(dateStr).toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );
  let currentDate = new Date();
  const todayStr = currentDate.toISOString().slice(0, 10);
  if (!completedDates.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  while (true) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    if (completedDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  if (streak > maxStreak) {
    maxStreak = streak;
    store.set("maxStreak", maxStreak);
  }
  currentStreak = streak;
  if(currentStreak < (maxStreak / 2)){
    document.querySelector('.streak-fire').style.opacity = '0.8';
  }
  return streak;
};

window.addEventListener('DOMContentLoaded', () => {
  const streakCountElem = document.querySelector('.streak-count');
  if (streakCountElem) {
    const streak = getStreak();
    streakCountElem.textContent = `${streak}x Streak`;
  }
  setInterval(() => {
    const streak = getStreak();
    if (streakCountElem) {
      streakCountElem.textContent = `${streak}x Streak`;
    }
  }, 60 * 1000);
});


const streakChart = document.getElementById('streakChart');
const completionChart = document.getElementById('completionChart');
const categoryChart = document.getElementById('categoryChart');
const pomodoroChart = document.getElementById('pomodoroChart');
const productivityChart = document.getElementById('productivityChart');
const weeklyChart = document.getElementById('weeklyChart');

function getStatsData() {
  const tasks = store.get("tasks") || [];
  const completedTasks = store.get("completedTasks") || [];
  const allTasks = [...tasks, ...completedTasks];
  const completedCount = completedTasks.length;
  const totalCount = allTasks.length;
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  let low = 0, medium = 0, high = 0;
  allTasks.forEach(t => {
    if (t.priority === 'low') low++;
    else if (t.priority === 'medium') medium++;
    else if (t.priority === 'high') high++;
  });
  const pomodoroSessions = store.get('pomodoroSessions') || [];
  const totalPomodoros = pomodoroSessions.length;
  const totalFocusTime = pomodoroSessions.reduce((sum, s) => sum + (s.focus || 0), 0);
  const totalRestTime = pomodoroSessions.reduce((sum, s) => sum + (s.break || 0), 0);
  let pomodoroStreak = 0, longestPomodoroStreak = 0;
  const sessionDates = Array.from(new Set(pomodoroSessions.map(s => s.date))).sort();
  
  if (sessionDates.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    let currentDate = new Date(today);
    let streakCount = 0;
    
    const todayStr = today;
    const yesterdayStr = new Date(currentDate.getTime() - 86400000).toISOString().slice(0, 10);
    
    if (sessionDates.includes(todayStr)) {
      streakCount = 1;
      currentDate.setTime(currentDate.getTime() - 86400000);
    } else if (sessionDates.includes(yesterdayStr)) {
      streakCount = 1;
      currentDate = new Date(yesterdayStr);
      currentDate.setTime(currentDate.getTime() - 86400000);
    }
    
    while (streakCount > 0) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      if (sessionDates.includes(dateStr)) {
        streakCount++;
        currentDate.setTime(currentDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    
    pomodoroStreak = streakCount;
    
    let maxStreak = 0, currentStreak = 1;
    for (let i = 1; i < sessionDates.length; i++) {
      const prevDate = new Date(sessionDates[i - 1]);
      const currDate = new Date(sessionDates[i]);
      const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        currentStreak = 1;
      }
    }
    longestPomodoroStreak = Math.max(maxStreak, currentStreak);
  }
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let weeklyCounts = Array(7).fill(0);
  completedTasks.forEach(t => {
    let dateStr = t.completedAt || t.completedDate;
    if (dateStr) {
      let d = new Date(dateStr);
      let day = d.getDay();
      weeklyCounts[day === 0 ? 6 : day - 1]++;
    }
  });
  let prodCounts = [0,0,0,0];
  completedTasks.forEach(t => {
    let dateStr = t.completedAt || t.completedDate;
    if (dateStr) {
      let hour = new Date(dateStr).getHours();
      if (hour < 12) prodCounts[0]++;
      else if (hour < 17) prodCounts[1]++;
      else if (hour < 21) prodCounts[2]++;
      else prodCounts[3]++;
    }
  });
  const streak = getStreak();
  return {
    completion: { completed: completedCount, pending: tasks.length, percent: completionPercent },
    priorities: { low, medium, high },
    pomodoro: {
      total: totalPomodoros,
      focus: totalFocusTime,
      rest: totalRestTime,
      avgPerDay: totalPomodoros ? (totalPomodoros / 7).toFixed(1) : 0,
      longestStreak: longestPomodoroStreak,
      streak: pomodoroStreak
    },
    streaks: { dayStreak: streak, pomodoroStreak, bestStreak: maxStreak },
    productivity: prodCounts,
    weekly: weeklyCounts
  };
}

let streakChartInstance, completionChartInstance, categoryChartInstance, pomodoroChartInstance, productivityChartInstance, weeklyChartInstance;

function updateAllCharts() {
  const stats = getStatsData();
  
  // Global Chart.js font configuration to fix text stretching
  Chart.defaults.font = {
    family: "'Segoe UI', system-ui, -apple-system, sans-serif",
    size: 13,
    style: 'normal',
    weight: 'normal',
    lineHeight: 1.3
  };
  
  Chart.defaults.plugins.legend.labels.font = {
    family: "'Segoe UI', system-ui, -apple-system, sans-serif",
    size: 13,
    style: 'normal',
    weight: 'normal'
  };
  
  Chart.defaults.scales.category.ticks.font = {
    family: "'Segoe UI', system-ui, -apple-system, sans-serif",
    size: 12,
    style: 'normal',
    weight: 'normal'
  };
  
  Chart.defaults.scales.linear.ticks.font = {
    family: "'Segoe UI', system-ui, -apple-system, sans-serif",
    size: 12,
    style: 'normal',
    weight: 'normal'
  };
  
  if (!streakChartInstance) {
    streakChartInstance = new Chart(streakChart, {
      type: 'bar',
      data: {
        labels: ['Day Streak', 'Pomodoro Streak', 'Best Streak'],
        datasets: [{
          label: 'Streaks',
          data: [stats.streaks.dayStreak, stats.pomodoro.streak, stats.streaks.bestStreak],
          backgroundColor: ['#00d7c2', '#d2aa09', '#ff4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        plugins: { 
          legend: { 
            display: false,
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        },
        scales: { 
          x: {
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          },
          y: { 
            beginAtZero: true,
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  } else {
    streakChartInstance.data.datasets[0].data = [stats.streaks.dayStreak, stats.pomodoro.streak, stats.streaks.bestStreak];
    streakChartInstance.update();
  }
  if (!completionChartInstance) {
    completionChartInstance = new Chart(completionChart, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [stats.completion.completed, stats.completion.pending],
          backgroundColor: ['#00d7c2', '#e0e0e0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        plugins: { 
          legend: { 
            display: true, 
            position: 'bottom',
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  } else {
    completionChartInstance.data.datasets[0].data = [stats.completion.completed, stats.completion.pending];
    completionChartInstance.update();
  }
  if (!categoryChartInstance) {
    categoryChartInstance = new Chart(categoryChart, {
      type: 'pie',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          data: [stats.priorities.low, stats.priorities.medium, stats.priorities.high],
          backgroundColor: ['#00d7c2', '#d2aa09', '#ff4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        plugins: { 
          legend: { 
            display: true, 
            position: 'bottom',
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  } else {
    categoryChartInstance.data.datasets[0].data = [stats.priorities.low, stats.priorities.medium, stats.priorities.high];
    categoryChartInstance.update();
  }
  if (!pomodoroChartInstance) {
    pomodoroChartInstance = new Chart(pomodoroChart, {
      type: 'bar',
      data: {
        labels: ['Total Sessions', 'Focus Time', 'Rest Time', 'Avg/Day', 'Longest Streak'],
        datasets: [{
          label: 'Pomodoro',
          data: [stats.pomodoro.total, stats.pomodoro.focus, stats.pomodoro.rest, stats.pomodoro.avgPerDay, stats.pomodoro.longestStreak],
          backgroundColor: ['#00d7c2', '#d2aa09', '#ff4444', '#00d7c2', '#d2aa09']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        plugins: { 
          legend: { 
            display: false,
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        },
        scales: { 
          x: {
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          },
          y: { 
            beginAtZero: true,
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  } else {
    pomodoroChartInstance.data.datasets[0].data = [stats.pomodoro.total, stats.pomodoro.focus, stats.pomodoro.rest, stats.pomodoro.avgPerDay, stats.pomodoro.longestStreak];
    pomodoroChartInstance.update();
  }
  if (!productivityChartInstance) {
    productivityChartInstance = new Chart(productivityChart, {
      type: 'bar',
      data: {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [{
          label: 'Tasks Completed',
          data: stats.productivity,
          backgroundColor: ['#00d7c2', '#d2aa09', '#ff4444', '#e0e0e0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        indexAxis: 'y',
        plugins: { 
          legend: { 
            display: false,
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        },
        scales: { 
          x: { 
            beginAtZero: true,
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          },
          y: {
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  } else {
    productivityChartInstance.data.datasets[0].data = stats.productivity;
    productivityChartInstance.update();
  }
  if (!weeklyChartInstance) {
    weeklyChartInstance = new Chart(weeklyChart, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Tasks Completed',
          data: stats.weekly,
          backgroundColor: '#00d7c2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        plugins: { 
          legend: { 
            display: false,
            labels: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 13,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        },
        scales: { 
          x: {
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          },
          y: { 
            beginAtZero: true,
            ticks: {
              font: {
                family: "'Segoe UI', system-ui, -apple-system, sans-serif",
                size: 12,
                style: 'normal',
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  } else {
    weeklyChartInstance.data.datasets[0].data = stats.weekly;
    weeklyChartInstance.update();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateAllCharts();
});

function updateStatsAndCharts() {
  updateAllCharts();
}

const originalAddTaskFunction = addTask;
const addTaskWithChartUpdate = (task, description, dueDate, priority, skipSave = false) => {
  originalAddTaskFunction(task, description, dueDate, priority, skipSave);
  updateStatsAndCharts();
};

const originalAddCompletedCardFunction = addCompletedCard;
const addCompletedCardWithChartUpdate = (title, description, dueDate, priority) => {
  originalAddCompletedCardFunction(title, description, dueDate, priority);
  updateStatsAndCharts();
};

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn") || event.target.classList.contains("complete-btn") || event.target.classList.contains("edit-btn")) {
    setTimeout(updateStatsAndCharts, 100);
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("confirm-delete-comp")) {
    setTimeout(updateStatsAndCharts, 100);
  }
});

function recordPomodoroSession(focusMinutes, breakMinutes) {
  const pomodoroSessions = store.get('pomodoroSessions') || [];
  pomodoroSessions.push({
    date: new Date().toISOString().slice(0,10),
    focus: focusMinutes,
    break: breakMinutes
  });
  store.set('pomodoroSessions', pomodoroSessions);
  updateStatsAndCharts();
}

const completedSearchInput = document.getElementById('completed-search-input');

if (completedSearchInput) {
  completedSearchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const completedTasks = document.querySelectorAll('#comp-list .comp-item');
    
    completedTasks.forEach(task => {
      const title = task.querySelector('.comp-title')?.textContent.toLowerCase() || '';
      const description = task.querySelector('.comp-description')?.textContent.toLowerCase() || '';
      const dueDate = task.querySelector('.comp-due-date')?.textContent.toLowerCase() || '';
      const priority = task.querySelector('.comp-priority')?.textContent.toLowerCase() || '';
      
      const matchesSearch = title.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           dueDate.includes(searchTerm) || 
                           priority.includes(searchTerm);
      
      if (matchesSearch || searchTerm === '') {
        task.style.display = '';
      } else {
        task.style.display = 'none';
      }
    });
    
    const visibleTasks = document.querySelectorAll('#comp-list .comp-item[style=""], #comp-list .comp-item:not([style])');
    const noCompMsg = document.querySelector('.no-comp');
    if (noCompMsg) {
      if (visibleTasks.length === 0 && completedTasks.length > 0) {
        noCompMsg.style.display = 'block';
        noCompMsg.textContent = 'No completed tasks match your search';
      } else if (completedTasks.length === 0) {
        noCompMsg.style.display = 'block';
        noCompMsg.textContent = "You haven't completed a task yet";
      } else {
        noCompMsg.style.display = 'none';
      }
    }
  });
}

const tasksSearchInput = document.getElementById('tasks-search-input');

if (tasksSearchInput) {
  tasksSearchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const activeTasks = document.querySelectorAll('#task-list .task-item');
    
    activeTasks.forEach(task => {
      const title = task.querySelector('.task-title')?.textContent.toLowerCase() || '';
      const description = task.querySelector('.task-description')?.textContent.toLowerCase() || '';
      const dueDate = task.querySelector('.task-due-date')?.textContent.toLowerCase() || '';
      const priority = task.querySelector('.task-priority')?.textContent.toLowerCase() || '';
      
      const matchesSearch = title.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           dueDate.includes(searchTerm) || 
                           priority.includes(searchTerm);
      
      if (matchesSearch || searchTerm === '') {
        task.style.display = '';
      } else {
        task.style.display = 'none';
      }
    });
    
    const visibleTasks = document.querySelectorAll('#task-list .task-item[style=""], #task-list .task-item:not([style])');
    const noTasksMsg = document.getElementById('no-tasks');
    if (noTasksMsg) {
      if (visibleTasks.length === 0 && activeTasks.length > 0) {
        noTasksMsg.style.display = 'block';
        noTasksMsg.textContent = 'No tasks match your search';
      } else if (activeTasks.length === 0) {
        noTasksMsg.style.display = 'block';
        noTasksMsg.textContent = 'No tasks yet';
      } else {
        noTasksMsg.style.display = 'none';
      }
    }
  });
}

