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