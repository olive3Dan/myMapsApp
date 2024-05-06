//POP UP MESSAGE SISTEM
//separar o formulario do seu estilo
//SIMPLIFICAR A FUNCAO CREATE FORM
//ATIVAVR os ERROS NOS FORMULARIOS
export function newPopUpMessage(text, type){
    alert(text);
}

export function createElementWithAttributes(tagName, attributes) {
    const element = document.createElement(tagName);
    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key === 'class') {
                // Añadir la clase al elemento
                element.classList.add(attributes[key]);
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

function createSelectElement(field) {
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

function createInputElement(field) {
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
    container.appendChild(input);
    return container;
}

export function createForm(containerId, formId, formTitle, inputFields, buttonText, submitHandler) {
    const formContainer = createElementWithAttributes('div', { id: containerId, class: 'popupForm'});
    const form = createElementWithAttributes('form', { id: formId });
    const title = createElementWithAttributes('h2', { textContent: formTitle });
    form.appendChild(title);
    
    if (inputFields) {
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
    }
    const errorLabel = createElementWithAttributes('p', {
        id: `${formId}Error`,
        class: 'errorLabel'
    });

    const buttonContainer = createElementWithAttributes('div', { class: 'buttonContainer' });
    const submitButton = createButton(buttonText, `${formId}SubmitButton`, ['fa-check'],["formButton"], submitHandler);
    const closeBtn = createButton('Close', `${formId}CloseButton`, ['fa-times'],["formButton"], function () {formContainer.remove();});

    buttonContainer.append(submitButton, closeBtn);
    form.append(errorLabel, buttonContainer);
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