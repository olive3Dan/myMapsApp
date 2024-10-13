
import {database} from './databaseUtils.js'
import { addPointToMap, editPointFromMap, deletePointFromMap, addPropertyToPointOnMap, editPropertyFromPointOnMap} from './mapTools.js';
import { stringifyCoordinates } from './mapTools.js';
import { createElementWithAttributes, createForm } from './formUtils.js';
import {layers} from "./layers.js"
export const features = (function(){
    let current_project = null;
    let current_layer = null;
    let selected_features = [];
    let default_foto = "./images/design-plano-sem-sinal-de-foto_23-2149272417.avif";
    
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
    function generatePointInputFieldsData(point, property_names) {
        let properties = point.getProperties();
        let input_fields = [];
        
        Object.keys(properties).forEach(property_name => {
            const target_property = property_names.find(name => name === property_name);
            if (target_property) {
                let field = {
                    id: target_property + "InputField",
                    placeholder: target_property,
                    autocomplete: 'off',
                    label: target_property,
                    type : 'text',
                    value : properties[target_property]
                };
                input_fields.push(field);
            }
        });
    
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
            if (Array.isArray(property.values) && property.values.length > 0) {
                inputField.type = 'select';
                inputField.options = property.values.map(value => ({
                    value: value,
                    text: value
                }));
                
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
            console.log("PROPERTY: ", property.name)
            console.log("INPUT_FIELD_VALUE: ", input_field_value);
            if(input_field_value){
                property.value = input_field_value;
            }
        });
        return properties;
    }
    function getPointFormValues(point, property_names) {
        const properties = { ...point.getProperties() };
        Object.keys(properties).forEach((property_name) => {
            const target_property = property_names.find((name) => name === property_name);
            if (target_property) {
                if (property_name === 'coordinates') {
                    properties[property_name] = stringToCoordinates(document.getElementById(property_name + "InputField").value);
                } else {
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
            createForm('editPointFormContainer', 'editPointForm', 'Edit Point', input_fields_data, 'OK', async function (event) {
                event.preventDefault(); 
                let updated_point_data = getPointFormValues(feature, ["name", "foto", 'coordinates']);
                let updated_custom_properties = getPropertiesFormValues(feature);
                
                await features.edit(updated_point_data, updated_custom_properties);
                document.getElementById('editPointFormContainer').remove();
            });
        }
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
                foto: default_foto, 
                layer_id: current_layer
            };
        
            const point_data = await database.add("point", `add_point/${current_layer}`, new_point);
            console.log("POINT_DATA", point_data);
            features.menu.add(point_data);
            addPointToMap(point_data);
        
            const project_properties = await database.load("Project Properties", `project_properties/${current_project}`);
            console.log("GET PROJECT PROPERTIES:");
            console.log(project_properties);
        
            await features.addPropertiesToFeature(project_properties, point_data.id);
            window.eventBus.emit('features:addFeature', { feature_id: point_data.id });
        },
        edit: async (updated_point_data, updated_custom_properties) => {
            console.log("FEATURES EDIT ");
            const updatedPoint = await database.update("update Point", `update_point/${updated_point_data.id}`, updated_point_data)
           
            editPointFromMap(updatedPoint);
            for (const new_custom_property of updated_custom_properties) {
                const updated_property = await database.update(
                    "point_properties", 
                    `update_point_property_association/${updatedPoint.id}/${new_custom_property.id}`,
                    { value: new_custom_property.value }
                );
                editPropertyFromPointOnMap(updatedPoint.id, new_custom_property);
            }
            features.menu.edit(updatedPoint);
            window.eventBus.emit('features:featureEdited', { feature_id: updatedPoint.id });
            
            await layers.unload();
            

            
            await layers.load();
            
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