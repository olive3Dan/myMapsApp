
import { createElementWithAttributes, createContextMenu,  createForm, createButton } from './formUtils.js';
import { addLayerToMap, deleteLayerFromMap } from './mapTools.js'
import {database} from './databaseUtils.js'
export const layers = (function(){
    //private variables and functions
    let current_user = null;
    let current_project = null;
    let current_layer = null;
    window.eventBus.on('projects:openProject', async (event) => {
        current_project = event.project_id;
        layers.menu.create();
        const layers_data = await layers.load(event.project_id);
        if(!layers_data) return;
        layers.select(layers_data[0].id);
    });
    window.eventBus.on('projects:closeProject', (event) => {
        layers.unload();
        layers.menu.remove();
        current_project = null;
        current_layer = null;
    });
    window.eventBus.on('layers:expandLayer', (event) => {
        toggleAccordion(event.panel, event.action);
    });
    
    function toggleAccordion(panel, action = 'toggle') {
        if (action === 'open') {
            panel.style.maxHeight = panel.scrollHeight + "px";
            
        } else if (action === 'close') {
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                
            }
        } else if (action === 'toggle') {
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                
            }
        }
    }
    const forms = {
        
        add: () => {
            createForm('add-layer-form-container', 'add-layer-form', 'Add a New Layer', [
                { type: 'text', id: 'addLayer', placeholder: 'Layer', autocomplete: 'layer name' }
            ], 'Add Layer', async function (event){
                event.preventDefault();
                const layer_name = document.getElementById('addLayer').value;
                await layers.add(layer_name);
                document.getElementById('add-layer-form-container').remove();
            });
        },
        edit:()=>{

        },
        delete: (layer_id) => {
            createForm( 'delete-layer-form-container', 'delete-layer-form', 'Delete Layer?', [], 'Yes, Delete', 
            async function (event){
                event.preventDefault();
                await layers.delete(layer_id);
                document.getElementById('delete-layer-form-container').remove();
            }); 
        }
        
    }
    const menu = {
        create: () => {
            const layers_container = createElementWithAttributes('div', {id:'layers-container', innerHTML:'Layers'});
            const addLayerButton = createButton("Add Layer", "add-layer-button", ["fa-plus", "fa-layer-group"],["formButton"], () => layers.forms.add() );
            layers_container.append(addLayerButton); 
            document.body.append(layers_container);   
        },
        remove: ()=> {
            const layers_container = document.getElementById("layers-container");
            if (!layers_container) return;
            layers_container.remove();
            
        },
        select:(layer_id)=>{
            const layer_selector_item = document.getElementById("layer-" + layer_id);
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('highlighted');
            });
            layer_selector_item.classList.add('highlighted');
        },
        delete:(layer_id) => {
            const layer_container = document.getElementById('layers-container');
            const accordion_item = document.getElementById('layer-' + layer_id);
            if (accordion_item) {
                layer_container.removeChild(accordion_item);
            }
        },
        add:(layer_id, layer_name)=>{
            const layer_container = document.getElementById('layers-container');
            const accordion_item = createElementWithAttributes('div', {id:`layer-${layer_id}`, class:'accordion-item'});
            accordion_item.addEventListener('click', () => { layers.select(layer_id)});
            const accordion_header = createElementWithAttributes('div', {class:'accordion-header'});
            
            accordion_header.addEventListener("click", function(event) {
                if (event.target.tagName === 'LABEL') {
                    event.preventDefault(); // This will prevent the checkbox from being checked
                    var panel = this.nextElementSibling;
                    toggleAccordion(panel);
                }
            });
            const accordion_buttons_container = createElementWithAttributes('div', {id: 'accordion-buttons-container', class:'accordion-buttons'});
            const checkbox = createElementWithAttributes('input', {type:'checkbox', id:`layer-checkbox-${layer_id}`, class:'accordion-title'});
            const checkbox_label = createElementWithAttributes('label', {htmlFor: layer_id, class:'accordion-label', textContent: layer_name});
            const deleteButton = createButton('', '', ['fa-trash'],["formButton", 'accordion-delete-btn'], ()=>layers.forms.delete(layer_id));
            accordion_buttons_container.appendChild(deleteButton);
            const accordion_content = createElementWithAttributes('div', {id: `layer-content-${layer_id}`, class:'accordion-content'});
            accordion_header.append(checkbox, checkbox_label, accordion_buttons_container);
            accordion_item.append(accordion_header, accordion_content);
            layer_container.append(accordion_item);
        }
    };
    //public interface
    return {
        select:(layer_id) => {
           layers.menu.select(layer_id);
           current_layer = layer_id;
           eventBus.emit('layers:selectLayer', {layer_id:layer_id});
        },
        open: () => {  
        },
        load: async () => {
            let layers_data 
            try{
                console.log("UNLOAD LAYERS")
                console.log("CURRENT PROJECT " + current_project)
                layers_data = await database.load("Layers", `layers/${current_project}`); 
            }catch(error){
                return null;
            }
            layers_data.forEach(async(layer) => {
                layers.menu.add(layer.id, layer.name);
                addLayerToMap(layer.id);
            });
            window.eventBus.emit('layers:layersLoaded', {});
            return layers_data;
        },
        unload: async () => {
            let layers 
            try{
                console.log("UNLOAD LAYERS")
                console.log("CURRENT PROJECT " + current_project)
                
                layers = await database.load("Layers", `layers/${current_project}`); 
            }catch(error){
                return null;
            }
            for(const layer of layers){
                deleteLayerFromMap(layer.id);
            }
        },
        add: async (layer_name) => {
            if(!current_project) return null
            let new_layer;
            try{
                new_layer = await database.add("layer", `add_layer/${current_project}`, {name: layer_name});
            }catch(error){
                return null;
            }
            layers.menu.add(new_layer.id, new_layer.name);
            addLayerToMap(new_layer.id);
            layers.select(new_layer.id);
            return new_layer.id; 
        },
        edit:() => {},
        delete: async (layer_id) => {
            await database.delete("layer", `delete_layer/`, layer_id);
            deleteLayerFromMap(layer_id);
            layers.menu.delete(layer_id);
            if (layer_id == current_layer) current_layer = null;
            eventBus.emit('layers:deleteLayer', {layer_id:layer_id});
        },
        menu: menu,
        forms: forms
    }
})();