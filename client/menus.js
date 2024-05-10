import {createForm, newPopUpMessage, addOptionsToSelect, createButton} from './popUpForms.js';
import {
    getCurrentLayer,
    setCurrentLayer,
    loadLayers, 
    loginUser, 
    addUser, 
    logoutCurrentUser,
    deleteCurrentUser,
    getCurrentUser,
    addProject,
    deleteProject,
    addLayer,
    selectLayer,
    selectPoint,
    deleteLayer,
    isSelected, 
    unselectPoints,
    getSelectedPoints,
    setSelectedPoints,
    deletePoint,
    getCurrentProject,
    addProperty,
    deleteProperty,
    editPoint,
    addStyleRule
} from './main.js';
import { addPointModeOn, 
    stringifyCoordinates,
    isCtrlPressed,
    stringToCoordinates
} from './mapTools';
import { loadFromDatabase } from './dbAccess.js';


//HTML MISC TOOLS


export function findPropertyInObject(obj, target_property_name) {
    for (const property_name in obj) {
      if (property_name === target_property_name) {
        return obj[property_name];
      }
    }
    return null;
  }

//USERS
export function createUsersMenu(){
    const usersMenuContainer = document.getElementById('usersMenuContainer');
    usersMenuContainer.innerHTML = '';

    const currentUserDisplay = document.createElement('div');
    currentUserDisplay.id = 'currentUserDisplay';
    currentUserDisplay.innerText = "No user Logged In"
    const addUserButton = createButton('Sign Up', 'addUserButton', ["fa-user-plus"],() => {
        createForm('addUserFormContainer', 'addUserForm', 'Add a New User', [
            { type: 'text', id: 'addName', placeholder: 'Name', autocomplete: 'username' },
            { type: 'password', id: 'addPassword', placeholder: 'Password', autocomplete: 'new-password' }
        ], 'Add User', async function (event){
            event.preventDefault();
            let name = document.getElementById('addName').value;
            let password = document.getElementById('addPassword').value;
            try{
                await addUser(name, password);
                document.getElementById('addUserFormContainer').remove();
                newPopUpMessage("Utilizador adiconado com sucesso!", "success");
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });
    });
    const loginUserButton = createButton('Login', 'loginUserButton', ['fa-sign-in-alt'], () => {
        createForm('loginUserFormContainer', 'loginUserForm', 'Log In', [
            { type: 'text', id: 'userName', placeholder: 'user name', autocomplete: 'username' },
            { type: 'password', id: 'userPassword', placeholder: 'password', autocomplete: 'new-password' }
        ], 'Log In', async function (event){
            event.preventDefault();
            let name = document.getElementById('userName').value;
            let password = document.getElementById('userPassword').value;
            try{
                await loginUser(name, password);
                document.getElementById('loginUserFormContainer').remove();
                newPopUpMessage("Bem vindo!", "success");
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });    
    });
    const editUserButton = createButton('Edit User', 'editUserButton', ['fa-user-edit'] ,() => {   
        /*editar utilizador */  
    });
    const deleteUserButton = createButton('Delete Account', 'deleteUserButton', ['fa-trash-alt'], () => {    
        createForm('deleteUserFormContainer', 'deleteUserForm', 'Delete Account?', null, 'Yes, Delete', async function (event){
            event.preventDefault();
            try{
                await deleteCurrentUser();
                document.getElementById('deleteUserFormContainer').remove();
                newPopUpMessage("Utilizador removido com sucesso!", "success");
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });    
    });
    const signoutButton = createButton('Log Out', 'logoutButton', ['fa-sign-out-alt'], () => {
        createForm('logOutUserFormContainer', 'logOutUserForm', 'Log Out ?', null, 'Yes, Log Out', function (event){
            event.preventDefault();
            try{
                getCurrentUser();
                logoutCurrentUser();
                document.getElementById('logOutUserFormContainer').remove();
                newPopUpMessage("Sessão terminada com sucesso!", "success");
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });     
    });
    usersMenuContainer.appendChild(currentUserDisplay);
    usersMenuContainer.appendChild(addUserButton);
    usersMenuContainer.appendChild(loginUserButton);
    usersMenuContainer.appendChild(editUserButton);
    usersMenuContainer.appendChild(deleteUserButton);
    usersMenuContainer.appendChild(signoutButton);
}

//PROJECTS
export function createProjectsMenu() {
    let project_menu = document.getElementById("project_menu");
    
    let projectSelector = document.createElement("select");
    projectSelector.id = "projectSelector";
    
    let loadProjectButton = createButton("Load Project", "loadProjectButton", ['fa-folder-open'],  async () => {
        let project_id = getCurrentProject();
        await loadLayers(project_id);
    });
    let newProjectButton = createButton("New Project", "newProjectButton", ['fa-folder-plus'],  () => {
        createForm("addProjectFormContainer", "addProjectForm", "Add Project", [ 
            { type: 'text', id: 'addProject', placeholder: 'project name', autocomplete: 'project name' }
        ],"Add Project", async function(event){
            event.preventDefault();
            let name = document.getElementById('addProject').value;
            try{
                await addProject(name);
                document.getElementById('addProjectFormContainer').remove();
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        })
    });
    let deleteProjectButton = createButton("Delete Project", "deleteProjectButton", ['fa-trash-alt'], () => {
        let project_id = getCurrentProject();
        if(!project_id) return;
        createForm('deleteProjectFormContainer', 'deleteProjectForm', 'Delete Project?', null, 'Yes, Delete', async function (event){
            event.preventDefault();
            try{
                await deleteProject(project_id);
                document.getElementById('deleteProjectFormContainer').remove();
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });    
    });
    let shareProjectButton = createButton("Share Project", "shareProjectButton", ['fa-share-alt'], () => {});
    project_menu.appendChild(projectSelector);
    project_menu.appendChild(loadProjectButton);
    project_menu.appendChild(newProjectButton);
    project_menu.appendChild(deleteProjectButton);
    project_menu.appendChild(shareProjectButton);
}
export function addProjectSelectorOption(project){
    if (!project) {
        throw new Error('Invalid Project');
    }
    let select = document.getElementById("projectSelector");
    if (!select) {
        throw new Error('Project selector not found');
    }
    let option = document.createElement('option');
    option.value = project.id;
    option.text = project.name;
    select.appendChild(option);
}  
export function deleteProjectSelectorOption(project_id){
    try{
        if (!project_id) {
            throw new Error('Invalid project id');
        }
        let select = document.getElementById("projectSelector");
        if (!select) {
            throw new Error('Project selector not found');
        }
        let option = select.querySelector(`option[value='${project_id}']`);
        if(!option){
            throw new Error('Selector option not found');
        }
        select.removeChild(option);
    }catch(error){
        throw error;
    }
    
}

//LAYERS
export function createLayersMenu(){
    const container = document.getElementById("layerSelectorContainer");
    const addLayerButton = createButton("Add Layer", "addLayerButton", ["fas", "fa-plus", "fa-layer-group"], () => {
        createForm('addLayerFormContainer', 'addLayerForm', 'Add a New Layer', [
            { type: 'text', id: 'addLayer', placeholder: 'Layer', autocomplete: 'layer name' }
        ], 'Add Layer', async function (event){
            event.preventDefault();
            let layer_name = document.getElementById('addLayer').value;
            await addLayer(layer_name);
            document.getElementById('addLayerFormContainer').remove();
        });
    });
    
    const layerSelectorDiv = document.createElement("div");
    layerSelectorDiv.id = "layer_selector";
    container.appendChild(addLayerButton);
    container.appendChild(layerSelectorDiv);
    console.log("layer menu added");
}
export function selectLayerSelectorItem(accordion_item){
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    accordion_item.classList.add('highlighted');
}
export function addLayerSelectorItem(layer) {
    const layerSelectorDiv = document.getElementById('layerSelectorContainer');

    const accordionItemDiv = document.createElement('div');
    accordionItemDiv.classList.add('accordion-item');
    accordionItemDiv.id = "layer-" + layer.id;

    accordionItemDiv.addEventListener('click', () => {
        selectLayer(layer.id);    
    });
    
    const accordionHeaderDiv = document.createElement('div');
    accordionHeaderDiv.classList.add('accordion-header');
    accordionHeaderDiv.classList.add('show');
    changeLayerClickSelectBehavior(accordionHeaderDiv);

    const accordionButtonsDiv = document.createElement('div');
    accordionButtonsDiv.classList.add('accordion-buttons'); 

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = "layer-checkbox-" + layer.id;
    checkboxInput.classList.add('accordion-title');

    const labelForCheckbox = document.createElement('label');
    labelForCheckbox.htmlFor = layer.id;
    labelForCheckbox.classList.add('accordion-label');
    labelForCheckbox.textContent = layer.name;

    const editButton = createButton('', '', ['fa-edit'], () => {});
    editButton.classList.add('accordion-edit-btn');
    //accordionButtonsDiv.appendChild(editButton);

    const deleteButton = createButton('', '', ['fa-trash'], () => {
        createForm('deleteLayerFormContainer', 'deleteLayerForm', 'Delete Layer?', null, 'Yes, Delete', 
        async function (event){
            event.preventDefault();
            try{
                await deleteLayer(layer.id);
                setCurrentLayer(null);
                document.getElementById('deleteLayerFormContainer').remove();
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });     
    });
    deleteButton.classList.add('accordion-delete-btn');
    accordionButtonsDiv.appendChild(deleteButton);

    const accordionContentDiv = document.createElement('div');
    accordionContentDiv.id = "layer-content-" + layer.id;
    accordionContentDiv.classList.add('accordion-content');

    accordionHeaderDiv.appendChild(checkboxInput);
    accordionHeaderDiv.appendChild(labelForCheckbox);
    accordionHeaderDiv.appendChild(accordionButtonsDiv); 
    accordionItemDiv.appendChild(accordionHeaderDiv);
    accordionItemDiv.appendChild(accordionContentDiv);
    layerSelectorDiv.appendChild(accordionItemDiv);
}
export function deleteLayerSelectorItem(id){
    
    const layerSelectorDiv = document.getElementById('layer_selector');
    const accordionItemDiv = document.getElementById('layer-' + id);

    if (accordionItemDiv) {
        layerSelectorDiv.removeChild(accordionItemDiv);
    }
    
}
export function changeLayerClickSelectBehavior(element) {
    element.addEventListener("click", function(event) {
        if (event.target.tagName === 'LABEL') {
            event.preventDefault(); // This will prevent the checkbox from being checked
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                panel.classList.remove('show');
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                panel.classList.add('show');
            }
        }
    });
}
export function unloadLayerSelectorItems(){
    const layerSelectorContainer = document.getElementById('layer_selector');
    if(!layerSelectorContainer) return;
    while (layerSelectorContainer.firstChild) {
        layerSelectorContainer.removeChild(layerSelectorContainer.firstChild);
    }
}

//FEATURES - POINTS
export function selectPointSelectorItem(point_id){
    let point = document.getElementById("point-" + point_id);
    if (!point) throw new Error(`Não foi possivel encontrar point-${point_id}`);
    point.classList.add("point-container-highlighted");
}
export function unselectPointSelectorItem(point_id){
    let point = document.getElementById("point-" + point_id);
    if (!point) throw new Error(`Não foi possivel encontrar point-${point_id}`);
    point.classList.remove("point-container-highlighted");
}
export function createMapToolsMenu() {
    const pointMenu = document.getElementById("point-menu-container");
    pointMenu.classList.add("point-menu");
    const addButton = createButton("Add Point", "add-point-button", ["fa-plus", "fa-map-pin"], () => {
        addPointModeOn(true);
    });
    const measureButton = createButton("Measure Distance", "measure-button", ["fa-ruler"], () => {
      
    });
    pointMenu.append(addButton, measureButton);
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete') {
        let selected_points = getSelectedPoints();
        selected_points.forEach(point_id => deletePoint(point_id));
        unselectPoints();
    }    
});
export function addPointSelectorItem(point_data) {
    
    let layer_content = document.getElementById("layer-content-" + point_data.layer_id);
    const pointContainer = document.createElement('div');
    pointContainer.id = 'point-' + point_data.id;
    pointContainer.classList.add('point-container');

    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-map-marker-alt');
    icon.classList.add('point-icon');

    const nameLabel = document.createElement('div');
    nameLabel.id = "point-label-" + point_data.id
    nameLabel.classList.add('point-label');
    nameLabel.textContent = point_data.name;

    pointContainer.appendChild(icon);
    pointContainer.appendChild(nameLabel);

    pointContainer.addEventListener('mouseenter', () => {
        
    });
    pointContainer.addEventListener('mouseleave', () => {
       
    });
    pointContainer.addEventListener('click', (event) => {
        if(!isCtrlPressed(event)){
            unselectPoints();   
        }
        selectPoint(point_data.id);
    });
    layer_content.appendChild(pointContainer);
}
export function editPointSelectorItem(point_data){
    const point_label = document.getElementById('point-label-' + point_data.id);
    point_label.textContent = point_data.name;
}
export function deletePointSelectorItem(point_id) {
    const pointElement = document.getElementById("point-" + point_id);
    if (pointElement && pointElement.parentNode) {
      pointElement.parentNode.removeChild(pointElement);
    }
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

        row.appendChild(nameCell);
        row.appendChild(valueCell);

        propertyTable.appendChild(row);
    });

    return propertyTable;
}
export function generatePointInputFieldsData(point, property_names){
    let properties = point.getProperties();
    let input_fields = [];
    Object.keys(properties).forEach(property_name => {
        const target_property = property_names.find((name) => name == property_name);
        if(target_property){
            input_fields.push({
                type: 'text',
                id: property_name + "InputField",
                placeholder: property_name,
                autocomplete: 'off',
                value: properties[property_name]
            });
        }
        
    })
    return input_fields;
}
export function generatePropertiesInputFieldsData(properties) {
    const inputFields = [];
    properties.forEach(property => {
        const inputField = {
            type: 'text',
            id: property.name + property.id + "InputField",
            placeholder: property.name,
            autocomplete: 'off',
            value: property.value
        };
        if (Array.isArray(property.options) && property.options.length > 0) {
            inputField.type = 'select';
            inputField.options = property.options.map(option => ({
                value: option,
                text: option
            }));
        }
        inputFields.push(inputField);
    });
    return inputFields;
}
export function getPropertiesFormValues(properties){
    properties.forEach((property) => {
        const input_field_value = document.getElementById(property.name + property.id + "InputField").value;
        if(input_field_value){
            property.value = input_field_value;
        }
    });
    return properties;
}
export function getPointFormValues(point, property_names){
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
export function createEditPointButton(point){
    const properties = point.getProperties();
    const editable_point_properties = ["name", "foto", 'coordinates'];
    const edit_point_button =  createButton('Editar', 'editButton', ['fa-edit'], async function (){ 
        const point_fields_data = generatePointInputFieldsData(point, editable_point_properties );
        const custom_properties_fields_data = generatePropertiesInputFieldsData(properties.custom_properties);
        const input_fields_data = [...point_fields_data, ...custom_properties_fields_data ];
        createForm('editPointFormContainer', 'editPointForm', 'Edit Point', input_fields_data, 'OK', async function (event){
            event.preventDefault(); 
            let updated_point_data = getPointFormValues(point, editable_point_properties );
            let updated_custom_properties = getPropertiesFormValues([...properties.custom_properties]);
            try{
                await editPoint(updated_point_data, updated_custom_properties);
                document.getElementById('editPointFormContainer').remove();
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            } 
        });
    });
    return edit_point_button;
}

// PROPERTIES
function createAddSPropertyForm(){
    let project_id = getCurrentProject();
    if(!project_id) return;
    createForm('addPropertyFormContainer', 'addPropertyForm', 'Add a New Property', [
        { type: 'text', id: 'property_name', placeholder: 'Property Name', autocomplete: 'property name' },
        { type: 'text', id: 'property_values', placeholder: 'Property Values', autocomplete: 'property values' },
        { type: 'text', id: 'property_default_value', placeholder: 'Property Default values', autocomplete: 'property default value' }
    ], 'Add Property', async function (event){
        event.preventDefault();
        let property_name = document.getElementById('property_name').value;
        let property_values = document.getElementById('property_values').value;
        let property_default_value = document.getElementById('property_default_value').value;
        try{
            let new_property = {
                name: property_name,
                values: property_values,
                default_value: property_default_value
            }
            await addProperty(new_property);
            document.getElementById('addPropertyFormContainer').remove();
        }catch(error){
            console.error(error);
            newPopUpMessage(error.message, "error");
        }
    });    
}
async function createDeletePropertyForm(){
    let project_id = getCurrentProject();
    if(!project_id) return;
    let project_properties = await loadFromDatabase("Project Properties", `project_properties/${project_id}`);
    if(!project_properties) throw new Error("not able to load project properties");
    const properties_options = project_properties.map(item => ({
        value: item.id,
        text: item.name
    }));
    createForm('deletePropertyFormContainer',  'deletePropertyForm', 'Delete Property', [
        { type: 'select', id: 'propertySelect', autocomplete: "property ", placeholder:"property", options: properties_options }
    ], 'Delete Property', async function (event){
        event.preventDefault();
        let property_id = parseInt(document.getElementById('propertySelect').value);
        try{
            await deleteProperty(property_id);
            document.getElementById('deletePropertyFormContainer').remove();
        }catch(error){
            console.error(error);
            newPopUpMessage(error.message, "error");
        }
    });  
}
export function createPropertyMenu() {
   const property_menu = document.getElementById("properties_menu");
    const addPropertyButton = createButton("Add Property", "add-property-button", ["fa-plus"], () => {
       createAddSPropertyForm(); 
    });
    const deletePropertyButton = createButton("Delete Property", "delete-property-button", ["fa-trash"], async () => {
       createDeletePropertyForm();
    });
    property_menu.appendChild(addPropertyButton);
    property_menu.appendChild(deletePropertyButton);
}
//STYLES
async function createAddStyleForm(){
    let project_id = getCurrentProject();
    if (!project_id) return;
    let project_properties = await loadFromDatabase("Project Properties", `project_properties/${getCurrentProject()}`);
    if(!project_properties) throw new Error("not able to load project properties");
    const properties_select_options = project_properties.map(property => ({value: property.id, text: property.name}));
    createForm('addStyleFormContainer', 'addStyleForm', 'Add a New Style', [
        
        { type: 'text', id: 'style_name', placeholder: 'Style Name', autocomplete: 'Style name' },
        {type:"section_divider", text:"Condition: "},
        { type: 'select', id: 'condition_property', placeholder: 'Property', autocomplete: 'style condition property', options: properties_select_options },
        { type: 'select', id: 'condition_value', placeholder: 'Value', autocomplete: 'style condition value', options:[]},
        {type:"section_divider", text:"Style Normal: "},
        { type: 'text', id: 'style_normal_font', placeholder: 'Font', autocomplete: 'font'},
        { type: 'text', id: 'style_normal_scale', placeholder: 'Scale', autocomplete: 'scale'},
        { type: 'text', id: 'style_normal_image', placeholder: 'Image', autocomplete: 'image'},
    ], 'Add Style', async function (event){
        event.preventDefault();
        let style_name = document.getElementById('style_name').value;
        let condition_property = document.getElementById('condition_property').value;
        let condition_value = document.getElementById('condition_value').value;
        let style_normal_font = document.getElementById('style_normal_font').value;
        let style_normal_scale = parseInt(document.getElementById('style_normal_scale').value);
        let style_normal_image = document.getElementById('style_normal_image').value;
        try{
            let new_style = {
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
                project_id: getCurrentProject(),
                priority:1
            }
            await addStyleRule(new_style);
            document.getElementById('addStyleFormContainer').remove();
        }catch(error){
            console.error(error);
            newPopUpMessage(error.message, "error");
        }
    });
    const condition_property = document.getElementById('condition_property');
    condition_property.addEventListener("change", (event) => {
        let selected_property = project_properties.find((property) => (property.id == condition_property.value));
        if(!selected_property) throw new Error("Não foi possivel encontrar a propriedade:" + selected_property.name);
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
    const addStyleButton = createButton("Add Style", "add-Style-button", ["fa-plus"], async () => {
        await createAddStyleForm()
    });
    const deleteStyleButton = createButton("Delete Style", "delete-Style-button", ["fa-trash"], async () => {
       
    });
    styles_menu.appendChild(addStyleButton);
    styles_menu.appendChild(deleteStyleButton);
}