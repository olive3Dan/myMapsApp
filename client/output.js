==> databaseUtils.js <==
//MELHORIAS NA FUNÇÃO load aquando de 404 not found throw an error
export const database = (function(){
    //event listeners
    
    //private variables and functions
    const server_url = "http://localhost:3000/";
    //public interface  
    return{
        load: async function (entity_name, end_point){
            const response = await fetch(server_url + end_point, {
                method: "GET",
                headers: { "Content-Type": "application/json",
                           "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);  
        },
        get: async function (entity_name, end_point, values){
            let request = JSON.stringify(values);
            const response = await fetch(server_url + end_point, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('user')}`    
                },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
           
        },
        add: async function (entity_name, end_point, values){
            let request = JSON.stringify(values);
            const response = await fetch(server_url + end_point, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('user')}`     },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        },
        update: async function (entity_name, end_point, values) {
            let request = JSON.stringify(values);
            
            const response = await fetch(server_url + end_point, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        },
        delete: async function (entity_name, end_point, id ) {
            const response = await fetch(server_url + end_point + id, {
                method: 'DELETE',
                headers: { 
                    "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
            });
            if (response.ok) {
                return response.status;
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        }
    };
})();





==> formUtils.js <==
//POP UP MESSAGE SISTEM
//separar o formulario do seu estilo
//SIMPLIFICAR A FUNCAO CREATE FORM
//ATIVAVR os ERROS NOS FORMULARIOS
import {projects} from './projects.js';
export function newPopUpMessage(text, type){
    alert(text);
}
export function createPropertyTable(custom_properties) {
    const propertyTable = document.createElement('table');
    propertyTable.className = 'property-table';
    custom_properties.forEach(custom_property => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const valueCell = document.createElement('td');

        nameCell.textContent = custom_property.name;
        valueCell.textContent = custom_property.value;

        row.append(nameCell, valueCell);
        propertyTable.appendChild(row);
    });
    return propertyTable;
}
export function createElementWithAttributes(tagName, attributes) {
    const element = document.createElement(tagName);
    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key === 'class') {
                if (Array.isArray(attributes[key])) {
                    attributes[key].forEach(className => element.classList.add(className));
                } else {
                    element.classList.add(attributes[key]);
                }
            } else {
                element[key] = attributes[key];
            }
        }
    }
    return element;
}
export function createButton(text, id, iconClasses, buttonClasses, clickHandler) {
    const button = document.createElement("button");
    button.id = id;
    button.addEventListener("click", clickHandler);
    if (Array.isArray(buttonClasses)){
        buttonClasses.forEach(buttonClass => {
             button.classList.add(buttonClass);
        });
    }
    if (Array.isArray(iconClasses)) {
        iconClasses.forEach(iconClass => {
            const icon = document.createElement("i");
            icon.classList.add("fas", iconClass);
            icon.style.margin = "3px"; // Agrega espacio entre el icono y el texto
            button.appendChild(icon);
        });
    }
    const buttonText = document.createElement("span");
    buttonText.textContent = text;
    button.appendChild(buttonText);
    return button;
}
export function addOptionsToSelect(select, data) {
    if(!select) {
        console.log("NO SELECT", select)
        console.log("TO PUT", data)
    }
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    data.forEach(item => {
        select.appendChild(createElementWithAttributes('option', {
            value: item.value,
            text: item.text
        }));
    });
}
export function createSelectElement(field) {
    const container = createElementWithAttributes('div', { class: 'formFieldContainer' });
    container.appendChild(createElementWithAttributes('label', {
        textContent: field.label,
        htmlFor: field.id
    }));
    const select = createElementWithAttributes('select', {
        id: field.id,
        placeholder: field.placeholder,
        autocomplete: field.autocomplete
    });
    addOptionsToSelect(select, field.options);
    container.appendChild(select);
    return container;
}
export function createInputElement(field) {
    const container = createElementWithAttributes('div', { class: 'formFieldContainer' });
    container.appendChild(createElementWithAttributes('label', {
        textContent: field.label,
        htmlFor: field.id
    }));
    const input = createElementWithAttributes('input', {
        type: field.type,
        id: field.id,
        placeholder: field.placeholder || '',
        autocomplete: field.autocomplete
    });
    if (field.value) input.value = field.value;
    container.appendChild(input);
    return container;
}
export function createForm(containerId, formId, formTitle, inputFields, buttonText, submitHandler) {
    const formContainer = createElementWithAttributes('div', { id: containerId, class: 'popupForm'});
    const form = createElementWithAttributes('form', { id: formId });
    const title = createElementWithAttributes('h2', { textContent: formTitle });
    form.appendChild(title);
    inputFields.forEach(field => {
        if (field.type === 'section_divider') {
            if (field.text) {
                const sectionTitle = createElementWithAttributes('h3', { textContent: field.text });
                form.appendChild(sectionTitle);
            }
            const divider = createElementWithAttributes('hr');
            form.appendChild(divider);
        } else {
            let element;
            if (field.type === 'select') {
                element = createSelectElement(field);
                
            } else {
                element = createInputElement(field);
            }
            form.appendChild(element);
        }
    });
    const buttonContainer = createElementWithAttributes('div', { class: 'buttonContainer' });
    const submitButton = createButton(buttonText, `${formId}SubmitButton`, ['fa-check'],["formButton"], submitHandler);
    const closeBtn = createButton('Close', `${formId}CloseButton`, ['fa-times'],["formButton"], function () {formContainer.remove();});

    buttonContainer.append(submitButton, closeBtn);
    form.append( buttonContainer);
    formContainer.appendChild(form);
    document.body.appendChild(formContainer);
    
}
export function createContextMenu(contextButtonId, menuItems) {
    const contextButton = document.getElementById(contextButtonId);
    let contextMenu = document.getElementById("projects-context-menu");
    if (contextMenu) return;    
    contextMenu = createElementWithAttributes('div', {id: "projects-context-menu",class: "context-menu"});
    const rect = contextButton.getBoundingClientRect();
    contextMenu.style.top = `${rect.bottom}px`;
    contextMenu.style.left = `${rect.left}px`;
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        if (Array.isArray(item.iconClasses)) {
            const icon = document.createElement("i");
            item.iconClasses.forEach(iconClass => {
                icon.classList.add(iconClass);
            });
            icon.style.margin = "10px"; 
            menuItem.appendChild(icon);
        }
        menuItem.innerHTML += item.label;
        menuItem.classList.add('context-menu-item');
        menuItem.addEventListener('click', item.onClick);
        contextMenu.appendChild(menuItem);
    });
    document.body.appendChild(contextMenu);
    function handleOutsideClick(event) {
        if (!contextButton.contains(event.target) && !contextMenu.contains(event.target)) {
            contextMenu.remove();
        }
    }
    document.addEventListener('click', handleOutsideClick);
    
    
    
}

/*
export function createDataTablePopup(title, headers, visible_fields, values, actions) {
    const popup = createElementWithAttributes('div', { class: ["popupForm"] });
    //HEAD
    const header = createElementWithAttributes('h2', { textContent: title });
    popup.appendChild(header);
    const tableContainer = createElementWithAttributes('div', { class: ['table-container'] });
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');
    headers.forEach(field => {
        const th = createElementWithAttributes('th', { textContent: field });
        theadRow.appendChild(th);
    });
    const actionsTh = createElementWithAttributes('th', { textContent: 'Acciones' });
    theadRow.appendChild(actionsTh);
    thead.appendChild(theadRow);
    table.appendChild(thead);
    //BODY
    const tbody = createElementWithAttributes('tbody', { id: 'table-body' });
    values.forEach(value => {
        addRow(tbody, visible_fields, value, actions);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    popup.appendChild(tableContainer);
    const buttonsContainer = document.createElement('div');
    const addButton = createButton('Add Row', 'add-button', [], [], async () => {
        const new_object = await actions.add();
        addRow(tbody, visible_fields, new_object, actions);
    });
    const closeButton = createButton('Close', 'close-button', [], [], () => document.body.removeChild(popup));
    buttonsContainer.append(addButton, closeButton);
    popup.appendChild(buttonsContainer);
    document.body.appendChild(popup);
}

function addRow(tbody, visible_fields, value, actions) {
    const row = document.createElement('tr');
    row.dataset.rowData = JSON.stringify(value); // Store the entire value object

    visible_fields.forEach(field => {
        const td = createElementWithAttributes('td', { contentEditable: true, textContent: value[field] || '' });
        td.dataset.field = field; // Set the custom data attribute
        row.appendChild(td);
    });

    const save_button = createButton('', '', ['fa-floppy-disk'], ["formButton"], async function () {
        const row = this.closest('tr');
        const object_data = getRowData(row);
        object_data.values = object_data.values.split(";");
        await actions.edit(object_data);
        save_button.style.display = 'none';
    });
    save_button.style.display = 'none';
    const delete_button = createButton('', '', ['fa-trash'], ["formButton"], async function () {
        const row = this.closest('tr');
        const object_data = getRowData(row);
        await actions.delete(object_data);
        row.remove();
    });

    const actionsTd = document.createElement('td');
    actionsTd.appendChild(save_button);
    actionsTd.appendChild(delete_button);
    row.appendChild(actionsTd);
    tbody.appendChild(row);

    row.addEventListener('input', function () {
        save_button.style.display = 'inline-block';
    });
}
*/

function createSelectElementForRow(multichoiceConfig, selectedValue) {
    const td = document.createElement('td');
    const select = createElementWithAttributes('select', { 'data-field': multichoiceConfig.field });
    addOptionsToSelect(select, multichoiceConfig.options);
    select.value = selectedValue;
    td.appendChild(select);
    return td;
}

