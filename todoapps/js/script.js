const todos = [];
const RENDER_EVENT = 'renser-todo'
const STORAGE_KEY = 'TODO_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeDropdown = document.getElementById('darkModeDropdown');
    const darkModeOn = document.getElementById('darkModeOn');
    const darkModeOff = document.getElementById('darkModeOff');

    // Function untuk mengganti tema (light/dark mode)
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        darkModeDropdown.classList.remove('show');
    }

    darkModeToggle.addEventListener('click', function () {
        toggleDarkMode();
    });

    darkModeOn.addEventListener('click', function () {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', true);
        darkModeDropdown.classList.remove('show');
    });

    darkModeOff.addEventListener('click', function () {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', false);
        darkModeDropdown.classList.remove('show');
    });

    // Cek mode terakhir yang disimpan di local storage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addTodo();
    });

    window.addEventListener('load', function () {
        if (isDarkMode) {
            darkModeToggle.checked = true;
        }
    });
    if (isStorageExist()) {
        loadDataFromStorage();
      }
});



function generateId() {
    return +new Date();
}

function generateTodoObject(id, task,  link, description, timesTime, isComplete) {
    return {
        id, task, link, description, timesTime, isComplete
    };
}


function addTodo() {
    const textTodo = document.getElementById('title').value;
    const textLink = document.getElementById('link').value;
    const description = document.getElementById('description').value;
    const timesTime = document.getElementById('date').value;
    const generateID = generateId();
    const todoObject = generateTodoObject(generateID, textTodo, textLink, description,  timesTime, false);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addTaskToCompleted(todoId){
    const todoTarget = fineTodo(todoId);

    if (todoId == null)return;
    todoTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
}

function fineTodo(todoId) {
    for (const todoItem of todos) {
        if (todoItem.id === todoId) {
            return todoItem;
        }
    }
    return null
}

function fineTodoIndex(todoId) {
    for (const index in todos) {
        if (todos[index].id === todoId) {
            return index;            
        }
    }
    return -1;
}

function makeTodo(todoObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerHTML = todoObject.task;

    const textLink = document.createElement('a');
    textLink.innerHTML = todoObject.link;
    textLink.classList.add('link-active')
    textLink.setAttribute('href', `${todoObject.link}`);

    const textParagraf = document.createElement('p');
    textParagraf.innerHTML = todoObject.description;

    const timesTime = document.createElement('p');
    timesTime.innerHTML = todoObject.timesTime;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textLink, textParagraf, timesTime); // Correct order

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `todo${todoObject.id}`);

    if (todoObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', () => {
            undoTaskFromCompleted(todoObject.id);
        });

        const trashButton = document.createElement('button'); // Fix typo here
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', async () => {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: false
            });
          
            const result = await swalWithBootstrapButtons.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, delete it!',
              cancelButtonText: 'No, cancel!',
              reverseButtons: true
            });
          
            if (result.isConfirmed) {
              removeTaskFromCompleted(todoObject.id);
              swalWithBootstrapButtons.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success'
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              swalWithBootstrapButtons.fire({
                title: 'Cancelled',
                text: 'Your imaginary file is safe :)',
                icon: 'error'
              });
            }
          });
          

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', () => {
            addTaskToCompleted(todoObject.id);
        });
        container.append(checkButton);
    }

    return container;
}


function removeTaskFromCompleted(todoId) {
    const todoTarget = fineTodoIndex(todoId);

    if (todoTarget === -1 ) return;
    todos.splice(todoTarget, 1)
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
};


function undoTaskFromCompleted(todoId) {
    const todoTarget = fineTodo(todoId);
    if(todoTarget == null) return;
    todoTarget.isComplete=false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function isStorageExist() {
    if (typeof (Storage) == undefined) {
        alert('Broser Tidak Mendukung LocalStorage')
        return false;
    };
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(todos);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(RENDER_EVENT))
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            todos.push(todo)
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
}

document.addEventListener(RENDER_EVENT, function() {
    console.log(todos);
    console.log(localStorage.getItem(STORAGE_KEY));
    const uncompletedTODOList = document.getElementById('todos');
    uncompletedTODOList.innerHTML = '';

    const complatedTODOList = document.getElementById('complated-todos');
    complatedTODOList.innerHTML = '';
   
    for (const todoItem of todos) {
      const todoElement = makeTodo(todoItem);
     if (!todoItem.isComplete) {
        uncompletedTODOList.append(todoElement)
     } else {
        complatedTODOList.append(todoElement)
     }
    }
})

