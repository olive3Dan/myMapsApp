//CRIAR modulo projects
// CRIAR funções loadProject e unload project
import { database } from './databaseUtils.js';

import { WKT } from 'ol/format';
import {  applyStyleRulesToMap } from './mapTools';
import { applyStyleRulesToPointOnMap } from './mapTools';
import { projects } from './projects.js';

//STYLES
export async function getStyleRules(){
    return await database.load("styles", `styles/${projects.getCurrent().id}`);
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
    await applyStyleRulesToMap(style_rules);      
}