// Function to get row data
function getRowData(row) {
    const data = {};
    row.querySelectorAll('td[data-field]').forEach(cell => {
        const select = cell.querySelector('select');
        data[cell.dataset.field] = select ? select.value : cell.textContent;
    });
    return data;
}

// Function to create a popup for the data table
export function createDataTablePopup(title, headers, visibleFields, multichoiceConfigs, values, actions) {
    const popup = createElementWithAttributes('div', { class: ['popupForm'] });
    const header = createElementWithAttributes('h2', { textContent: title });
    popup.appendChild(header);

    const tableContainer = createElementWithAttributes('div', { class: ['table-container'] });
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');
    headers.forEach(field => {
        const th = createElementWithAttributes('th', { textContent: field });
        theadRow.appendChild(th);
    });
    const actionsTh = createElementWithAttributes('th', { textContent: 'Actions' });
    theadRow.appendChild(actionsTh);
    thead.appendChild(theadRow);
    table.appendChild(thead);
    const tbody = createElementWithAttributes('tbody', { id: 'table-body' });
    values.forEach(value => {
        addRow(tbody, visibleFields, value, actions, multichoiceConfigs);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    popup.appendChild(tableContainer);

    const buttonsContainer = document.createElement('div');
    const addButton = createButton('Add Row', 'add-button', [], [], async () => {
        const newObject = await actions.add();
        addRow(tbody, visibleFields, newObject, actions, multichoiceConfigs);
    });
    const closeButton = createButton('Close', 'close-button', [], [], () => document.body.removeChild(popup));
    buttonsContainer.append(addButton, closeButton);
    popup.appendChild(buttonsContainer);
    document.body.appendChild(popup);
}

// Function to add a row to the table body
function addRow(tbody, visibleFields, value, actions, multichoiceConfigs) {
    const row = document.createElement('tr');
    row.dataset.rowData = JSON.stringify(value);

    visibleFields.forEach(field => {
        const multichoiceConfig = multichoiceConfigs.find(config => config.field === field);
        let cell;
        if (multichoiceConfig) {
            cell = createSelectElementForRow(multichoiceConfig, value[field]);
            cell.querySelector('select').addEventListener('change', function () {
                const dependentConfig = multichoiceConfigs.find(config => config.dependentOn === field);
                console.log("DEPENDENT CONFIG", dependentConfig);
                /*if (dependentConfig) {
                    const dependentSelect = row.querySelector(`select[data-field=${dependentConfig.field}]`);
                    const selectedOption = multichoiceConfig.options.find(option => option.value === this.value);
                    if (selectedOption && selectedOption.dependentOptions) {
                        console.log(`Updating dependent select: ${dependentConfig.field} with options`, selectedOption.dependentOptions);
                        addOptionsToSelect(dependentSelect, selectedOption.dependentOptions);
                    }
                }*/
            });
        } else {
            cell = createElementWithAttributes('td', { contentEditable: true, textContent: value[field] || '' });
        }
        cell.dataset.field = field;
        row.appendChild(cell);
    });

    const saveButton = createButton('', '', ['fa-floppy-disk'], ['formButton'], async function () {
        const rowData = getRowData(row);
        await actions.edit(rowData);
        saveButton.style.display = 'none';
    });
    saveButton.style.display = 'none';
    const deleteButton = createButton('', '', ['fa-trash'], ['formButton'], async function () {
        const rowData = getRowData(row);
        await actions.delete(rowData);
        row.remove();
    });

    const actionsTd = document.createElement('td');
    actionsTd.appendChild(saveButton);
    actionsTd.appendChild(deleteButton);
    row.appendChild(actionsTd);
    tbody.appendChild(row);

    row.addEventListener('input', function () {
        saveButton.style.display = 'inline-block';
    });

    // Initialize dependent selects
    /*
    visibleFields.forEach(field => {
        const config = multichoiceConfigs.find(c => c.field === field);
        if (config && config.dependentOn) {
            const parentValue = value[config.dependentOn];
            if (parentValue) {
                const parentConfig = multichoiceConfigs.find(c => c.field === config.dependentOn);
                const selectedOption = parentConfig.options.find(option => option.value === parentValue);
                if (selectedOption && selectedOption.dependentOptions) {
                    const dependentSelect = row.querySelector(`select[data-field=${config.field}]`);
                    console.log(`Initializing dependent select: ${config.field} with options`, selectedOption.dependentOptions);
                    addOptionsToSelect(dependentSelect, selectedOption.dependentOptions);
                    dependentSelect.value = value[config.field];
                }
            }
        }
    });*/
}

function makePopupDraggable(popup) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    popup.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = popup.offsetLeft;
        initialY = popup.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            popup.style.left = `${initialX + dx}px`;
            popup.style.top = `${initialY + dy}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}



==> index.html <==
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="https://openlayers.org/favicon.ico" />
    <!--estilos para os botões de editar e eliminar camadas-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/ol@7.4.0/dist/ol.js"></script>
    
    <title>Projeto Engenharia Informática</title>
  </head>
  <body>
    <!--USERS-->
    <div id="usersMenuContainer">
    </div>
    <!--PROJECTS-->
      <div id="project-container" class = "project-menu-container">
      </div>
      
     
      
      <!--BASE MAP
      <div id="basemapSelectorContainer">
          <h3>Base Map Selector</h3>
          <select id="baseMapDropDown">
              <option value="map1">Map 1</option>
              <option value="map2">Map 2</option>
              
          </select>
      </div>-->
      
      <!--PROPERTIES-->
      <div id = "properties_menu"></div>
      
      <!--STYLES-->
      <div id = "styles_menu"></div>
    
    <div id="point-menu-container"></div>
    <!--POINTS MENU-->
    
    <div id="map"></div>
    <script type="module" src="./temp.js"></script>
  </body>
</html>


==> main.js <==




==> menus.js <==
import {createForm, newPopUpMessage, addOptionsToSelect, createButton} from './formUtils.js';
import { addPointModeOn} from './mapTools';
import { database } from './databaseUtils.js';
import {projects} from './projects.js';

export function findPropertyInObject(obj, target_property_name) {
    for (const property_name in obj) {
      if (property_name === target_property_name) {
        return obj[property_name];
      }
    }
    return null;
  }

//LAYERS

//FEATURES - POINTS

export function createMapToolsMenu() {
    const pointMenu = document.getElementById("point-menu-container");
    pointMenu.classList.add("point-menu");
    const addButton = createButton("Add Point", "add-point-button", ["fa-plus", "fa-map-pin"],["formButton"], () => {
        addPointModeOn(true);
    });
    const measureButton = createButton("Measure Distance", "measure-button", ["fa-ruler"],["formButton"], () => {
      
    });
    pointMenu.appendChild(addButton);
    pointMenu.appendChild(measureButton);
}

// PROPERTIES

export function createPropertyMenu() {
   const property_menu = document.getElementById("properties_menu");
    const addPropertyButton = createButton("Add Property", "add-property-button", ["fa-plus"],["formButton"], () => {
       createAddSPropertyForm(); 
    });
    const deletePropertyButton = createButton("Delete Property", "delete-property-button", ["fa-trash"],["formButton"], async () => {
       createDeletePropertyForm();
    });
    property_menu.appendChild(addPropertyButton);
    property_menu.appendChild(deletePropertyButton);
}
//STYLES
async function createAddStyleForm(){
    let project_properties = await loadFromDatabase("Project Properties", `project_properties/${projects.getCurrent()}`);
    const properties_select_options = project_properties.map(property => ({value: property.id, text: property.name}));
    createForm('addStyleFormContainer', 'addStyleForm', 'Add a New Style', [
        { type: 'text', id: 'style_name', placeholder: 'Style Name', autocomplete: 'Style name' },
        { type:"section_divider", text:"Condition: "},
        { type: 'select', id: 'condition_property', placeholder: 'Property', autocomplete: 'style condition property', options: properties_select_options },
        { type: 'select', id: 'condition_value', placeholder: 'Value', autocomplete: 'style condition value', options:[]},
        { type:"section_divider", text:"Style Normal: "},
        { type: 'text', id: 'style_normal_font', placeholder: 'Font', autocomplete: 'font'},
        { type: 'text', id: 'style_normal_scale', placeholder: 'Scale', autocomplete: 'scale'},
        { type: 'text', id: 'style_normal_image', placeholder: 'Image', autocomplete: 'image'},
    ], 'Add Style', async function (event){
        event.preventDefault();
        const style_name = document.getElementById('style_name').value;
        const condition_property = document.getElementById('condition_property').value;
        const condition_value = document.getElementById('condition_value').value;
        const style_normal_font = document.getElementById('style_normal_font').value;
        const style_normal_scale = parseInt(document.getElementById('style_normal_scale').value);
        const style_normal_image = document.getElementById('style_normal_image').value;
        const new_style = {
            name: style_name,
            condition: `{ "property_id": "${condition_property}",
                            "value": "${condition_value}"
                        }`,
            value: `{"normal":{ 
                        "img": "${style_normal_image}",
                        "scale": ${style_normal_scale},
                        "font" : "${style_normal_font}"
                                },
                    "highlighted":{ 
                        "img" : "${style_normal_image}",
                        "scale": ${style_normal_scale + 1},
                        "font" : "${style_normal_font}"
                    }}`,
            project_id: projects.getCurrent(),
            priority:1
        }
        await addStyleRule(new_style);
        document.getElementById('addStyleFormContainer').remove();
    });
    const condition_property = document.getElementById('condition_property');
    condition_property.addEventListener("change", (event) => {
        const selected_property = project_properties.find((property) => (property.id == condition_property.value));
        const selected_property_values = JSON.parse(selected_property.values);
        let condition_value = document.getElementById('condition_value');
        if (selected_property_values.length > 0){
            const selected_property_options = selected_property_values.map((option) => ({value:option, text:option}));
            addOptionsToSelect(condition_value, selected_property_options );   
        }else{
            condition_value.type = "text";
        }
    });
}
export function createStylesMenu(){
    const styles_menu = document.getElementById("styles_menu");
    const addStyleButton = createButton("Add Style", "add-Style-button", ["fa-plus"],["formButton"], async () => {
        await createAddStyleForm()
    });
    const deleteStyleButton = createButton("Delete Style", "delete-Style-button", ["fa-trash"],["formButton"], async () => {
       
    });
    styles_menu.appendChild(addStyleButton);
    styles_menu.appendChild(deleteStyleButton);
}

==> projects.js <==
//Como implementar a partilha de projetos entre os utilizadores?
import { createElementWithAttributes, createContextMenu, newPopUpMessage, createForm, createButton } from './formUtils.js';
import {database} from './databaseUtils.js'
export const projects = (function(){
    //private variables and functions
    let current_user = null;
    window.eventBus.on('users:loginUser', (event) => {
        if(current_user) projects.menu.remove();
        projects.menu.create();
        current_user = event.user_id;
    });
    window.eventBus.on('users:logoutUser', (event) => {
        projects.close();
        projects.menu.remove();
        current_user = null;
    });
    let current_project = null;
    const project_container_id = 'project-container';
    let projectDescription = createElementWithAttributes("span", {id:"project-description", innerHTML:"no description", class:"project-description"});
    let projectLabel = createElementWithAttributes("div", {innerHTML:"No Project", id:"project-label"});
    const forms = {
        openProject: async () => {
            let projects_data;
            projects_data = await projects.load(current_user);
            console.log(projects_data)
            let project_select_options = [];
            projects_data.forEach(function(project) {
                project_select_options.push({value: project.id, text: project.name});
            });
            createForm("open-projects-form-container", "open-project-form", "Open Project", [
                {type: 'select', options:project_select_options, id: 'select-project', label:"Select Project", placeholder: 'select a project', autocomplete: 'project name' },
                ],"Open Project", 
                function(event){
                    event.preventDefault();
                    const project_id = document.getElementById('select-project').value;
                    projects.open(project_id);
                    document.getElementById('open-projects-form-container').remove();
                }
            );
        },
        addProject: () => { 
            createForm("add-projects-form-container", "add-project-form", "Add Project", [ 
                { type: 'text', id: 'add-project', placeholder: 'project name', autocomplete: 'project name' }],"Add Project", 
                async function(event){
                    event.preventDefault();
                    let project_name = document.getElementById('add-project').value;
                    const project_id = await projects.add(current_user, project_name);
                    document.getElementById('add-projects-form-container').remove();
                    if(!project_id){
                        newPopUpMessage("Erro ao adicinar projeto");
                        return;
                    }
                    await projects.open(project_id);
                }
            )
        },
        deleteProject: () => {
            createForm('delete-project-form-container', 'delete-project-form', 'Delete Project?', [], 'Yes, Delete', 
                async function (event){
                    event.preventDefault();
                    let project_id = current_project;
                    const deleted_project = await projects.delete(project_id);
                    if(!deleted_project){
                        newPopUpMessage("Impossivel eliminar projeto");
                    }
                    document.getElementById('delete-project-form-container').remove();
                }
            )
        },
        shareProject:() => {}
    };
    const menu = {
        create: () => {
            const project_container = createElementWithAttributes('div', {id: project_container_id, class:'project-container'});
            let projectLabelContainer = createElementWithAttributes("div", {id:"project-label-container"});
            let contextMenuButton = createButton("","projects-context-menu-button", ['fa-bars'], ['context-menu-button'], async () => {
                const menu_items = []
                if(current_user){
                    menu_items.push( { label: 'New Project', iconClasses: ['fa-solid', 'fa-folder-plus'], onClick: () => {projects.forms.addProject()}});
                }   
                if(await projects.load(current_user)){
                    menu_items.push( { label: 'Open Project', iconClasses: ['fa-regular','fa-folder-open'], onClick: () => {projects.forms.openProject()}},);
                }
                if(current_project){
                    menu_items.push(
                        { label: 'Rename Project', iconClasses:['fa-solid','fa-pen-to-square'], onClick: () =>{}},
                        { label: 'Properties', iconClasses:['fa-regular','fa-rectangle-list'], onClick: () => window.eventBus.emit('properties:openPropertiesMenu', {})},
                        { label: 'Delete Project', iconClasses: ['fa-solid', 'fa-trash'], onClick: () => projects.forms.deleteProject(current_project)}
                    );
                }
                createContextMenu('projects-context-menu-button', menu_items);
            }); 
            projectLabelContainer.append(projectLabel, contextMenuButton);
            project_container.append(projectLabelContainer, projectDescription);
            document.body.append(project_container);
            
            
            
        },
        remove: ()=> {
            const projectContainer = document.getElementById(project_container_id);
            
            if (projectContainer) {
                console.log("Container exists:", projectContainer);
                document.body.removeChild(projectContainer);
                console.log("Container removed:", projectContainer);
            } else {
                console.error("Failed to remove: Container does not exist");
            }
        },
    };
    //public interface
    return {
        open: async (project_id) => {
            if(current_project) projects.close();
            
            const project = await database.load("Get Project", `project/${project_id}`);
            current_project = project.id;
            projectLabel.innerHTML = project.name;
            projectDescription.innerHTML = "descrição sumaria do projeto...";
            console.log("OPEN PROJECT ID " + project_id);
            window.eventBus.emit("projects:openProject", {project_id: project_id});
            
        },
        load: async (user_id) => {
            try{
                return await database.load("Projects", `projects/${user_id}`);
            }catch(error){
                return null; 
            }
        },
        close:() => {
            if (!current_project) return;
            current_project = null;
            projectLabel.innerHTML = "NO PROJECT";
            window.eventBus.emit("projects:closeProject",{});
        },
        add: async (user_id, project_name) => {
            if(!project_name) return null;
            let new_project;
            try{
                new_project = await database.add("project", "add_project/", {name: project_name} );
                await database.add("project user association", "associate_project_user/", {project_id: new_project.id, user_id: user_id});
            }catch(error){
                return null;
            }
            window.eventBus.emit("projects:addProject",{project_id: new_project.id});
            return new_project.id;
        },
        edit:()=>{},
        delete: async (project_id) => {
            try{
                await database.delete("project", "delete_project/", project_id); 
            }catch(error){
                return null;
            }
            projects.close();
            window.eventBus.emit("projects:deleteProject",{project_id:project_id});
            return project_id;
        },
        menu: menu,
        forms: forms
    }
})();



==> styles.js <==
import {database} from './databaseUtils.js'
import {addStyleToPointOnMap} from './mapTools.js';
import { createDataTablePopup } from './formUtils.js';

export const styles = (function(){
    let current_project = null;
    window.eventBus.on('projects:openProject', (event) => {
        current_project = event.project_id;
    });
    window.eventBus.on('projects:closeProject', (event) => {
        current_project = null;
    });
    window.eventBus.on('properties:propertiesLoaded', (event)=>{
        styles.load();
    })
    window.eventBus.on('properties:propertyAdded', (event)=>{
        styles.load();
    })
    window.eventBus.on('properties:propertyEdited', (event) => {
        styles.load();
    })
    window.eventBus.on('properties:propertyDeleted', (event)=>{
        styles.load();
    })
    
    const form = {
        add:() => { },
        edit:() => {},
        delete: async() => {},
    }
    const menu = {
       create: async () => {
            const headers = ['Propriedade', 'valor', 'Icon', 'Size', 'Font'];
            const visibleFields = ['property_name', 'property_value', 'icon', 'size', 'font'];
            const multichoiceConfigs = [
                {
                    field: 'property_name',
                    options: [
                        {
                            value: 'situacao',
                            text: 'Situacao',
                            options: [
                                "boa", "ma"
                            ]
                        },
                        {
                            value: 'nivel',
                            text: 'Nivel',
                            dependentOptions: [
                                { value: '1', text: '1' },
                                { value: '2', text: '2' },
                                { value: '3', text: '3' }
                            ]
                        }
                        
                    ]
                },
                {
                    field: 'valor',
                    options: [],
                    dependentOn: 'property_name'
                }
            ];
            const data = [
                { id: 1, name: 'Phone Model X', category: 'Electronics', subcategory: 'Phones' },
                { id: 2, name: 'Laptop Model Y', category: 'Electronics', subcategory: 'Laptops' },
                { id: 3, name: 'Novel A', category: 'Books', subcategory: 'Fiction' },
                { id: 4, name: 'T-shirt B', category: 'Clothing', subcategory: 'Men' }
            ];
            const actions = {
                add: async () => {
                    const newObject = { id: 5, name: 'New Item', category: '', subcategory: '' };
                    return newObject;
                },
                edit: async (objectData) => {
                    console.log('Edit:', objectData);
                },
                delete: async (objectData) => {
                    console.log('Delete:', objectData);
                }
            };
            createDataTablePopup('Estilos', headers, visibleFields, multichoiceConfigs, data, actions);
        }
    }
    return {
        load: async () => {
            let points_styles;
            try {
                console.log("CURRENT_PROJECT: ", current_project);
                points_styles = await database.load('styles', `points_styles/${current_project}`);
                
            } catch (error) {
                console.error('Error loading styles:', error);
                return null  
            }
            for(const point_style of points_styles){
                
                
                addStyleToPointOnMap(point_style);
            }
            console.log('STYLES LOADED:', points_styles);
            return points_styles;
        },
        add: async (property_id, value, icon, size, font) => {
            let new_style;
            let property_style;
            try {
                new_style = await database.add('style', 'add_style/', {icon:icon, size:size, font:font});
                property_style = await database.add('property_style', 'add_property_style/', {property_id:property_id, style_id:new_style.id, value:value });
                console.log('NEW STYLE:', new_style);
                console.log('NEW PROPERTY_STYLE:', property_style);
            } catch (error) {
                console.error('Error adding property_style or style:', error);   
            }
            styles.load();
        },
        edit: async (style_id, property_id, value, icon, size, font) => {
            let updated_style;
            let updated_property_style;
            try {
                updated_style = await database.update('style', `update_style/${style_id}`, {icon:icon, size:size, font:font });
                updated_property_style = await database.update('style', `update_properties_styles/${property_id}/${style_id}`, {value:value});
                console.log('UPDATED STYLE:', updated_style);
                console.log('UPDATED PROPERTY_STYLE:', updated_property_style);
                window.eventBus.emit('styles:editStyle', data);
            } catch (error) {
                console.error('Error editing style:', error);
            }
            styles.load();
        },
        delete: async (property_id, style_id) => {
           try {
                await database.delete('style', `delete_style/${style_id}`, {});
                await database.delete('style', `delete_property_style/${property_id}/${style_id}`, {});
                console.log('DELETED STYLE:', style_id);
                window.eventBus.emit('styles:deleteStyle', data);
            } catch (error) {
                console.error('Error deleting style:', error);
            }
            styles.load();
            
        },
        form: form,
        menu: menu,
    }
})();

==> users.js <==
import {jwtDecode} from 'jwt-decode';
import {createElementWithAttributes, createButton, createForm, newPopUpMessage} from './formUtils.js';
import {database} from './databaseUtils.js';
export const users = (function(){
    const usersMenuContainer = document.getElementById('usersMenuContainer');
    const editUserButton = createButton('Edit User', 'editUserButton', ['fa-user-edit'] ,["formButton"],() => {   
        /*editar utilizador */  
    });
    const deleteUserButton = createButton('Delete Account', 'deleteUserButton', ['fa-trash-alt'],["formButton"], () => {    
        createForm('delete-user-form-container', 'deleteUserForm', 'Delete Account?', [], 'Yes, Delete', 
        async function (event){
            event.preventDefault();
            const delete_status = await users.delete();
            if(!delete_status) {
                newPopUpMessage("Não foi possivel Eliminar o utilizador atual");
                return;
            }
            document.getElementById('delete-user-form-container').remove();
            newPopUpMessage("Utilizador removido com sucesso!", "success");
        });    
    });
    const signoutButton = createButton('Log Out', 'logoutButton', ['fa-sign-out-alt'],["formButton"], () => {
        createForm('logOutUserFormContainer', 'logOutUserForm', 'Log Out ?', [], 'Yes, Log Out', 
        function (event){
            event.preventDefault();
            users.logout();
            document.getElementById('logOutUserFormContainer').remove();  
        });     
    });
    const forms = {
        login: async () => {
            createForm('loginUserFormContainer', 'loginUserForm', 'Log In', [
                { type: 'text', id: 'userName', placeholder:"Username", autocomplete:"username"  },
                { type: 'password', id: 'userPassword', placeholder:"Password", autocomplete:"password"}], 'Log In', 
            async function (event){
                event.preventDefault();
                let name = document.getElementById('userName').value;
                let password = document.getElementById('userPassword').value;
                const user = await users.login(name, password);
                if(!user){
                    newPopUpMessage("Utilizador ou password invalidas!");
                    return;
                }
                document.getElementById('loginUserFormContainer').remove();
            });    
        }
    }
    const menu = {
        create: () => {
            usersMenuContainer.innerHTML = '';
            const currentUserDisplay = createElementWithAttributes('div', {id:'currentUserDisplay', innerText:'No User Logged In'});
            const addUserButton = createButton('Sign Up', 'addUserButton', ["fa-user-plus"],["formButton"],() => {
                createForm('addUserFormContainer', 'addUserForm', 'Add a New User', [
                    { type: 'text', id: 'addName', placeholder: 'Name' },
                    { type: 'password', id: 'addPassword', placeholder: 'Password' }
                ], 'Add User', async function (event){
                    event.preventDefault();
                    let name = document.getElementById('addName').value;
                    let password = document.getElementById('addPassword').value;
                    const new_user = await users.add(name, password);
                    if(!new_user) {
                        newPopUpMessage("Nome e passwor dnão podem ser nulos.");
                        return;
                    }
                    newPopUpMessage(`${name} adicionado com sucesso.`);
                    document.getElementById('addUserFormContainer').remove();
                    users.forms.login();

                });
            });
            const loginUserButton = createButton('Login', 'loginUserButton', ['fa-sign-in-alt'],["formButton"], () => users.forms.login());
            usersMenuContainer.append(currentUserDisplay, addUserButton, loginUserButton);
        }
    }
    //public interface
    return {
        menu:menu,
        forms:forms,
        logout: () => {
            window.eventBus.emit("users:logoutUser", {user_id: users.getCurrent()});
            localStorage.removeItem('user'); 
            document.getElementById("currentUserDisplay").innerText = "No User"; 
            usersMenuContainer.removeChild(editUserButton);
            usersMenuContainer.removeChild(deleteUserButton);
            usersMenuContainer.removeChild(signoutButton);
           
        },
        login: async (name, password) => {
            let user_token = null;
            try{
                user_token = await database.get( "user", "login/", {name:name, password:password});
            }catch(error){
                return null;
            }
            localStorage.setItem('user', user_token);
            window.eventBus.emit('users:loginUser', {user_id: users.getCurrent()}); 
            document.getElementById('currentUserDisplay').innerText = name;
            usersMenuContainer.append(editUserButton, deleteUserButton, signoutButton);
            return users.getCurrent(); 
        },
        add: async (name, password) => {
            if(!(name || password)){
                return null
            }
            const new_user = await database.add("user", "add_user/", {name:name, password: password});
            window.eventBus.emit("users:addUser", {user_id: new_user.id});
            return new_user; 
        },
        edit: (id, name, password) => {
            window.eventBus.emit("users:editUser", {id: id, name:name, password:password}); 
            //depois de editar o utilizador fazer login com o novo nome e password
        },
        delete: async () => {
            const status = await database.delete("User", "delete_user/", users.getCurrent());
            if(!status) return null;
            window.eventBus.emit("users:deleteUser", {id: users.getCurrent()});
            users.logout();
            return status;
        },
        getCurrent: () => {
           return jwtDecode(localStorage.getItem('user')).id;
        }
    }
})();

==> EventBus.js <==
class EventBus {
    constructor() {
      this.events = {};
    }
  
    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }
  
    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  
    emit(event, detail) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(detail));
    }
  }
  window.eventBus = new EventBus();
  export default EventBus;


==> features.js <==

import {database} from './databaseUtils.js'
import { addPointToMap, editPointFromMap, deletePointFromMap, addPropertyToPointOnMap, editPropertyFromPointOnMap} from './mapTools.js';
import { stringifyCoordinates } from './mapTools.js';
import { createElementWithAttributes, createForm } from './formUtils.js';
export const features = (function(){
    let current_project = null;
    let current_layer = null;
    let selected_features = [];
    let default_marker_icon = "https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219";
    
    window.eventBus.on('projects:openProject', (event) => {current_project = event.project_id;});
    window.eventBus.on('projects:closeProject', (event) => {
        current_project = null;
        current_layer = null;
        selected_features = [];
    });
    window.eventBus.on('layers:selectLayer', (event) => {current_layer = event.layer_id;});
    window.eventBus.on('layers:deleteLayer', (event) => { if (event.layer_id == current_layer) current_layer = null;});
    window.eventBus.on('layers:layersLoaded', async (event) => await features.load());
    window.eventBus.on('map:click', async (event) => await features.addPoint(event.coordinates));
    window.eventBus.on('features:deleteFeature', async (event) => await features.delete(event.feature_id));
    window.eventBus.on('features:editFeature',  (event) =>  features.forms.edit(event.feature));
    window.eventBus.on('features:unselectFeature', (event) => features.menu.unselect(event.feature_id));
    window.eventBus.on('features:selectFeature', (event) => features.menu.select(event.feature_id));
    
    function isCtrlPressed(event){
        return event.ctrlKey || event.metaKey;
    }
    function stringToCoordinates(coordinateString) {
        const coordinatesArray = coordinateString.split(',').map(parseFloat);
        return coordinatesArray;
      }
    function generatePointInputFieldsData(point, property_names){
        let properties = point.getProperties();
        let input_fields = [];
        Object.keys(properties).forEach(property_name => {
            const target_property = property_names.find((name) => name == property_name);
            if(target_property){
                input_fields.push({
                    type: 'text',
                    id: target_property + "InputField",
                    placeholder: target_property,
                    autocomplete: 'off',
                    label:target_property,
                    value: properties[target_property]
                });
            }
            
        })
        return input_fields;
    }
    function generatePropertiesInputFieldsData(properties) {
        const inputFields = [];
        properties.forEach(property => {
            const inputField = {
                type: 'text',
                id: property.name + "InputField",
                placeholder: property.name,
                autocomplete: 'off',
                label: property.name,
                value: property.value
            };
    
            if (Array.isArray(property.options) && property.options.length > 0) {
                inputField.type = 'select';
                inputField.options = property.options.map(option => ({
                    value: option,
                    text: option
                }));
                console.log(property.options)
                console.log(property.value)
                if (property.value) {
                    const selectedOption = inputField.options.find(opt => opt.value == property.value);
                    if (selectedOption) {
                        selectedOption.selected = true;
                    }
                }
            }
    
            inputFields.push(inputField);
        });
        return inputFields;
    }
    function getPropertiesFormValues(feature){
        const properties = [ ...feature.getProperties().custom_properties ];
        properties.forEach((property) => {
            const input_field_value = document.getElementById(property.name + "InputField").value;
            if(input_field_value){
                property.value = input_field_value;
            }
        });
        return properties;
    }
    function getPointFormValues(point, property_names){
        const properties = { ...point.getProperties() };
        Object.keys(properties).forEach((property_name) => {
            const target_property = property_names.find((name) => name == property_name);
            if(target_property){
                if (property_name == 'coordinates'){
                    properties[property_name] = stringToCoordinates(document.getElementById(property_name + "InputField").value);
                }else{
                    properties[property_name] = document.getElementById(property_name + "InputField").value;
                } 
            }
        });
        return properties;
    }
    function generateInputFields(feature){
        const properties = feature.getProperties();
        const point_fields_data = generatePointInputFieldsData(feature, ["name", "foto", 'coordinates'] );
        
        const custom_properties_fields_data = generatePropertiesInputFieldsData(properties.custom_properties);
        return [...point_fields_data, ...custom_properties_fields_data ];
    }
    const forms = {
        add: () => { 
            
        },
        delete: () => {
            
        },
        edit: (feature) => {
            const input_fields_data = generateInputFields(feature);
            console.log("EDIT FEATURE: ")
            console.log(feature);
            createForm('editPointFormContainer', 'editPointForm', 'Edit Point', input_fields_data, 'OK', async function (event){
                event.preventDefault(); 
                let updated_point_data = getPointFormValues(feature, ["name", "foto", 'coordinates'] );
                let updated_custom_properties = getPropertiesFormValues(feature);
                await features.edit(updated_point_data, updated_custom_properties);
                document.getElementById('editPointFormContainer').remove();
            });
        },
    };
    const menu = {
        select:(feature_id)=>{
            const feature = document.getElementById("point-" + feature_id);
            if(!feature)return;
            feature.classList.add("point-container-highlighted");
        },
        unselect:(feature_id)=>{
            const feature = document.getElementById("point-" + feature_id);
            if(!feature)return;
            feature.classList.remove("point-container-highlighted");
        },
        delete:(feature_id) => {
            const featureElement = document.getElementById("point-" + feature_id);
            if (featureElement && featureElement.parentNode) {
                featureElement.parentNode.removeChild(featureElement);
            }
           
        },
        add:(feature_data) => {
            let layer_content = document.getElementById("layer-content-" + feature_data.layer_id);
            const pointContainer = createElementWithAttributes('div', {id:'point-' + feature_data.id, class:'point-container'});
            const icon = createElementWithAttributes('i', {class:['fas', 'fa-map-marker-alt', 'point-icon']});
            const nameLabel = createElementWithAttributes('div', {id:"point-label-" + feature_data.id, class:'point-label', textContent:feature_data.name});
            pointContainer.append(icon, nameLabel);
            pointContainer.addEventListener('click', (event) => {
                if(!isCtrlPressed(event)){
                    window.eventBus.emit('features:unselectAll', {});    
                }
                window.eventBus.emit('features:selectFeature', {feature_id:feature_data.id});

            });
            layer_content.appendChild(pointContainer);
            window.eventBus.emit('layers:expandLayer', {panel: layer_content, action:'open'})
    
        },
        edit:(feature_data) => {
            const feature_label = document.getElementById('point-label-' + feature_data.id);
            feature_label.textContent = feature_data.name;
        },
    }
    return {
        load: async () => {
            let features_data;
            try{
                features_data = await database.load("Points", `project_points/${current_project}`)
            }catch(error){
                return null
            }
            for(const feature of features_data){
                features.menu.add(feature);
                addPointToMap(feature);
            }
            window.eventBus.emit('features:featuresLoaded', {});
            return features_data;
        },
        unload:() => {
           
        },
        addPropertiesToFeature: async (properties, feature_id) => {
            properties.forEach(async function (property) {
                await database.add("Point <=> property", `add_point_property_association/${feature_id}`, {property_id: property.id, value:property.default_value});
                addPropertyToPointOnMap(feature_id, {id: property.id, name: property.name, value: property.default_value, options: property.values, default_value: property.default_value});  
            }); 
        },
        addPoint: async (coordinates) => {
            if (!current_layer) return;
            const new_point = {
                lon: coordinates[0], 
                lat: coordinates[1], 
                name: stringifyCoordinates(coordinates), 
                foto: default_marker_icon, 
                layer_id: current_layer
            };
            const point_data = await database.add("point", `add_point/${current_layer}`, new_point);
            features.menu.add(point_data);
            addPointToMap(point_data);
            const project_properties = await database.load("Project Properties", `project_properties/${current_project}`);
            console.log("GET PROJECT PROPERTIES:")
            console.log(project_properties)
            await features.addPropertiesToFeature(project_properties, point_data.id);
            window.eventBus.emit('features:addFeature',{feature_id: point_data.id});
        },
        edit: async (updated_point_data, updated_custom_properties) => {
            await database.update("point", `update_point/${updated_point_data.id}`, updated_point_data);
            editPointFromMap(updated_point_data);
            updated_custom_properties.forEach(async (new_custom_property) => {
                const updated_property = await database.update(
                    "point_properties", 
                    `update_point_property_association/${updated_point_data.id}/${new_custom_property.id}`,
                    {value: new_custom_property.value}
                );
                editPropertyFromPointOnMap(updated_point_data.id, updated_property);
            });
            features.menu.edit(updated_point_data);
            window.eventBus.emit('features:featureEdited',{feature_id: updated_point_data.id});
        },
        delete: async (point_id) => { 
            await database.delete("point", `delete_point/`, point_id);
            deletePointFromMap(point_id);
            features.menu.delete(point_id);
        },
        menu: menu,
        forms: forms
    }
})();

==> layers.js <==

import { createElementWithAttributes, createContextMenu,  createForm, createButton } from './formUtils.js';
import { addLayerToMap, deleteLayerFromMap } from './mapTools.js'
import {database} from './databaseUtils.js'
export const layers = (function(){
    //private variables and functions
    let current_user = null;
    let current_project = null;
    let current_layer = null;
    window.eventBus.on('projects:openProject', async (event) => {
        current_project = event.project_id;
        layers.menu.create();
        const layers_data = await layers.load(event.project_id);
        if(!layers_data) return;
        layers.select(layers_data[0].id);
    });
    window.eventBus.on('projects:closeProject', (event) => {
        layers.unload();
        layers.menu.remove();
        current_project = null;
        current_layer = null;
    });
    window.eventBus.on('layers:expandLayer', (event) => {
        toggleAccordion(event.panel, event.action);
    });
    
    function toggleAccordion(panel, action = 'toggle') {
        if (action === 'open') {
            panel.style.maxHeight = panel.scrollHeight + "px";
            
        } else if (action === 'close') {
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                
            }
        } else if (action === 'toggle') {
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                
            }
        }
    }
    const forms = {
        
        add: () => {
            createForm('add-layer-form-container', 'add-layer-form', 'Add a New Layer', [
                { type: 'text', id: 'addLayer', placeholder: 'Layer', autocomplete: 'layer name' }
            ], 'Add Layer', async function (event){
                event.preventDefault();
                const layer_name = document.getElementById('addLayer').value;
                await layers.add(layer_name);
                document.getElementById('add-layer-form-container').remove();
            });
        },
        edit:()=>{

        },
        delete: (layer_id) => {
            createForm( 'delete-layer-form-container', 'delete-layer-form', 'Delete Layer?', [], 'Yes, Delete', 
            async function (event){
                event.preventDefault();
                await layers.delete(layer_id);
                document.getElementById('delete-layer-form-container').remove();
            }); 
        }
        
    }
    const menu = {
        create: () => {
            const layers_container = createElementWithAttributes('div', {id:'layers-container', innerHTML:'Layers'});
            const addLayerButton = createButton("Add Layer", "add-layer-button", ["fa-plus", "fa-layer-group"],["formButton"], () => layers.forms.add() );
            layers_container.append(addLayerButton); 
            document.body.append(layers_container);   
        },
        remove: ()=> {
            const layers_container = document.getElementById("layers-container");
            if (!layers_container) return;
            layers_container.remove();
            
        },
        select:(layer_id)=>{
            const layer_selector_item = document.getElementById("layer-" + layer_id);
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('highlighted');
            });
            layer_selector_item.classList.add('highlighted');
        },
        delete:(layer_id) => {
            const layer_container = document.getElementById('layers-container');
            const accordion_item = document.getElementById('layer-' + layer_id);
            if (accordion_item) {
                layer_container.removeChild(accordion_item);
            }
        },
        add:(layer_id, layer_name)=>{
            const layer_container = document.getElementById('layers-container');
            const accordion_item = createElementWithAttributes('div', {id:`layer-${layer_id}`, class:'accordion-item'});
            accordion_item.addEventListener('click', () => { layers.select(layer_id)});
            const accordion_header = createElementWithAttributes('div', {class:'accordion-header'});
            
            accordion_header.addEventListener("click", function(event) {
                if (event.target.tagName === 'LABEL') {
                    event.preventDefault(); // This will prevent the checkbox from being checked
                    var panel = this.nextElementSibling;
                    toggleAccordion(panel);
                }
            });
            const accordion_buttons_container = createElementWithAttributes('div', {id: 'accordion-buttons-container', class:'accordion-buttons'});
            const checkbox = createElementWithAttributes('input', {type:'checkbox', id:`layer-checkbox-${layer_id}`, class:'accordion-title'});
            const checkbox_label = createElementWithAttributes('label', {htmlFor: layer_id, class:'accordion-label', textContent: layer_name});
            const deleteButton = createButton('', '', ['fa-trash'],["formButton", 'accordion-delete-btn'], ()=>layers.forms.delete(layer_id));
            accordion_buttons_container.appendChild(deleteButton);
            const accordion_content = createElementWithAttributes('div', {id: `layer-content-${layer_id}`, class:'accordion-content'});
            accordion_header.append(checkbox, checkbox_label, accordion_buttons_container);
            accordion_item.append(accordion_header, accordion_content);
            layer_container.append(accordion_item);
        }
    };
    //public interface
    return {
        select:(layer_id) => {
           layers.menu.select(layer_id);
           current_layer = layer_id;
           eventBus.emit('layers:selectLayer', {layer_id:layer_id});
        },
        open: () => {  
        },
        load: async () => {
            let layers_data 
            try{
                console.log("UNLOAD LAYERS")
                console.log("CURRENT PROJECT " + current_project)
                layers_data = await database.load("Layers", `layers/${current_project}`); 
            }catch(error){
                return null;
            }
            layers_data.forEach(async(layer) => {
                layers.menu.add(layer.id, layer.name);
                addLayerToMap(layer.id);
            });
            window.eventBus.emit('layers:layersLoaded', {});
            return layers_data;
        },
        unload: async () => {
            let layers 
            try{
                console.log("UNLOAD LAYERS")
                console.log("CURRENT PROJECT " + current_project)
                
                layers = await database.load("Layers", `layers/${current_project}`); 
            }catch(error){
                return null;
            }
            for(const layer of layers){
                deleteLayerFromMap(layer.id);
            }
        },
        add: async (layer_name) => {
            if(!current_project) return null
            let new_layer;
            try{
                new_layer = await database.add("layer", `add_layer/${current_project}`, {name: layer_name});
            }catch(error){
                return null;
            }
            layers.menu.add(new_layer.id, new_layer.name);
            addLayerToMap(new_layer.id);
            layers.select(new_layer.id);
            return new_layer.id; 
        },
        edit:() => {},
        delete: async (layer_id) => {
            await database.delete("layer", `delete_layer/`, layer_id);
            deleteLayerFromMap(layer_id);
            layers.menu.delete(layer_id);
            if (layer_id == current_layer) current_layer = null;
            eventBus.emit('layers:deleteLayer', {layer_id:layer_id});
        },
        menu: menu,
        forms: forms
    }
})();

==> mapTools.js <==
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Group as LayerGroup, Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import {Icon, Style, Text, Fill, Stroke} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';
import { Overlay } from 'ol';

import { createButton, createElementWithAttributes, createPropertyTable } from './formUtils.js';
import { findPropertyInObject } from './menus.js';
//MISC
export function stringifyCoordinates(coordinates) {
    const [x, y] = coordinates;
    const latitude = y / 100000;
    const longitude = x / 100000;

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
function isCtrlPressed(event){
    return event.ctrlKey || event.metaKey;
}
//PROJECTS
let map;
const popupOverlay = new Overlay({
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
const project_group = new LayerGroup({
    layers: [],
    title: 'Project Layers'
});
const default_point_style_data = {
   normal: {icon:"./icons/red-dot.png", size: 1.5, font:"14px sans-serif"},
   highlighted:{icon:"./icons/yellow-dot.png", size: 1.75, font:"14px sans-serif"}
}
let adding_point_mode = false;
let selected_features = [];
//PROJECTS
window.eventBus.on('projects:closeProject', () => {
    popupOverlay.setElement(null);
});
//LAYERS
window.eventBus.on('layers:loadLayer', (event) => addLayerToMap(event.layer_id));
//FEATURES
window.eventBus.on('features:unselectAll', () => unselectAll());
window.eventBus.on('features:selectFeature', (event) => selectPointOnMap(event.feature_id));

//PROPERTIES
window.eventBus.on('properties:addProperty', (event) => {
    
});
//STYLES
document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete') {
        selected_features.forEach( feature_id => { 
            window.eventBus.emit('features:deleteFeature', {feature_id: feature_id})
        })
        unselectAll();
    }    
});

//MAPS
const base_maps = new LayerGroup({
    layers: [
      new TileLayer({
        source: new OSM(),
        title: 'Open Street Maps'
      }),
      // Otras capas aquí utilizar um base layer switcher

    ],
    title: 'Base Maps'
  });
export function changeMapCursor(cursor){
    map.getTargetElement().style.cursor = cursor;
} 
export function newMap(){
    map = new Map({
        target: 'map',
        layers: [base_maps],
        view: new View({
            center: fromLonLat([-8.61099, 41.14961]), // Coordenadas de Portugal
            zoom: 8
        })
    });
    map.addOverlay(popupOverlay);
    map.on('click', async function(event){
        if (adding_point_mode) {
            window.eventBus.emit('map:click', {coordinates:event.coordinate});
            addPointModeOff();
            return;  
        }
        let hovered_feature = getHoveredFeature(event);
        if (!hovered_feature) {
            unselectAll();
            popupOverlay.setElement(null);
            return;   
        }
        if (!isCtrlPressed(event.originalEvent)) {
            unselectAll();
            showPointProperties(hovered_feature.get('id'));
        }else{
            popupOverlay.setElement(null);
        }
        selectPointOnMap(hovered_feature.get('id'));
        window.eventBus.emit('features:selectFeature', {feature_id:hovered_feature.get('id')})
    });
    map.on('pointermove', function (event) {
        if(adding_point_mode) return;
        let hovered_feature = getHoveredFeature(event);
        if(hovered_feature){
            changeMapCursor("pointer");
        }else{
            changeMapCursor("");
        }
    });      
}
export function addBaseMap(title, base_map){
    const newTileLayer = new TileLayer({
        source: base_map,
        title: title
    });
    base_maps.getLayers().push(newTileLayer);
}
export function deleteBaseMap(title){
    const layersInsideGroup = base_maps.getLayers().getArray();
    const layerToRemove = layersInsideGroup.find(layer => layer.get('title') === title);
    if (layerToRemove) {
        base_maps.getLayers().remove(layerToRemove);
    } 
}

//LAYERS
export function addLayerToMap(layer_id) {
    const newVectorLayer = new VectorLayer({
        source: new VectorSource(),
    });
    newVectorLayer.set('id', layer_id);
    map.addLayer(newVectorLayer);
    console.log("ADD LAYER : " + layer_id + " TO MAP");
    return newVectorLayer;
}
export function editLayerFromMap(layer_id){
}
export function deleteLayerFromMap(layer_id){
    console.log("DELETE LAYER :" + layer_id + " FROM MAP"); 
    const layer = getLayerFromMap(layer_id);
    if (!layer) throw new Error("Layer not found");
    map.getLayers().remove(layer);
    if(popupOverlay) popupOverlay.setElement(null);  
}
function getLayerFromMap(layer_id) {
    const layers = map.getLayers().getArray();
    const targetLayer = layers.find(layer => !(layer instanceof LayerGroup) && (layer.get('id') == layer_id )); 
    return targetLayer;
}

//POINTS
function getHoveredFeature(event){
    const pixel = map.getEventPixel(event.originalEvent);
    const features = map.getFeaturesAtPixel(pixel);
    if(features.length > 0) return features[0];
    return null;
}
export function forEachFeature(callback) {
    const layers = map.getLayers().getArray();
    for (const layer of layers) {
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        features.forEach(callback);
    }
}
export function addPointModeOn(){
    adding_point_mode = true;
    changeMapCursor('crosshair');
}
export function addPointModeOff(value){
    adding_point_mode = false;
    changeMapCursor('default');
}
export function getPointsFromMap() {
    const layers = map.getLayers().getArray();
    let points = [];
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        points = [...points, ...layer.getSource().getFeatures()];
    }
    return points;
}
export function getPointFromMap(point_id) {
    const layers = map.getLayers().getArray();
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        const point = features.find(feature => feature.get('id') == point_id);
        if (point) return point;
    }
    return null;      
}
function setPointStateOnMap(point, state){
    let style_label = point.get('style_' + state).clone();
    style_label.getText().setText(point.get('name'));
    point.setStyle(style_label);
}
function setPointLabel(point, new_label) {
    const style_with_new_label = point.getStyle().clone();
    style_with_new_label.getText().setText(new_label);
    point.setStyle(style_with_new_label);
}
export function newPoint(point_data){
    let new_point = new Feature({
        id: point_data.id,
        name: point_data.name,
        coordinates:point_data.coordinates,
        foto:point_data.foto, 
        layer_id: point_data.layer_id,
        geometry: new Point(point_data.coordinates),
        style_normal: newPointStyle(default_point_style_data.normal),
        style_highlighted: newPointStyle(default_point_style_data.highlighted),
        custom_properties:[]    
    });

    return new_point;
}
export function addPointToMap(point_data) {
    const layer = getLayerFromMap(point_data.layer_id);
    if (!layer) throw new Error('Camada não encontrada');
    let new_point = newPoint(point_data);
    layer.getSource().addFeature(new_point);
    console.log("ADD POINT: " + new_point.get('name') + " LAYER: " + point_data.layer_id );
    return new_point;    
}
export function deletePointFromMap(point_id) {
    let point = getPointFromMap(point_id);
    if (!point) throw new Error('Ponto não encontrado');
    let layer = getLayerFromMap(point.get('layer_id'));
    if (!layer) throw new Error('Camada não encontrada');
    layer.getSource().removeFeature(point);
    console.log("DELETE POINT :" + point_id + "FROM MAP");
}
export function editPointFromMap(new_point_data){
    let point = getPointFromMap(new_point_data.id);
    let properties = point.getProperties();
    Object.keys(properties).forEach((property) => {
        let target_property_value = findPropertyInObject(new_point_data, property);
        if (target_property_value) {
            point.set(property, target_property_value );
        }
    });
    point.set('geometry', new Point(new_point_data.coordinates));
    setPointLabel(point, new_point_data.name);
    console.log("edit POINT :" + new_point_data.id + " fROM MAP");
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(new_point_data.id);
    }   

}
function unselectAll(){
    selected_features.forEach((id)=>{
        window.eventBus.emit('features:unselectFeature', {feature_id: id});
        unselectPointOnMap(id);
    });
    selected_features = [];
}
function isSelected(feature_id) {
    return selected_features.includes(feature_id);
}
function selectPointOnMap(feature_id){
    if(selected_features.includes(feature_id)) return;
    selected_features.push(feature_id);
    let point = getPointFromMap(feature_id);
    setPointStateOnMap(point, 'highlighted');
}
export function unselectPointOnMap(point_id){
    let point = getPointFromMap(point_id);
    setPointStateOnMap(point,'normal');
    popupOverlay.setElement(null);
}



//PROPERTIES
export function showPointProperties(point_id) {
    popupOverlay.setElement(null);
    const point = getPointFromMap(point_id);
    if (!point) throw new Error("Ponto invalido");
    const popupElement = createElementWithAttributes('div', {class:'feature-popup'});
    const pointNameHeader = createElementWithAttributes('h2', {textContent: point.get('name')});
    const imgElement = createElementWithAttributes('img', {src:point.get('foto'), width:200, height:100});
    const propertyTable = createPropertyTable(point.getProperties().custom_properties);
    const coordinatesFooter = createElementWithAttributes('div', {class: 'footer', innerHTML:`<i class="fa-solid fa-location-pin"></i>   ${stringifyCoordinates(point.get('coordinates'))}`});
    const editButton = createButton('Edit', 'edit-button', ['fa-edit'], ["formButton"], () => window.eventBus.emit('features:editFeature', {feature:point}));
    const delete_button = createButton('Delete', 'delete-button', ['fa-trash'], ["formButton"], () => {
        unselectAll();
        window.eventBus.emit('features:deleteFeature', {feature_id:point_id});
        popupOverlay.setElement(null);
    });
    const arrowElement = createElementWithAttributes('div', {class:'feature-popup-arrow'});
    popupElement.append(pointNameHeader, imgElement, propertyTable, coordinatesFooter, editButton, delete_button, arrowElement);
    
    document.body.appendChild(popupElement)
    const popupSize = popupElement.getBoundingClientRect();
    const offsetX = -popupSize.width / 2;
    const offsetY = -popupSize.height + 20; 

    document.body.removeChild(popupElement); 
    popupOverlay.setElement(popupElement);
    //popupOverlay.setOffset([offsetX, offsetY]);
    popupOverlay.setPosition(point.get('coordinates'));

}
export function addPropertyToPointOnMap(point_id, point_property) {
    console.log("ADD PROPERTY: "+point_property.id+" TO POINT: "+point_id)
    console.log(point_property);
    const point = getPointFromMap(point_id);
    point.get('custom_properties').push(point_property);
    if (isSelected(point_id)){
        showPointProperties(point_id);
    }
}
export function deletePropertyFromPointOnMap(point_id, property_id) {
    let point = getPointFromMap(point_id);
    let custom_properties = point.getProperties().custom_properties;
    point.set('custom_properties', custom_properties.filter(property => property.id != property_id));
    if (isSelected(point_id)){
        showPointProperties(point_id);
    }
    console.log("DELETE PROPERTY: " +property_id+ " FROM POINT: " + point_id);
}
export function editPropertyFromPointOnMap(point_id, new_property_data) {
    console.log("EDIT PROPERTY: " +new_property_data.property_id+ " FROM POINT: " + point_id);
    console.log(new_property_data);
    const point = getPointFromMap(point_id);
    const custom_properties = point.getProperties().custom_properties;
    const updatedProperties = custom_properties.map(prop => {
        if (prop.id === new_property_data.id) {
            if(!prop.value || !new_property_data.values.includes(prop.value)){
                prop.value = new_property_data.default_value;
            }
            return new_property_data;
        }
        return prop;
    });
    point.set('custom_properties', updatedProperties);
    if (isSelected(point_id)) {
        showPointProperties(point_id);
    }
}
function removePropertyFromPoint(point, property_id) {
    
}

export function addPropertyToMap(new_property){
    forEachFeature(point => {
        addPropertyToPointOnMap(point.get('id'), new_property);
    });    
}
export function editPropertyFromMap(property_data) {
    console.log("EDIT PROPERTY: " + property_data.id + " FROM MAP")
    forEachFeature(point => {
        editPropertyFromPointOnMap(point.get('id'), property_data);
    });
}
export function deletePropertyFromMap(property_id) {
    forEachFeature(point => {
        deletePropertyFromPointOnMap(point.get('id'), property_id);
    });
}

//STYLES
function newPointStyle(style_data) {
    const style = {
        image: new Icon({
            src: style_data.icon,
            anchor: [0.5, 1],
            scale: style_data.size,
        }),
        text: new Text({
            font: style_data.font,
            offsetX: 0, 
            offsetY: (-40 * style_data.size),  
            fill: new Fill({
                color: '#000',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 3,
            }),
        }),
    };
    return new Style(style);
    
}
function setPointStyle(point_id, style){
    const point = getPointFromMap(point_id);
    const style_highlighted = {
        ...style,
        size: style.size * 1.5
    };
    point.set('style_normal',  newPointStyle(style));
    point.set('style_highlighted',  newPointStyle(style_highlighted));
    if(isSelected(point.get('id'))){
        setPointStateOnMap(point, 'highlighted');
    }
    setPointStateOnMap(point, 'normal');
}
export  function addStyleToPointOnMap(point_style){
    
    if(!point_style.style_id){
        deleteStyleFromPointOnMap(point_style.point_id)
        return;
    }
    setPointStyle(point_style.point_id, point_style);
    console.log("ADD STYLE: ", point_style);
}

export function editStyleOnMap(point_id, style){
    console.log("RULE: " + style.style_id + "POINT: " + point_id);
   
}
export function deleteStyleFromPointOnMap(point_id){
    console.log("DELETE STYLE FROM POINT: " + point_id);
    setPointStyle(point_id, default_point_style_data.normal)
    
}



function getIconDimensions(iconPath) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = iconPath;

        image.onload = () => {
            const dimensions = {
                width: image.width,
                height: image.height,
            };
            resolve(dimensions);
        };

        image.onerror = () => {
            reject(new Error("No se pudo cargar la imagen"));
        };
    });
}


==> properties.js <==
import {database} from './databaseUtils.js'
import { createForm, createDataTablePopup, newPopUpMessage } from './formUtils.js';
import { addPropertyToPointOnMap, deletePropertyFromMap, addPropertyToMap, editPropertyFromMap } from './mapTools.js';

export const properties = (function(){
    let current_project = null;
    window.eventBus.on('projects:openProject', (event) => {
        current_project = event.project_id;
    });
    window.eventBus.on('projects:closeProject', (event) => {
        current_project = null;
    });
    window.eventBus.on('properties:openPropertiesMenu', () => properties.menu.create());
    window.eventBus.on('features:featuresLoaded', async () => {
        await properties.load()
    });
    
    function substituteString(originalString, searchString, replacementString) {
        if (!originalString) return "";
        return originalString.split(searchString).join(replacementString);
    }
    const form = {
        add:() => {
            createForm('addPropertyFormContainer', 'addPropertyForm', 'New Property', [
                { type: 'text', id: 'property_name', placeholder: 'Property Name', autocomplete: 'property name' },
                { type: 'text', id: 'property_values', placeholder: 'value1, value2, value3', autocomplete: 'property values' },
                { type: 'text', id: 'property_default_value', placeholder: 'default value', autocomplete: 'property default value' }
            ], 'Add Property', async function (event){
                event.preventDefault();
                const property_name = document.getElementById('property_name').value;
                const property_values = document.getElementById('property_values').value.split(',').toString();
                const property_default_value = document.getElementById('property_default_value').value;
                const new_property = {
                    name: property_name,
                    values: property_values,
                    default_value: property_default_value
                }
                await properties.add(new_property);
                document.getElementById('addPropertyFormContainer').remove();
            });    
        },
        edit:() => {},
        delete: async() => {
            const project_properties = await database.load("Project Properties", `project_properties/${current_project}`);
            const properties_options = project_properties.map(item => ({
                value: item.id,
                text: item.name
            }));
            createForm('deletePropertyFormContainer',  'deletePropertyForm', 'Delete Property', [
                { type: 'select', id: 'propertySelect', autocomplete: "property ", placeholder:"property", options: properties_options }
            ], 'Delete Property', async function (event){
                event.preventDefault();
                const property_id = parseInt(document.getElementById('propertySelect').value);
                await properties.delete(property_id);
                document.getElementById('deletePropertyFormContainer').remove();
                
            });  
        },
    }
    const menu = {
        create: async() => {
            const project_properties = await database.load("Project Properties", `project_properties/${current_project}`);
            const actions = {
                add: async () => {
                    try{
                        return  await properties.add("", [], "", current_project);
                    }catch(error){
                        throw error;
                    }
                }, 
                edit:  async (property) => {
                    console.log("BEFORE EDIT PROPERTY: ", property.values);
                    await properties.edit(property.id, property.name, property.values, property.default_value);
                }, 
                delete:  async (property_data) => await properties.delete(property_data.id)
            };
            createDataTablePopup(
                "Project Properties", 
                ['Id','Name', 'Values', 'Default Value'], 
                ['id', 'name', 'values', 'default_value'],
                [],
                project_properties,
                actions
            );
        }
    }
    return {
        load: async() => {
            console.log("LOAD PROPERTIES:")
            let points_properties;
            try{
                points_properties = await database.load("Point Properties", `points_properties_associations/${current_project}`);
            }catch(error){
                return null
            }
            points_properties.forEach((pp) => {
                addPropertyToPointOnMap(pp.point_id,{
                    id: pp.property_id,
                    name: pp.property_name,
                    value: pp.property_value,
                    options: pp.property_values,
                    default_value: pp.property_default_value
                });
            });
            window.eventBus.emit('properties:propertiesLoaded', {})
            return points_properties;
        },
        add: async (name, values, default_value, project_id) => {
            console.log("ADD PROPERTY:")
            const new_property_data = {
                name: name,
                values: values,
                default_value: default_value,
                project_id:current_project
            }
            const property = await database.add("Property", `add_property/${project_id}`, new_property_data);
            await database.add("Point <=> property ", `add_project_property_association/${project_id}`, {property_id: property.id, value:property.default_value});
            addPropertyToMap(property);
            window.eventBus.emit('properties:propertyAdded', {});
            return property;
        },
        edit: async (id, name, values, default_value) => {
            console.log("EDIT PROPERTY:")
            const updated_property_data = {
                id:id,
                name: name,
                values: values,
                default_value: default_value,
            }
            let updated_property = await database.update("Property", `update_property/${updated_property_data.id}`, updated_property_data );
            editPropertyFromMap(updated_property);
            window.eventBus.emit('properties:propertyEdited', {});
            return updated_property;
            
        },
        delete: async (property_id) => {
            await database.delete("Property", `delete_property/`, property_id);
            deletePropertyFromMap(property_id); 
            window.eventBus.emit('properties:propertyDeleted', {});
        },
        form: form,
        menu: menu,
    }    
})();

==> style.css <==
@import "node_modules/ol/ol.css";

html,
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width:100%;
  overflow: hidden;
  font-family:Verdana, Geneva, Tahoma, sans-serif;
}
.hidden-column {
  display: none;
}
#map {
  flex-grow: 1;
  /* Adjust height to occupy the remaining space */
  width: 100%;
  height: 100%;
  /* Remove position, top, and left properties */
}

/* USERS */
#currentUserDisplay {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

#currentUserDisplay::before {
  content: "\f007"; /* Icono de usuario de Font Awesome */
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 24px;
  margin-right: 10px;
}
#usersMenuContainer {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(226, 226, 226, 0.8);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 1000; /* Ajusta este valor según sea necesario */
}

#usersMenuContainer a {
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  background: #007BFF;
  color: white;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

#usersMenuContainer a:hover {
  background: #0056b3;
}

#logoutButton {
  margin-top: 20px;
  background: #ff0000;
}

#logoutButton:hover {
  background: #b30000;
}
#currentUserDisplay {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
/*PROJECTS*/
#project-container{
  position: fixed;
  top: 10px;
  left: 10px;
  width:250px;
  background: rgba(220, 219, 219, 0.8);
  padding: 15px;
  border-radius: 0px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000; 
}
#projectLabelContainer {
  width:250px;
  
}

#project-label {
  display: inline-block;
  font-size: 34px;
  color: #333;
}

.project-description {
  font-size: 16px;
  font-style: italic;
  color: #666;
}

  
/*CONTEXT MENU*/
.context-menu-button {
  position: relative; 
  right: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 30px;
  color: #333;
}
.context-menu-button:hover{
  background-color: #f0f0f0;
}
.context-menu {
  position: fixed;
  background: rgba(220, 219, 219, 0.8);
  border-radius: 0px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction:column;
  align-items: flex-start;
  z-index: 1000;
  width:200px;
}
.context-menu-item {
  cursor: pointer;
  width: 195px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left:5px;
  
}
.context-menu-item:hover {
  background-color: #f0f0f0;
}
/*FEATURE POP UP*/
.feature-popup {
  position: relative; /* Relative as it's inside an OpenLayers overlay */
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 100%; /* Prevents overflow beyond screen width */
  width: auto; /* Allows width to adjust based on content */
  height: auto; /* Allows height to adjust based on content */
  z-index: 1000;
}

.feature-popup h2 {
  margin-top: 0;
}

.feature-popup .footer {
  margin-top: 10px;
}

.feature-popup img {
  max-width: 100%; /* Ensures the image does not overflow */
  height: auto;
  display: block;
  margin-bottom: 10px;
}

.feature-popup-arrow {
  position: absolute;
  bottom: -10px; /* Positioned below the feature-popup */
  left: 50%;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white; /* Arrow color same as feature-popup background */
  transform: translateX(-50%);
}
/*LAYERS */
#layers-container{
  position: fixed;
  top: 300px;
  left: 10px;
  width:250px;
  
  background: rgba(220, 219, 219, 0.8);
  
  border-radius: 0px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000; 
}
/*DATA TABLE*/
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  border: 1px solid #000;
  background: #fff;
  padding: 10px;
  z-index: 1000;
  cursor: move;
}
.table-container {
  max-height: 400px;
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid #000;
}
th, td {
  padding: 8px;
  text-align: left;
}
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.buttons button {
  margin: 0 5px;
}
/* popUpForms */

.popupForm input[type="text"],
.popupForm input[type="password"] {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
}
.popupForm button {
  margin: 10px 0;
  padding: 10px;
  border: 20px;
  border-radius: 5px;
  background: #007BFF;
  color: white;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.popupForm button:hover {
  background: #0056b3;
}
.popupForm label.errorLabel {
  color: #ff0000;
  display: block;
  margin-top: 10px;
}
.popupForm {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.popupForm input {
  margin: 10px 0;
  padding: 5px;
  width: 80%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.formButton {
  margin: 5px;
  padding: 10px;
  border: 10px;
  border-radius: 5px;
  background: #007BFF;
  color: white;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}
.formButton:hover {
  background: #0056b3;
}

.popupForm select {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  font-size: 16px; 
}
  .popup h2 {
    margin-top: 0;
}

.popupForm .footer {
    margin-top: 10px;
}

/*LAYERS ACCORDION*/
.accordion {
  width: 100%;
  border: 1px solid #dcdcdc;
}
.accordion-item {
  margin-top: 10px;
  margin-bottom: 10px;
  border-left: transparent 4px solid;
  transition: border-left-color 0.3s;
  cursor: pointer;
}
.accordion-item:hover {
  border-left-color: rgb(251, 250, 250);
  
}
.accordion-item.highlighted {
  border-left-color: #007BFF;
}
.accordion-header {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.accordion-header label {
  display: flex;
  cursor: pointer;
}

.accordion-title {
  width: auto;
  padding: 10px;
  text-align: left;
}
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 0 10px;
}

.accordion-buttons {
  margin-left: auto; /* Alinea los botones a la derecha */
}
.accordion-delete-btn {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 0px;
  margin-left: auto;
}
.accordion-delete-btn:hover {
  background-color: #c82333;
}
#addLayerButton {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px; /* Agregar un espacio de separación desde arriba */
}
#addLayerButton:hover {
  background-color: #218838;
}
/*POINTS*/
.point-menu {
  position: absolute; 
  top: 10px; 
  left: 30%; 
  background-color: rgba(220, 219, 219, 0.8);
  border: 1px solid #ccc; 
  padding: 10px; 
  z-index: 1000; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}
.point-container {
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
}
.point-container:hover {
  background-color: #faf8f8;
}
.point-container-highlighted{
  background-color: #faf8f8;
}
.point-icon {
  margin-right: 5px;
  color: #e74c3c;
}
.point-label {
  font-size: 14px;
}
/*PROPERTIES*/
.popup {
  position: relative;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: auto;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
}

.popup h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.popup table.property-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.popup table.property-table td {
  padding: 6px 10px;
  border: 1px solid #ccc;
}

.popup .footer {
  margin-top: 10px;
  border-top: 1px solid #ccc;
  padding-top: 5px;
  font-style: italic;
  font-size: 12px;
}

.popup::before {
  content: '';
  position: absolute;
  top: -20px; /* Ajusta la posición vertical según sea necesario */
  left: calc(50% - 10px); /* Ajusta la posición horizontal según sea necesario */
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #fff; /* Color del triángulo */
}

.popup::before {
  content: '';
  position: absolute;
  top: -16px;
  left: calc(50% - 8px);
  border-width: 8px;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}
.popup img {
  max-width: 100%; 
  height: auto; 
  display: block; 
  margin: 0 auto; 
}

==> temp.js <==
import './EventBus'
import './style.css';
import { createMapToolsMenu} from './menus';
import {newMap} from './mapTools';
import {users} from './users';
import {layers} from './layers';
import {features} from './features';
import{properties} from './properties';
import {database} from './databaseUtils';
import {styles} from './styles';

document.addEventListener('DOMContentLoaded', async () => {
  newMap();
  createMapToolsMenu();
  users.menu.create();
  users.login("Daniel", "daniel");
  styles.menu.create();
});


