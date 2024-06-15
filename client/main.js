//CRIAR modulo projects
// CRIAR funções loadProject e unload project
import { database } from './databaseUtils.js';
import { WKT } from 'ol/format';
import {  applyStyleRulesToMap } from './mapTools';
import { applyStyleRulesToPointOnMap } from './mapTools';
let current_project = null;
window.eventBus.on('projects:openProject',  (event) => current_project = event.project_id);
window.eventBus.on('projects:closeProject', () => current_project = null);
window.eventBus.on('properties:propertiesLoaded', async (event) => {
    let style_rules = await getStyleRules();
    window.eventBus.emit('styles:loadStyles', {style_rules: style_rules}); 
});
window.eventBus.on('features:addFeature', async (event) => {
    let style_rules = await getStyleRules();
    window.eventBus.emit('styles:loadPointStyle', {feature_id: event.feature_id, style_rules: style_rules}); 
})
window.eventBus.on('features:featureEdited', async (event) => {
    let style_rules = await getStyleRules();
    window.eventBus.emit('styles:loadPointStyle', {feature_id: event.feature_id, style_rules: style_rules}); 
})

//STYLES
export async function getStyleRules(){
    return await database.load("styles", `styles/${current_project}`);
}
export async function loadStyleRules(point_id){
    let style_rules = await getStyleRules();
    applyStyleRulesToPointOnMap(point_id, style_rules);
}
export async function addStyleRule(new_style_data){
    const new_style_rule = await database.add("style", `add_style`, new_style_data);
    let style_rules = await getStyleRules();
    applyStyleRulesToMap(style_rules);   
}
export async function editStyleRule(){

}
export async function deleteStyleRule(style_rule_id){
    await database.delete("style", `delete_style/`, style_rule_id);
    let style_rules = getStyleRules();
    applyStyleRulesToMap(style_rules);      
}


