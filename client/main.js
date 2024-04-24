import { loadFromDatabase,
        getUserFromDatabase, 
        addToDatabase,
        addUserToDatabase, 
        deleteFromDatabase, 
        addEntityToDatabase, 
        deleteEntityFromDatabase,
        updateEntityFromDatabase
} from './dbAccess.js';

import { newPopUpMessage } from './popUpForms.js';
import { 
    createProjectsMenu,
    addProjectSelectorOption, 
    deleteProjectSelectorOption, 
    addLayerSelectorItem, 
    deleteLayerSelectorItem, 
    createLayersMenu, 
    addPointSelectorItem,
    unloadLayerSelectorItems,
    selectLayerSelectorItem,
    selectPointSelectorItem, 
    unselectPointSelectorItem,
    deletePointSelectorItem
} from './menus.js';
import { 
    addPointToMap, 
    addLayerToMap, 
    deleteLayerFromMap, 
    unloadLayersFromMap,
    selectPointOnMap,
    unselectPointOnMap,
    deletePointFromMap,
    stringifyCoordinates,
    addPropertyToPointOnMap,
    deletePropertyFromMap,
} from './mapTools';
import { WKT } from 'ol/format';
import { editPointFromMap, applyStyleRulesToMap } from './mapTools';
import { editPropertyFromPointOnMap } from './mapTools';
import { applyStyleRulesToPointOnMap } from './mapTools';

let current_layer = null;
export function getCurrentProject(){
    return document.getElementById("projectSelector").value;
}
export function setCurrentProject(project_id){
    document.getElementsById("projectSelector").value = project_id;    
}
export function getCurrentLayer(){
    return current_layer;
}
export function setCurrentLayer(layer_id){
    current_layer = layer_id;
}

//USERS
export function newUserSession(user){
    window.sessionStorage.clear();
    window.sessionStorage.setItem("active_user", JSON.stringify(user));
    document.getElementById("currentUserDisplay").innerText = user.name;
   
}
export function endCurrentSession(){
    window.sessionStorage.clear();
    document.getElementById("currentUserDisplay").innerText = "No User";  
}
export function getCurrentUser(){
    try{
        return window.sessionStorage.getItem('active_user');
    }catch(error){
        throw new Error("No User Logged In");
    }
}
export async function loginUser(name, password){
    logoutCurrentUser();
    let user = await getUserFromDatabase(name, password);
    newUserSession(user);
    await loadProjects(user.id);   
}
export function logoutCurrentUser(){
    try{
        endCurrentSession();
        unloadProjects(); 
    }catch(error){
        throw error;
    }     
}
export async function addUser(name, password){
    let user = await addUserToDatabase(name, password);
    await loginUser(user.name, user.password);
}
export function editUser(){
}
export async function deleteCurrentUser(){
    try{
        let current_user = JSON.parse(getCurrentUser());
        logoutCurrentUser();
        await deleteEntityFromDatabase("User", "delete_user/", current_user.id);
    }catch(error){
        throw error;
    }
}

//PROJECTS
export async function loadProjects(user_id){
    let projects = await loadFromDatabase("Projects", `projects/${user_id}`)
    createProjectsMenu();
    createLayersMenu();
    if(!projects) return;
    projects.forEach(function(project) {
        addProjectSelectorOption(project);
    });
    await loadLayers(getCurrentProject());
    console.log(`projects from ${user_id} loaded`);
}
export function unloadProjects(){
    let project_menu = document.getElementById("project_menu");
    if(project_menu){
        project_menu.innerHTML = '';
    }
    unloadLayers();
}
export async function addProject(name) {
    const new_project = await addEntityToDatabase("project", "add_project/", {name: name} );
    const active_user = JSON.parse(window.sessionStorage.getItem("active_user"));
    await addEntityToDatabase("project user association", "associate_project_user/", {project_id: new_project.id, user_id: active_user.id});
    addProjectSelectorOption(new_project);
}
export async function deleteProject(project_id){
    try {
        unloadLayers();
        deleteProjectSelectorOption(project_id);
        await deleteEntityFromDatabase("project", "delete_project/", project_id);
    } catch (error) {
       console.error(error);
    }
}

//LAYERS
export function selectLayer(layer_id){
    const layer_selector_item = document.getElementById("layer-" + layer_id);
    selectLayerSelectorItem(layer_selector_item);
    current_layer = layer_id;
}
export async function loadLayers(project_id){
    if(!project_id) return;
    unloadLayers();
    let layers = await loadFromDatabase("Layers", `layers/${project_id}`)
    if(!layers) return;
    layers.forEach(async(layer) => {
        addLayerSelectorItem(layer);
        addLayerToMap(layer.id);
        selectLayer(layer.id);
        await loadPoints(layer.id);
    });
}
export function unloadLayers(){
    unloadLayerSelectorItems();
    unloadLayersFromMap();
    setCurrentLayer(null);
}
export async function addLayer(name){
    let project_id = getCurrentProject();
    if(!project_id) throw new Error("Projeto não encontrado");
    let new_layer = await addEntityToDatabase("layer", `add_layer/${project_id}`, {name: name})
    addLayerSelectorItem(new_layer);
    addLayerToMap(new_layer.id);
    selectLayer(new_layer.id); 
}
export async function deleteLayer(layer_id){
    
    await deleteEntityFromDatabase("layer", `delete_layer/`, layer_id);
    deleteLayerFromMap(layer_id);
    deleteLayerSelectorItem(layer_id); 
   
}

