
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
export function createButton(text, id, iconClasses, clickHandler) {
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("formButton");
    button.addEventListener("click", clickHandler);

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
            value: item.value,
            text: item.text
        }));
    });
}

function createSelectElement(field) {
    const container = createElementWithAttributes('div', { class: 'formFieldContainer' });
    container.appendChild(createElementWithAttributes('label', {
        textContent: field.label || field.placeholder,
        htmlFor: field.id
    }));

    const select = createElementWithAttributes('select', {
        id: field.id,
        placeholder: field.placeholder,
        autocomplete: field.autocomplete
    });

    addOptionsToSelect(select, field.options);

    select.value = field.value;
    container.appendChild(select);
    return container;
}

function createInputElement(field) {
    const container = createElementWithAttributes('div', { class: 'formFieldContainer' });
    container.appendChild(createElementWithAttributes('label', {
        textContent: field.label || field.placeholder,
        htmlFor: field.id
    }));
    const input = createElementWithAttributes('input', {
        type: field.type,
        id: field.id,
        placeholder: field.placeholder,
        autocomplete: field.autocomplete,
        value: field.value
    });
    container.appendChild(input);
    return container;
}

export function createForm(containerId, formId, formTitle, inputFields, buttonText, submitHandler) {
    const formContainer = createElementWithAttributes('div', {
        id: containerId,
        class: 'popupForm'
    });

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
    const submitButton = createButton(buttonText, `${formId}SubmitButton`, ['fa-check'], submitHandler);
    const closeBtn = createButton('Close', `${formId}CloseButton`, ['fa-times'], function () {formContainer.remove();});

    buttonContainer.appendChild(submitButton);
    buttonContainer.appendChild(closeBtn);
    
    form.appendChild(errorLabel);
    form.appendChild(buttonContainer);
    
    formContainer.appendChild(form);
    document.body.appendChild(formContainer);
}

export function createAddProjectForm(){
    let form = document.createElement("div");
    form.setAttribute("id", "newProjectForm");
    form.classList.add("popupForm");

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "newProjectName");
    input.setAttribute("placeholder", "Project Name");
    input.classList.add("formInput");

    let createBtn = document.createElement("button");
    createBtn.setAttribute("id", "createProject");
    createBtn.textContent = "Create";
    createBtn.classList.add("formButton");

    let closeBtn = document.createElement("button");
    closeBtn.setAttribute("id", "closeForm");
    closeBtn.textContent = "Close";
    closeBtn.classList.add("formButton");

    let errorLabel = document.createElement('label');
    errorLabel.setAttribute("id", "errorLabel");
    errorLabel.classList.add("errorLabel");

    form.appendChild(input);
    form.appendChild(createBtn);
    form.appendChild(closeBtn);
    form.appendChild(errorLabel);
    document.body.appendChild(form);

    createBtn.addEventListener("click", function(event) {
        let name = document.getElementById("newProjectName").value;
        try{
            addProjectToDatabase(name);
            form.remove();
        }catch(error){
            
        }
        
    });
    closeBtn.addEventListener("click", function() {
        form.remove();
    });   
}

//LAYERS
export function createAddLayerForm(){
    let form = document.createElement("div");
    form.setAttribute("id", "newLayerForm");
    form.classList.add("popupForm");

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "newLayerName");
    input.setAttribute("placeholder", "Layer Name");
    input.classList.add("formInput");

    let createBtn = document.createElement("button");
    createBtn.setAttribute("id", "createLayer");
    createBtn.textContent = "OK";
    createBtn.classList.add("formButton");

    let closeBtn = document.createElement("button");
    closeBtn.setAttribute("id", "closeForm");
    closeBtn.textContent = "Close";
    closeBtn.classList.add("formButton");

    let errorLabel = document.createElement('label');
    errorLabel.setAttribute("id", "errorLabel");
    errorLabel.classList.add("errorLabel");

    form.appendChild(input);
    form.appendChild(createBtn);
    form.appendChild(closeBtn);
    form.appendChild(errorLabel);
    document.body.appendChild(form);

    createBtn.addEventListener("click", function(event) {
        let name = document.getElementById("newLayerName").value;
        try{
            addLayer(name);
            form.remove();
        }catch(error){
            console.error(error);
        }
        
    });
    closeBtn.addEventListener("click", function() {
        form.remove();
    });   
}
//POINTS
//PROPERTIES
