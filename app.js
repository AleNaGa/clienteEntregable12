function getParams() {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var params = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
 
    return params;
}

// conseguir los path de la otra pagina
const params = getParams();

const url = "http://" + params['url'];
const path = params['path'];
const pathToEdit = params['edit'];
const pathToDelete = params['delete'];
const pathToInsert = params['insert'];


// se crea la tabla inicial del GetFields
window.onload = () => {
    getFields(url + path);
}


// Recoge el JSON y lo transforma en un array
function checkJSON(array){
    let allKeys = [];
    array.some(element => {
        for(key in element){
 
            allKeys.push(key);
           }

        return allKeys;
    });
    return allKeys;
}

//Renderizar en una tabla con los TH como las claves del JSON y los TD con los valores
function renderFields(array, allKeys){
    console.log(array[0]);
    const tableDiv = document.getElementById('tablediv');
    tableDiv.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('table-auto', 'border', 'border-black');
    const tr1 = document.createElement('tr');
    allKeys.forEach(element => {
        const th = document.createElement('th');
        th.classList.add('border', 'border-black');
        th.textContent = element;
        tr1.appendChild(th);
    });
    table.appendChild(tr1);
    array.forEach(element => {
        const tr = document.createElement('tr');
        for(key in element){
            const td = document.createElement('td');
            td.classList.add('border', 'border-black');
            td.textContent = element[key];
            tr.appendChild(td);
           
        }
        const deleteButton = document.createElement('button');
            deleteButton.classList.add('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deleteField(array[0]);
            });
        tr.appendChild(deleteButton);
        const editButton = document.createElement('button');
            editButton.classList.add('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                editField(array[0], element);
            });
        tr.appendChild(editButton);
        table.appendChild(tr);
    });
    tableDiv.appendChild(table);
    createForm(allKeys);
}

// GET Fields, El findAll básico que busca en la url y path
function getFields($url){
    fetch($url, {
        method: 'GET'
    })
    .then((response) => {
        if (!response.ok) {
            console.log(response);
            throw new Error('Network Error');
        }
        return response.json();
    })
    .then((data) => {
        let array = data;
        let allKeys = checkJSON(array);
        renderFields(array,allKeys);
    })
    .catch((error) => {
        console.log('Fetch error:', error); 
    });
}
//Crear el formulario con las Keys del getFields. 
//Recoge los valores para los label del JSON que me devuelve el GetFields. 

function createForm(allKeys){
    let form = document.getElementById('form');
    form.innerHTML = '';
    console.log("creando el Form");
    allKeys.forEach(element => {
        const label = document.createElement('label');
        label.textContent = element;
        const input = document.createElement('input');
        input.type = 'text';
        input.name = element;
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    })
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Submit';
    form.appendChild(submit);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        addField(data);
    })
    document.body.appendChild(form);
}


// insertar objeto recogido por el formulario de inserción. 
//Le entra un array basado en el formulario con las claves como atributo
// del json y los valores como el valor deseado para introducir
function addField(data) {
    fetch(url + pathToInsert, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Asegúrate de tener el encabezado
        },
        body:
            JSON.stringify(data),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        getFields(url + path);
        return response;
    })
    .then((data) => {
        console.log('agregado:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


//Borrar campo con el id de la fila que queremos borrar
function deleteField(id) {
    fetch(url + pathToDelete + id, {
        method: 'DELETE',
    }).then((data) => {
        console.log(data);
        getFields(url + path);
    }).catch((error) => {
        console.log(error);
    });
}



// ----------------- EDIT ----------------

// le entra el id que queremos editar y el array con el json que queremos editar
function editField(id, data) {

    const form = document.getElementById('formEdit');
    form.innerHTML = '';
    console.log("creando el Form nuevo");

    for (const key in data) {
        const label = document.createElement('label');
        label.textContent =key
        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.value = data[key];
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    }
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Submit';
    form.appendChild(submit);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        updateField(id, data);
        form.innerHTML = '';
    })
    document.body.appendChild(form);
}

// PUT UPDATE DE EDIT
function updateField(id, data) {
    fetch(url + pathToEdit + id, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',  // Asegúrate de tener el encabezado
        },
        body:
            JSON.stringify(data),
    }).then((response) => {
        console.log(response);
        getFields(url + path);
    }).catch((error) => {
        console.log(error);
    });
}