//POINTS
let selected_points = [];
export function getSelectedPoints(){
    return selected_points;
}
export function setSelectedPoints(values){
    selected_points = [...values];
}
export function isSelected(point_id){
   return selected_points.includes(point_id);
}
export function selectPoint(point_id){
    if(selected_points.includes(point_id)) return;
    selected_points.push(point_id);
    selectPointSelectorItem(point_id);
    selectPointOnMap(point_id);
}
export function unselectPoints(){
    selected_points.forEach((id)=>{
        unselectPointSelectorItem(id);
        unselectPointOnMap(id);
    });
    selected_points = [];
}
export async function loadPoints(layer_id){
   
    let points = await loadFromDatabase("Points", `points/${layer_id}`)
    if(!points) throw new Error("Couldn´t load points");
    for(const point of points){
        addPointSelectorItem(point);
        addPointToMap(point);
        await loadProperties(point.id);
        await loadStyleRules(point.id);
    }
}
export async function addPoint(coordinates) {
    if (!current_layer) return;
    const new_point = {
        lon: coordinates[0], 
        lat: coordinates[1], 
        name: stringifyCoordinates(coordinates), 
        foto: "https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219", 
        layer_id: current_layer
    };
    const point_data = await addEntityToDatabase("point", `add_point/${current_layer}`, new_point);
    addPointSelectorItem(point_data);
    addPointToMap(point_data);
    
    let project_properties = await loadFromDatabase("Project Properties", `project_properties/${getCurrentProject()}`);
    if(!project_properties) throw new Error("not able to load project properties");
    project_properties.forEach(async function (property) {
        const point_properties = await addEntityToDatabase("Point <=> property association", 
            `add_point_property_association/${point_data.id}`, 
            {property_id: property.id, value:property.default_value}
        );
        if(!point_properties) throw new Error("not able to load point properties");
        addPropertyToPointOnMap(point_data.id, {
            id: property.id,
            name: property.name,
            value: property.default_value,
            options: property.values,
            default_value: property.default_value
        });
          
    });
    loadStyleRules(point_data.id);

}
export async function deletePoint(point_id){
    await deleteEntityFromDatabase("point", `delete_point/`, point_id);
    deletePointFromMap(point_id);
    deletePointSelectorItem(point_id); 
}
export async function editPoint(updated_point_data, updated_custom_properties){
    //points
    const updated_point = await updateEntityFromDatabase("point", `update_point/${updated_point_data.id}`, updated_point_data);
    if(!updated_point) throw new Error("Não foi possivel atualizar o ponto");
    editPointFromMap(updated_point_data);
    
    //properties
    updated_custom_properties.forEach(async (new_custom_property) => {
        const updated_property = await updateEntityFromDatabase(
            "point_properties", 
            `update_point_property_association/${updated_point_data.id}/${new_custom_property.id}`,
            {value: new_custom_property.value}
        );
        if(!updated_property) throw new Error("não foi possivel atualizar a propriedade");
        editPropertyFromPointOnMap(updated_point_data.id, new_custom_property);
    });
    //styles
    loadStyleRules(updated_point_data.id);

}

//PROPERTIES
export async function loadProperties(point_id){
    
    let point_properties = await loadFromDatabase("Point Properties", `points_properties_associations/${point_id}`);
    if(!point_properties) throw new Error("Couldn't load properties from database");
    point_properties.forEach((point_property) => {
        addPropertyToPointOnMap(point_property.point_id, {
            id: point_property.id,
            name: point_property.name,
            value: point_property.value,
            options: point_property.values,
            default_value: point_property.default_value
        }); 
    });
}
export async function addProperty(new_property) {
    let project_id = getCurrentProject();
    const property = await addEntityToDatabase("Property", `add_property/${project_id}`, new_property);
    const point_properties = await addEntityToDatabase("Point <=> property association", 
        `add_project_property_association/${project_id}`, 
        {property_id: property.id, value:new_property.default_value}
    );
    point_properties.forEach((point_property) => {
       addPropertyToPointOnMap(point_property.point_id, {
            id: property.id,
            name: property.name,
            value: point_property.value,
            options: property.values,
            default_value: property.default_value
        });    
    });
    return property;
}
export async function deleteProperty(property_id){
    await deleteEntityFromDatabase("Property", `delete_property/`, property_id);
    deletePropertyFromMap(property_id); 
}
export function editProperty(){
}
//STYLES
export async function getStyleRules(){
    let project_id = getCurrentProject();
    let style_rules = await loadFromDatabase("styles", `styles/${project_id}`);
    if(!style_rules) throw new Error("Couldn't load style rules from database");
    return style_rules;
}
export async function loadStyleRules(point_id){
    let style_rules = await getStyleRules();
    applyStyleRulesToPointOnMap(point_id, style_rules);
}
export async function addStyleRule(new_style_data){
    const new_style_rule = await addEntityToDatabase("style", `add_style`, new_style_data);
    if (!new_style_rule) throw new Error("Can't add new style to database");
    let style_rules = await getStyleRules();
    applyStyleRulesToMap(style_rules);   
}
export async function editStyleRule(){

}
export async function deleteStyleRule(style_rule_id){
    await deleteEntityFromDatabase("style", `delete_style/`, style_rule_id);
    let style_rules = getStyleRules();
    await applyStyleRulesToMap(style_rules);      
}


