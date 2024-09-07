import {database} from './databaseUtils.js'
import {addStyleToPointOnMap, deleteStyleFromPointOnMap} from './mapTools.js';
import { createDataTablePopup } from './formUtils.js';

export const styles = (function(){
    let current_project = null;
    window.eventBus.on('projects:openProject', (event) => {
        current_project = event.project_id;
    });
    window.eventBus.on('projects:closeProject', (event) => {
        current_project = null;
    });
    window.eventBus.on('properties:propertiesLoaded', async (event)=>{
        await styles.load();
    })
    window.eventBus.on('properties:propertyAdded', async(event)=>{
        await styles.load();
    })
    window.eventBus.on('properties:propertyEdited', async(event) => {
        await styles.load();
    })
    window.eventBus.on('properties:propertyDeleted', async(event)=>{
        await styles.load();
    })
    window.eventBus.on('features:featureEdited', async(event)=>{
        await styles.load();
    })
    window.eventBus.on('features:addFeature', async(event)=>{
        await styles.load();
    })
    window.eventBus.on('styles:openStylesMenu', () => styles.menu.create());
    const form = {
        add:() => { },
        edit:() => {},
        delete: async() => {},
    }
    const menu = {
       create: async () => {
            const properties_styles = await database.load("Properties Styles", `properties_styles/${current_project}`);
            console.log("properties_styles", properties_styles);
            const properties = await database.load("project properties",`project_properties/${current_project}`);
            const properties_options = properties.map(property =>{
                return {label:property.name, value: JSON.stringify(property)}
            });
            const headers = ['Propriedade', '   Valor   ', 'Icone', "Tamanho", "Tipo de Letra"];
            const fields = [
                { name: 'property_id', inputType: 'number', visible:false },
                { 
                    name: 'property_name', 
                    inputType: 'select', 
                    options: properties_options,
                    dependentField: { name: 'property_values' },
                    visible:true  
                },
                { 
                    name: 'property_values', 
                    inputType: 'select', 
                    options: [],
                    visible:true
                },
                { name: 'style_id', inputType: 'number', visible: false },
                { name: 'icon', inputType: 'text', visible:true },
                { name: 'size', inputType: 'number', visible:true },
                { name: 'font', inputType: 'text', visible:true }
            ];
            const actions = {
                add: async () => {
                    if (properties){
                        return await styles.add(properties[0].id,  "", "", "", "");
                    }
                    
                },
                edit: async (data) => {
                    console.log(data);
                    styles.edit(data.style_id, data.property_id, data.property_values, data.icon, data.size, data.font);
                },
                delete: async (object_data) => {
                    console.log('Deleting item:', object_data);
                },
                loadDependentOptions: (fieldName, property_id) => {
                    let target_property;
                    
                    if (fieldName == 'property_name') {
                        target_property = properties.find(property => property.id == property_id)
                    }
                    
                   return target_property.values;
                }
            };
            createDataTablePopup('Estilos', headers, fields, properties_styles, actions);
        }
    }
    return {
        load: async () => {
            await styles.unload();
            let points_styles;
            try {
                console.log("CURRENT_PROJECT: ", current_project);
                points_styles = await database.load('points styles', `points_styles/${current_project}`);
                
            } catch (error) {
                console.error('Error loading styles:', error);
                return null  
            }
            
            for(const point_style of points_styles){
                addStyleToPointOnMap(point_style);
            }
            console.log('STYLES LOADED:', points_styles);
            return points_styles;
        },
        unload: async() => {
            let features;
            try{
                features = await database.load("Points", `project_points/${current_project}`)
            }catch(error){
                return null
            }
            for(const feature of features){
                deleteStyleFromPointOnMap(feature.id);
            }
        },
        add: async (property_id, value, icon, size, font) => {
            let new_style;
            let property_style;
            try {
                new_style = await database.add('style', 'add_style/', {icon:icon, size:size, font:font});
                property_style = await database.add('property_style', 'add_property_style/', {property_id:property_id, style_id:new_style.id, value:value });
                console.log('NEW STYLE:', new_style);
                console.log('NEW PROPERTY_STYLE:', property_style);
            } catch (error) {
                console.error('Error adding property_style or style:', error);   
            }
            await styles.load();
            return property_style;
        },
        edit: async (style_id, property_id, value, icon, size, font) => {
            let updated_style;
            let updated_property_style;
            try {
                updated_style = await database.update('style', `update_style/${style_id}`, {icon:icon, size:size, font:font });
                console.log('UPDATED STYLE:', updated_style);
                updated_property_style = await database.update('style', `update_properties_styles/${property_id}/${style_id}`, {value:value});
                console.log('UPDATED PROPERTY_STYLE:', updated_property_style);
                //window.eventBus.emit('styles:editStyle', data);
            } catch (error) {
                console.error('Error editing style:', error);
            }
            await styles.load();
        },
        delete: async (property_id, style_id) => {
           try {
                await database.delete('style', `delete_style/${style_id}`, {});
                await database.delete('style', `delete_property_style/${property_id}/${style_id}`, {});
                console.log('DELETED STYLE:', style_id);
                window.eventBus.emit('styles:deleteStyle', data);
            } catch (error) {
                console.error('Error deleting style:', error);
            }
            await styles.load();
            
        },
        form: form,
        menu: menu,
    }
})();