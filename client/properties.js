import { projects } from './projects.js';
import {database} from './databaseUtils.js'
import { createForm, createDataTablePopup } from './formUtils.js';
import { addPropertyToPointOnMap, deletePropertyFromMap, editPropertyFromMap } from './mapTools.js';
export const properties = (function(){
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
            const project_id = projects.getCurrent();
            const project_properties = await database.load("Project Properties", `project_properties/${project_id}`);
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
            const project_properties = await database.load("Project Properties", `project_properties/${projects.getCurrent()}`);
            const actions = {
                add:  () => {
                    const property_data = {
                        name:"",
                        values:"",
                        default_value:"",
                        project_id:projects.getCurrent()
                    }
                    const new_property = properties.add(property_data);
                    return new_property;
                }, 
                edit:  (property_data) => properties.edit(property_data), 
                delete:  (property_data) => properties.delete(property_data.id)
            };
            createDataTablePopup(
                "Project Properties", 
                ['Id','Name', 'Values', 'Default Value'], 
                ['id', 'name', 'values', 'default_value'],
                project_properties,
                actions
            );
        }
    }
    return {
        load: async(project_id) => {
            const points_properties = await database.load("Point Properties", `points_properties_associations/${project_id}`);
            points_properties.forEach((pp) => {
               /*addPropertyToPointOnMap(pp.point_id, {
                    id: pp.property_id,
                    name: pp.property_name,
                    value: pp.property_value,
                    options: pp.property_values,
                    default_value: pp.property_default_value
                });*/
            });
            console.log(points_properties);
        },
        add: async (name, values, default_value, project_id) => {
            const new_property_data = {
                name: name,
                values: JSON.stringify(values),
                default_value: default_value,
            }
            const property = await database.add("Property", `add_property/${project_id}`, new_property_data);
            await database.add("Point <=> property ", `add_project_property_association/${project_id}`, {property_id: property.id, value:property.default_value});
            //addPropertyToMap(property);
            return property;
        },
        edit: async (id, name, values, default_value) => {
            const updated_property_data = {
                id:id,
                name: name,
                values: JSON.stringify(values),
                default_value: default_value,
            }
            let updated_property = await database.update("Property", `update_property/${updated_property_data.id}`, updated_property_data );
            //editPropertyFromMap(updated_property);
            return updated_property;
            
        },
        delete: async (property_id) => {
            return await database.delete("Property", `delete_property/`, property_id);
            //deletePropertyFromMap(property_id); 
        },
        form: form,
        menu: menu,
    }    
})();