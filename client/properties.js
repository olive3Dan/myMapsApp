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
                   return  await properties.add("", "", "");
                }, 
                edit:  async (property) => {
                    if (typeof property.values === 'string') {
                        if (property.values.trim() === "") {
                            property.values = '';
                        } else {
                            property.values = property.values.split(";");
                        }
                    }
                    await properties.edit(property.id, property.name, property.values, property.default_value);
                }, 
                delete:  async (property_data) => await properties.delete(property_data.id)
            };
            createDataTablePopup(
                "Project Properties", 
                ['Name', 'Values', 'Default Value'], 
                [{
                    name:"id",
                    inputType:"text",
                    options:[],
                    visible:false
                },
                {
                    name:"name",
                    inputType:"text",
                    options:[],
                    visible:true
                },
                {
                    name:"values",
                    inputType:"text",
                    options:[],
                    visible:true
                },
                {
                    name:"default_value",
                    inputType:"text",
                    options:[],
                    visible:true
                }],
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
            console.log(points_properties)
            points_properties.forEach((pp) => {
                addPropertyToPointOnMap(pp.point_id,{
                    id: pp.id,
                    name: pp.name,
                    value: pp.value,
                    values: pp.values,
                    default_value: pp.default_value
                });
            });
            window.eventBus.emit('properties:propertiesLoaded', {})
            return points_properties;
        },
        add: async (name, values, default_value) => {
            console.log("ADD PROPERTY:")
            const new_property_data = {
                name: name,
                values: values,
                default_value: default_value,
                project_id:current_project
            }
            const property = await database.add("Property", `add_property`, new_property_data);
            await database.add("Point <=> property ", `add_project_property_association/${current_project}`, {property_id: property.id, value:property.default_value});
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
            await database.update("Point <=> property ", `update_project_property_association/${current_project}/${updated_property.id}`, {});
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