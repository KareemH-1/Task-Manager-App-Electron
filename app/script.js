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
  addTask(task, description, dueDate, priority);
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
      addCompletedCard(title, description, dueDate, priority);
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



const ctx1 = document.getElementById("taskCompletionChart");


new Chart(ctx1, {
  type: "doughnut",
  data: {
    labels: ["Completed", "Pending"],
    datasets: [{
      data: [completed, noTasks],
      backgroundColor: ["#d2aa09ff", "#e0e0e0"]
    }]
  },
  options: {
    plugins: {
      legend: { display: true, position: "bottom" }
    },
    cutout: "70%"
  }
});