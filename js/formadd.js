"use strict";

import ToDo from './classtodo.js'; //Se importa la clase de la que se instanciaran los todos

window.onload = () => {
    //Se obtienen los formularios
    const frmAddToDo = document.getElementById('frmAddToDo');
    const frmUpdateToDo = document.getElementById('frmUpdateToDo');
    const frmSearch = document.getElementById('frmSearch');
    //Se obtiene el contenedor de los todos
    const cntToDos = document.getElementById('cntToDos');
    let cntToDosChilds;

    //Programacion para input de busqueda de los todos
    frmSearch.addEventListener('submit', e => {
        e.preventDefault();
        if (frmSearch.inptSearch.value !== '') {
            cntToDosChilds = cntToDos.children;
            for (let i = 0; i < cntToDosChilds.length; i++) {
                const [title, description] = cntToDosChilds[i].firstElementChild.children;

                if (
                    !title.innerText.includes(frmSearch.inptSearch.value) &&
                    !description.innerText.includes(frmSearch.inptSearch.value)
                ) {
                    //Si no se encuentra ni en el titulo ni en la descripcion del elemento lo que se busca
                    cntToDosChilds[i].classList.add('d-none');
                } else {
                    cntToDosChilds[i].classList.remove('d-none');
                }
            } 
        }
    })
    
    //Codigo del modal para editar el todo
    const modal = document.querySelector('.modal');
    const icnCloseModal = document.querySelector('.modal__icon');
    icnCloseModal.addEventListener('click', () => modal.classList.add('d-none'));

    //Inputs del filtrador
    const inptAll = document.getElementById('inptAll');
    const inptDone = document.getElementById('inptDone');
    const inptMissing = document.getElementById('inptMissing');

    //Programacion para el filtrador de los todos
    const filterToDos = (filterBy) => {
        cntToDosChilds = cntToDos.children;
        for (let i = 0; i < cntToDosChilds.length; i++) {
            let todoChckbx = cntToDosChilds[i].firstElementChild.lastElementChild.firstElementChild; 
            cntToDosChilds[i].classList.remove('d-none');

            if (filterBy == null) continue;

            if (todoChckbx.checked == filterBy) {
                cntToDosChilds[i].classList.add('d-none');
            }   
        }
    }

    //Eventos de cambio para los inputs del filtrador
    inptAll.addEventListener('change', () => filterToDos(null));
    inptDone.addEventListener('change', () => filterToDos(false));
    inptMissing.addEventListener('change', () => filterToDos(true));

    //Funcion para almacenar el arreglo de todos en el localStorage
    const saveTodos = () => localStorage.setItem('todos', JSON.stringify(todos));

    //Se obtiene el arreglo todos del localStorage en caso de que exista, si no se crea vacio
    let todos = JSON.parse(localStorage.getItem('todos')) ?? [];

    let objTodoToUpdate, todoToUpdate, todoIndx;

    //Funcion para obtener el objeto en el arr todos con determinado id
    const getObjInArr = (id) => {
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id == id) {
                return todos[i];
            }
        }
    }

    //Funcion para obtener el indice en el array del todo en la interfaz
    const getIndxById = idToCompare => todos.findIndex(
        todo => todo.id == idToCompare
    )

    //Programacion para actualizar el todo
    frmUpdateToDo.addEventListener('submit', e => {
        e.preventDefault();

        // Se actualiza el array
        objTodoToUpdate = getObjInArr(modal.getAttribute('id-to-update'));
        objTodoToUpdate.title = frmUpdateToDo.inptNewTitle.value;
        objTodoToUpdate.description = frmUpdateToDo.inptNewDescription.value; 

        todoIndx = getIndxById(objTodoToUpdate.id);
        todos[todoIndx] == objTodoToUpdate;
        //Se actualiza en la interfaz
        let keyToUpdate = modal.getAttribute('id-to-update');
        todoToUpdate = document.getElementById(`${keyToUpdate}`);
        let titleToUpdate = todoToUpdate.firstElementChild.firstElementChild;
        let descriptionToUpdate = titleToUpdate.nextElementSibling;

        titleToUpdate.textContent = objTodoToUpdate.title;
        descriptionToUpdate.textContent = objTodoToUpdate.description;

        //Se oculta el modal
        modal.classList.add('d-none');

        saveTodos();
    })

    //Programacion para mostrar el modal de editar del todo
    const editToDo = e => {
        todoToUpdate = e.target.parentElement.parentElement;

        modal.classList.remove('d-none');
        modal.setAttribute('id-to-update', todoToUpdate.getAttribute('id'));

        objTodoToUpdate = getObjInArr(todoToUpdate.getAttribute('id'));

        frmUpdateToDo.inptNewTitle.value = objTodoToUpdate.title;
        frmUpdateToDo.inptNewDescription.value = objTodoToUpdate.description;
    }

    //Programacion para actualizar el estado del todo (Done o Missing)
    const updateToDoState = (e, todo) => {
        let todoState = e.target.checked;
        let idToChangeState = todo.getAttribute('id');

        objTodoToUpdate = getObjInArr(idToChangeState);
        objTodoToUpdate.checked = todoState;

        todoIndx = todos.findIndex(todo => todo.id == idToChangeState);
        todos[todoIndx] = objTodoToUpdate;

        saveTodos();
    }

    //Programacion para eliminar un todo
    const removeToDo = e => {
        let todoToDelete = e.target.parentElement.parentElement;
        //Se elimina del array
        todoIndx = getIndxById(todoToDelete.getAttribute('id'));
        todos.splice(todoIndx, 1);
        //Se elimina de la interfaz
        todoToDelete.remove();

        saveTodos();
    }

    //Programacion para crear el html del todo
    const createToDoTmplt = (title, description, checked, idTodo) => {
        let todoTmplt = document.createElement('div');
        todoTmplt.className = 'todo';
        todoTmplt.setAttribute('id', idTodo);
        todoTmplt.innerHTML = `
            <div class="todo__details">
                <p class="todo__title">${title}</p>
                <p class="todo__description">${description}</p>
                <label class="todo__label">
                    <input type="checkbox" class="todo__input">Done
                </label>
            </div>
            <div class="todo__buttons">
                <button class="todo__button fa fa-pencil-alt"></button><button class="todo__button fa fa-trash"></button>
            </div>
        `;

        //Permitir editar y eliminar el todo
        let btnEdit = todoTmplt.lastElementChild.firstElementChild;
        let btnRemove = todoTmplt.lastElementChild.lastElementChild;
        let inptChecked = todoTmplt.firstElementChild.lastElementChild.firstElementChild;

        if (checked) inptChecked.setAttribute('checked', 'checked')

        btnEdit.addEventListener('click', editToDo);
        btnRemove.addEventListener('click', removeToDo);
        inptChecked.addEventListener('change', (e) => {
            updateToDoState(e, todoTmplt);
        });

        return todoTmplt;
    }

    //Programacion para cargar los todos del localStorage
    const loadTodos = () => {
        for (let i = 0; i < todos.length; i++) {
            cntToDos.appendChild(createToDoTmplt(todos[i].title, todos[i].description, todos[i].checked, todos[i].id));
        }
    }

    let id = 0;
    if (todos.length != 0) {
        id = todos[todos.length - 1].id + 1;
        loadTodos();
    }

    //Programacion para agregar un todo
    frmAddToDo.addEventListener('submit', e => {
        e.preventDefault();

        let valTitle = frmAddToDo.inptToDoTitle.value;
        let valDescription = frmAddToDo.inptToDoDescription.value;

        if (valTitle !== '' && valDescription !== '') {

            //Se actualiza en el array
            todos.push(new ToDo(valTitle, valDescription, id));
            id++;
            saveTodos();

            //Se actualiza en la interfaz
            cntToDos.appendChild(createToDoTmplt(valTitle, valDescription, false, id));

            frmAddToDo.reset();
        }
    })
}
