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
/*export function createButton(text, id, iconClasses, buttonClasses, onClick) {
    const button = document.createElement('button');
    button.id = id;
    button.innerText = text;
    buttonClasses.forEach(cls => button.classList.add(cls));
    button.addEventListener('click', onClick);
    return button;
}*/
export function addOptionsToSelect(select, data) {
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    data.forEach(item => {
        select.appendChild(createElementWithAttributes('option', {
            value: JSON.stringify(item.value),
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
        autocomplete: field.autocomplete,
        value: field.value
    });
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

export function createDataTablePopup(title, headers, visible_fields, values, actions) {
    const popup = document.createElement('div');
    popup.classList.add('popupForm');
    const header = createElementWithAttributes('h2', { textContent: title });
    popup.appendChild(header);
    
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');
    
    headers.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        theadRow.appendChild(th);
    });
    
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Acciones';
    theadRow.appendChild(actionsTh);
    thead.appendChild(theadRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.id = 'table-body';
    
    values.forEach(value => {
        addRow(tbody, visible_fields, value, actions);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    popup.appendChild(tableContainer);
    
    const buttonsContainer = document.createElement('div');
    const addButton = createButton('Add Row', 'add-button', [], [], async () => {
        const new_object =  await actions.add();
        console.log(new_object);
        addRow(tbody, visible_fields, new_object, actions);
        
    });
    const closeButton = createButton('Close', 'close-button', [], [], () => document.body.removeChild(popup));
    buttonsContainer.append(addButton, closeButton);
    popup.appendChild(buttonsContainer);
    document.body.appendChild(popup);
}

function addRow(tbody, visible_fields, value, actions) {
    console.log(value);
    const row = document.createElement('tr');
    const fields = Object.keys(value);
    fields.forEach(field => {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.textContent = value[field];
        td.addEventListener('blur', (event) => {
            const current_row = event.target.closest('tr');
            const property_data = getRowData(current_row, fields);
            actions.edit(property_data);
        });
        if(!visible_fields.includes(field)){
            td.classList.add("hidden-column");
        }
        row.appendChild(td);
    });
    
    const delete_button = createButton('', '', ['fa-trash'], ["formButton"], function () {
        const row = this.closest('tr');
        const object_data = getRowData(row, fields);
        actions.delete(object_data);
        row.remove();
    });
    
    const actionsTd = document.createElement('td');
    actionsTd.appendChild(delete_button);
    row.appendChild(actionsTd);
    tbody.appendChild(row);
}
function isStringArray(text){
    try {
        const options = JSON.parse(text);
        if (Array.isArray(options)) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}
function getRowData(row, fields) {
    const cells = row.querySelectorAll('td');
    const rowData = {};
    cells.forEach((cell, index) => {
        if (index < fields.length) { 
            rowData[fields[index]] = cell.textContent;
        }
    });
    return rowData;
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

