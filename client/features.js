/**GENERATE INPUT FIELDS PODERÁ SER UMA  FUNCAO GENERICA DO FICHEIRO FORMUTILS
 * se possivel no editar ponto obter os dados do formulario com uma unica funcao getFeatureFormValues
 * Idealmente criar um modelo standart de formularios de adicionar editar e eliminar 
*/
import { projects } from './projects.js';
import {database} from './databaseUtils.js'
import { loadStyleRules } from './main.js';
import { selectPointOnMap, unselectPointOnMap, addPointToMap, editPointFromMap, deletePointFromMap, addPropertyToPointOnMap, editPropertyFromPointOnMap} from './mapTools.js';
import {layers} from './layers.js';
import { properties } from './properties.js';
import { stringifyCoordinates } from './mapTools.js';
import { isCtrlPressed } from './mapTools.js';
import { createElementWithAttributes, createForm } from './formUtils.js';
import { stringToCoordinates } from './mapTools.js';
export const features = (function(){
    //private variables and functions
    let current_feature = null;
    let selected_features = [];
    let default_marker_icon = "https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219";
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Delete') {
            selected_features.forEach(feature_id => features.delete(feature_id));
            features.unselect();
        }    
    });
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
                label:property.name,
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
        create: () => {
            
        },
        remove: ()=> {
            
        },
        select:(feature_id)=>{
            const feature = document.getElementById("point-" + feature_id);
            feature.classList.add("point-container-highlighted");
        },
        unselect:(feature_id)=>{
            const feature = document.getElementById("point-" + feature_id);
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
            pointContainer.addEventListener('mouseenter', () => {
                
            });
            pointContainer.addEventListener('mouseleave', () => {
               
            });
            pointContainer.addEventListener('click', (event) => {
                if(!isCtrlPressed(event)){
                    features.unselect();   
                }
                features.select(feature_data.id);
            });
            layer_content.appendChild(pointContainer);
    
        },
        edit:(feature_data) => {
            const feature_label = document.getElementById('point-label-' + feature_data.id);
            feature_label.textContent = feature_data.name;
        },
    }
    return {
        getSelected:() => {return selected_features},
        setSelected:(values) => {
            selected_features = [...values];
        },
        select:(feature_id) => {
            if(selected_features.includes(feature_id)) return;
            selected_features.push(feature_id);
            features.menu.select(feature_id);
            selectPointOnMap(feature_id);
        },
        unselect:() => {
            selected_features.forEach((id)=>{
                features.menu.unselect(id);
                unselectPointOnMap(id);
            });
            selected_features = [];
        },
        isSelected:(feature_id) => {
            return selected_features.includes(feature_id);
        },
        open: () => {  
        },
        load: async (layer_id) => {
            let points = await database.load("Points", `points/${layer_id}`)
            for(const point of points){
                features.menu.add(point);
                addPointToMap(point);
                await properties.load(point.id);
                await loadStyleRules(point.id);
            }
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
            let layer_id = layers.getCurrent().id;
            if (!layer_id) return;
            const new_point = {
                lon: coordinates[0], 
                lat: coordinates[1], 
                name: stringifyCoordinates(coordinates), 
                foto: default_marker_icon, 
                layer_id: layer_id
            };
            const point_data = await database.add("point", `add_point/${layer_id}`, new_point);
            features.menu.add(point_data);
            addPointToMap(point_data);
            const project_properties = await database.load("Project Properties", `project_properties/${projects.getCurrent()}`);
            await features.addPropertiesToFeature(project_properties, point_data.id);
            loadStyleRules(point_data.id);
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
            loadStyleRules(updated_point_data.id);
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