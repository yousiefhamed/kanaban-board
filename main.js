const todoColumn = document.querySelector('#todo-column');
const inProgressColumn = document.querySelector('#inprogress-column');
const doneColumn = document.querySelector('#done-column');
const addTaskButtons = document.querySelectorAll('.add-task');
let tasks = [];

// Load tasks from local storage
if (localStorage.getItem('tasks')) {
  tasks = JSON.parse(localStorage.getItem('tasks'));
  renderTasks();
}

// Add task button click event listener
addTaskButtons.forEach(button => {
  button.addEventListener('click', () => {
    const column = button.dataset.column;
    const task = { title: '', column };
    tasks.push(task);
    saveTasks();
    renderTasks();
  });
});

// Render tasks in columns
function renderTasks() {
  todoColumn.innerHTML = '';
  inProgressColumn.innerHTML = '';
  doneColumn.innerHTML = '';
  tasks.forEach((task, index) => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.setAttribute('draggable', true);
    taskElement.dataset.index = index;
    taskElement.innerHTML = `
      <input type="text" value="${task.title}" />
      <div class="actions">
        <i class="fas fa-edit"></i>
        <i class="fas fa-trash"></i>
      </div>
    `;
    // Task editing
    function editTask() {
      const titleInput = taskElement.querySelector('input');
      titleInput.removeAttribute('readonly');
      titleInput.focus();
      titleInput.addEventListener('blur', () => {
        const redundantTask = tasks.find(x => x.title === titleInput.value);
        if (redundantTask) {
          alert('Task is already added before')
        } else {
          task.title = titleInput.value;
        }
        saveTasks();
        renderTasks();
      })
    }
    taskElement.querySelector('input').addEventListener('click', () => {
      editTask();
    })
    taskElement.querySelector('.fa-edit').addEventListener('click', () => {
      editTask();
    });

    // Task deletion
    taskElement.querySelector('.fa-trash').addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    // Drag and drop events
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragenter', handleDragEnter);
    taskElement.addEventListener('dragover', handleDragOver);
    taskElement.addEventListener('dragleave', handleDragLeave);
    taskElement.addEventListener('drop', handleDrop);
    taskElement.addEventListener('dragend', handleDragEnd);
    // Drag and drop events for touch
    taskElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    taskElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    taskElement.addEventListener('touchend', handleTouchEnd);

    // Add task to column
    if (task.column === 'todo') {
      todoColumn.appendChild(taskElement);
    } else if (task.column === 'inprogress') {
      inProgressColumn.appendChild(taskElement);
    } else if (task.column === 'done') {
      doneColumn.appendChild(taskElement);
    }
  });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Drag and drop functions
let dragSrcEl = null;

function handleDragStart(e) {
  this.style.opacity = '0.4';
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl !== this) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
    tasks[dragSrcEl.dataset.index].title = dragSrcEl.querySelector('input[type="text"]').value;
    tasks[this.dataset.index].title = this.querySelector('input[type="text"]').value;
    saveTasks();
    renderTasks();
  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  document.querySelectorAll('.drag-over').forEach(element => {
    element.classList.remove('drag-over');
  });
}

// Drag and drop functions for touch
let touchSrcEl = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleTouchStart(e) {
  touchSrcEl = this;
  touchOffsetX = e.targetTouches[0].clientX - touchSrcEl.getBoundingClientRect().left;
  touchOffsetY = e.targetTouches[0].clientY - touchSrcEl.getBoundingClientRect().top;
}

function handleTouchMove(e) {
  if (touchSrcEl !== null) {
    e.preventDefault();
    touchSrcEl.style.position = 'absolute';
    touchSrcEl.style.left = (e.targetTouches[0].pageX - touchOffsetX) + 'px';
    touchSrcEl.style.top = (e.targetTouches[0].pageY - touchOffsetY) + 'px';
  }
}

function handleTouchEnd(e) {
  if (touchSrcEl !== null) {
    let dropZone = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    while (dropZone !== null && !dropZone.classList.contains('column')) {
      dropZone = dropZone.parentElement;
    }
    if (dropZone !== null) {
      const srcIndex = tasks.indexOf(tasks.find((task) => task.title === touchSrcEl.querySelector('input[type="text"]').value));
      tasks[srcIndex].column = dropZone.id;
      saveTasks();
      renderTasks();
    }
    touchSrcEl.style.position = '';
    touchSrcEl.style.left = '';
    touchSrcEl.style.top = '';
    touchSrcEl = null;
  }
}