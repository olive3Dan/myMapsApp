import {createForm, newPopUpMessage, addOptionsToSelect, createButton, createElementWithAttributes} from './formUtils.js';
import {
    getCurrentLayer,
    setCurrentLayer,
    loadLayers, 
    addLayer,
    selectLayer,
    selectPoint,
    deleteLayer,
    isSelected, 
    unselectPoints,
    getSelectedPoints,
    setSelectedPoints,
    deletePoint,
    
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
import { database } from './databaseUtils.js';
import {projects} from './projects.js';


//HTML MISC TOOLS


export function findPropertyInObject(obj, target_property_name) {
    for (const property_name in obj) {
      if (property_name === target_property_name) {
        return obj[property_name];
      }
    }
    return null;
  }


//LAYERS
export function createLayersMenu(){
    const layers_container = createElementWithAttributes('div', {id:'layers-container', innerHTML:'Layers'});
    const addLayerButton = createButton("Add Layer", "addLayerButton", ["fas", "fa-plus", "fa-layer-group"],["formButton"], () => {
        createForm('addLayerFormContainer', 'addLayerForm', 'Add a New Layer', [
            { type: 'text', id: 'addLayer', placeholder: 'Layer', autocomplete: 'layer name' }
        ], 'Add Layer', async function (event){
            event.preventDefault();
            let layer_name = document.getElementById('addLayer').value;
            await addLayer(layer_name);
            document.getElementById('addLayerFormContainer').remove();
        });
    });
    //const layer_selector = createElementWithAttributes('div', {id:"layer-selector"});
    layers_container.append(addLayerButton); 
    document.body.append(layers_container);   
}
export function removeLayersMenu(){
    const layers_container = document.getElementById("layers-container");
    if (!layers_container) return;
    layers_container.remove();
    console.group("LAYERS CONTAINER REMOVED");
}
export function selectLayerSelectorItem(accordion_item){
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    accordion_item.classList.add('highlighted');
}
export function addLayerSelectorItem(layer) {
    const layer_container = document.getElementById('layers-container');
    const accordion_item = createElementWithAttributes('div', {id:`layer-${layer.id}`, class:'accordion-item'});
    accordion_item.addEventListener('click', () => {
        selectLayer(layer.id);    
    });
    
    const accordion_header = createElementWithAttributes('div', {class:'accordion-header'});
    accordion_header.classList.add('show');
    changeLayerClickSelectBehavior(accordion_header);
    const accordion_buttons_container = createElementWithAttributes('div', {id: 'accordion-buttons-container', class:'accordion-buttons'});
    const checkbox = createElementWithAttributes('input', {type:'checkbox', id:`layer-checkbox-${layer.id}`, class:'accordion-title'});
    const checkbox_label = createElementWithAttributes('label', {htmlFor: layer.id, class:'accordion-label', textContent: layer.name});
    
    const editButton = createButton('', '', ['fa-edit'],["formButton"], () => {});
    editButton.classList.add('accordion-edit-btn');
    //accordionButtonsDiv.appendChild(editButton);

    const deleteButton = createButton('', '', ['fa-trash'],["formButton"], () => {
        createForm('delete-layer-form-container', 'deleteLayerForm', 'Delete Layer?', null, 'Yes, Delete', 
        async function (event){
            event.preventDefault();
            try{
                await deleteLayer(layer.id);
                setCurrentLayer(null);
                document.getElementById('delete-layer-form-container').remove();
            }catch(error){
                console.error(error);
                newPopUpMessage(error.message, "error");
            }
        });     
    });
    deleteButton.classList.add('accordion-delete-btn');
    accordion_buttons_container.appendChild(deleteButton);
    const accordion_content = createElementWithAttributes('div', {id: `layer-content-${layer.id}`, class:'accordion-content'});
    accordion_header.append(checkbox, checkbox_label, accordion_buttons_container);
    accordion_item.append(accordion_header, accordion_content);
    layer_container.append(accordion_item);
}
export function deleteLayerSelectorItem(layer_id){
    
    const layer_container = document.getElementById('layers-container');
    const accordion_item = document.getElementById('layer-' + layer_id);
    console.log(layer_id);
    if (accordion_item) {
        layer_container.removeChild(accordion_item);
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
    /*
    const layer_container = document.getElementById('layer-selector');
    if(!layer_container) return;
    while (layer_container.firstChild) {
        layer_container.removeChild(layer_container.firstChild);
    }*/
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
    const addButton = createButton("Add Point", "add-point-button", ["fa-plus", "fa-map-pin"],["formButton"], () => {
        addPointModeOn(true);
    });
    const measureButton = createButton("Measure Distance", "measure-button", ["fa-ruler"],["formButton"], () => {
      
    });
    pointMenu.appendChild(addButton);
    pointMenu.appendChild(measureButton);
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
    let project_id = projects.getCurrent();
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
    let project_id = projects.getCurrent();
    if(!project_id) return;
    let project_properties = await database.load("Project Properties", `project_properties/${project_id}`);
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
    let project_id = projects.getCurrent();
    if (!project_id) return;
    let project_properties = await loadFromDatabase("Project Properties", `project_properties/${projects.getCurrent()}`);
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
                project_id: projects.getCurrent(),
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
    const addStyleButton = createButton("Add Style", "add-Style-button", ["fa-plus"],["formButton"], async () => {
        await createAddStyleForm()
    });
    const deleteStyleButton = createButton("Delete Style", "delete-Style-button", ["fa-trash"],["formButton"], async () => {
       
    });
    styles_menu.appendChild(addStyleButton);
    styles_menu.appendChild(deleteStyleButton);
}