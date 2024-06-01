import { projects } from './projects.js';
import { createElementWithAttributes, createContextMenu,  createForm, createButton } from './formUtils.js';
import { addLayerToMap, unloadLayersFromMap} from './mapTools.js'
import {database} from './databaseUtils.js'
import { features } from './features.js';
export const layers = (function(){
    //private variables and functions
    window.eventBus.on('projects:openProject', (event) => {
        layers.menu.create();
        layers.load(event.project_id);
    });
    window.eventBus.on('projects:closeProject', (event) => {
        layers.menu.delete();
    });
    window.eventBus.on('projects:addProject', async () => {
        await layers.add("Untitled Layer");
    });
    let current_layer = null;
    function changeLayerClickSelectBehavior(element) {
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
            console.log("LAYERS CONTAINER REMOVED");
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
        add:(layer)=>{
            const layer_container = document.getElementById('layers-container');
            const accordion_item = createElementWithAttributes('div', {id:`layer-${layer.id}`, class:'accordion-item'});
            accordion_item.addEventListener('click', () => { layers.select(layer)});
            const accordion_header = createElementWithAttributes('div', {class:'accordion-header'});
            accordion_header.classList.add('show');
            changeLayerClickSelectBehavior(accordion_header);
            const accordion_buttons_container = createElementWithAttributes('div', {id: 'accordion-buttons-container', class:'accordion-buttons'});
            const checkbox = createElementWithAttributes('input', {type:'checkbox', id:`layer-checkbox-${layer.id}`, class:'accordion-title'});
            const checkbox_label = createElementWithAttributes('label', {htmlFor: layer.id, class:'accordion-label', textContent: layer.name});
            const deleteButton = createButton('', '', ['fa-trash'],["formButton", 'accordion-delete-btn'], ()=>layers.forms.delete(layer.id));
            accordion_buttons_container.appendChild(deleteButton);
            const accordion_content = createElementWithAttributes('div', {id: `layer-content-${layer.id}`, class:'accordion-content'});
            accordion_header.append(checkbox, checkbox_label, accordion_buttons_container);
            accordion_item.append(accordion_header, accordion_content);
            layer_container.append(accordion_item);
        }
    };
    //public interface
    return {
        getCurrent:() => {return current_layer},
        select:(layer) => {
           layers.menu.select(layer.id);
            current_layer = layer;
        },
        open: (project) => {  
        },
        load: async (project_id) => {
            if(!project_id) return;
            let layers_data = await database.load("Layers", `layers/${project_id}`)
            if(!layers_data) return;
            layers_data.forEach(async(layer) => {
                addLayerToMap(layer.id);
                layers.menu.add(layer);
                await features.load(layer.id);
            });
            layers.select(layers_data[0]);
        },
        unload:() => {
            unloadLayersFromMap();
            current_layer = null;
        },
        add: async (layer_name) => {
            let project_id = projects.getCurrent();
            if(!project_id) throw new Error(`Projeto não encontrado: ${project_id}`);
            let new_layer = await database.add("layer", `add_layer/${project_id}`, {name: layer_name});
            layers.menu.add(new_layer);
            addLayerToMap(new_layer.id);
            layers.select(new_layer); 
        },
        edit:()=>{},
        delete: async (layer_id) => {
            await database.delete("layer", `delete_layer/`, layer_id);
            deleteLayerFromMap(layer_id);
            layers.menu.delete(layer_id); 
        },
        menu: menu,
        forms: forms
    }
})();