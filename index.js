// Classes

// Individual task 
class Task {
  constructor(task) {
    this.description = task;
    this.complete = false;
    this.index = 0;
  }
}

// Methods to modify tasks and DOM 
class Tasks {
  constructor(insertElement) {
    this.tasks = [];
    this.items = 0;
    this.insertElement = insertElement;
  }

  #addToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  #taskFinder = (id) => {
    const taskMod = this.tasks.find((task) => task.index === parseInt(id, 10));
    return taskMod;
  }

  #getFromLocalStorage = () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) {
      this.tasks = storedTasks;
      return true;
    }
    return false;
  }

  #addToDom = (element, taskListDom) => {
    taskListDom.appendChild(element);
  }

  #addEvents = (id, li) => {
    const deleteButton = li.querySelector(`#delete-${id}`);
    const inputText = li.querySelector(`#input-${id}`);
    const statusCompletion = li.querySelector(`#status-${id}`);

    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.id);
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('text/plain');
      const draggableElement = document.getElementById(data);
      const dropzone = e.target.closest('li');
      dropzone.parentNode.insertBefore(draggableElement, dropzone);
    });

    inputText.addEventListener('change', (e) => {
      this.edit(e.target.value, id);
    });

    statusCompletion.addEventListener('change', (e) => {
      this.status(e.target, id);
    });

    li.addEventListener('click', () => {
      li.classList.add('highlight');
      li.querySelector('.fa-ellipsis-vertical').classList.add('hidden');
      li.querySelector('.fa-trash-can').classList.remove('hidden');
    });

    deleteButton.addEventListener('click', () => {
      this.remove(id);
      this.generate(this.insertElement);
      li.remove();
    });

    document.addEventListener('click', (e) => {
      if (!li.contains(e.target)) {
        li.classList.remove('highlight');
        li.querySelector('.fa-ellipsis-vertical').classList.remove('hidden');
        li.querySelector('.fa-trash-can').classList.add('hidden');
      }
    });
  }

  #TaskElement = (task) => {
    const li = document.createElement('li');
    li.classList = 'p-4 task-list-element list-group-item d-flex align-items-center justify-content-between';
    li.id = `task-${task.index}`;
    li.setAttribute('draggable', true);
    li.innerHTML = `<div class="d-flex w-100"><input id="status-${task.index}" class="form-check-input me-2" type="checkbox" value=""><input class="w-100 p-0 m-0 border-0" name="" id="input-${task.index}" value="${task.description}"></div><div><a id="order-${task.index}"><i class="ps-2 fa-solid fa-ellipsis-vertical"></i></a><a id="delete-${task.index}"><i class="ps-2 hidden fa-solid fa-trash-can"></i></a></div>`;
    li.querySelector(`#status-${task.index}`).checked = task.complete;
    return li;
  }

  generate = (taskListDom) => {
    let indexUpdater = 0;
    taskListDom.innerHTML = '';
    this.tasks.forEach((task) => {
      indexUpdater += 1;
      this.items = indexUpdater;
      task.index = indexUpdater;
      const li = this.#TaskElement(task);
      this.#addEvents(task.index, li);
      this.#addToDom(li, taskListDom);
      this.#addToLocalStorage();
    });
  }

  retrieve = (taskListDom) => {
    if (this.#getFromLocalStorage()) {
      this.generate(taskListDom);
    }
  }

  status = (statusElement, id) => {
    this.#taskFinder(id).complete = statusElement.checked;
    this.#addToLocalStorage();
  }

  edit = (editTaskDescription, id) => {
    this.#taskFinder(id).description = editTaskDescription;
    this.#addToLocalStorage();
  }

  deleteCompleted = () => {
    const updatedTasks = this.tasks.filter((task) => task.complete === false);
    this.tasks = updatedTasks;
    this.items = updatedTasks.length;
    this.#addToLocalStorage();
  }

  add = (task) => {
    this.items += 1;
    task.index = this.items;
    this.tasks.push(task);
  }

  remove = (id) => {
    this.items -= 1;
    const updatedTasks = this.tasks.filter((task) => task.index !== parseInt(id, 10));
    this.tasks = updatedTasks;
    this.#addToLocalStorage();
  }
}

// Non-class dependant functions to clear all completed tasks and to add tasks

const clearAll = (element, taskList, taskListDom) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    taskList.deleteCompleted();
    taskList.generate(taskListDom);
  });
};

const newTask = (inputRegex, element, taskList, taskListDom) => {
  element.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && inputRegex.test(e.target.value)) {
      taskList.add(new Task(e.target.value));
      taskList.generate(taskListDom);
      e.target.value = '';
    }
  });
};

// Entry code, connected directly to HTML file 

const inputRegex = /^\S/;
const taskListDom = document.getElementById('task-list');
const newTaskDom = document.getElementById('new-task');
const clearAllDom = document.getElementById('clear-completed');

const taskList = new Tasks(taskListDom);

clearAll(clearAllDom, taskList, taskListDom);

newTask(inputRegex, newTaskDom, taskList, taskListDom);

taskList.retrieve(taskListDom);