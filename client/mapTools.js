import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Group as LayerGroup, Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import {Icon, Style, Text, Fill, Stroke} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';
import { Overlay } from 'ol';
import {isSelected, addPoint, getSelectedPoints, unselectPoints, selectPoint} from './main.js';
import { createEditPointButton, createPropertyTable,findPropertyInObject } from './menus.js';
import { createForm, createButton, createElementWithAttributes } from './formUtils.js';
//MISC
export function stringifyCoordinates(coordinates) {
    const [x, y] = coordinates;
    const latitude = y / 100000;
    const longitude = x / 100000;

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
export function stringToCoordinates(coordinateString) {
    const coordinatesArray = coordinateString.split(',').map(parseFloat);
    return coordinatesArray;
  }
export function isCtrlPressed(event){
    return event.ctrlKey || event.metaKey;
}
//BASE MAPS
const base_maps = new LayerGroup({
    layers: [
      new TileLayer({
        source: new OSM(),
        title: 'Open Street Maps'
      }),
      // Otras capas aquí utilizar um base layer switcher

    ],
    title: 'Base Maps'
  });

//PROJECTS
let map;
const popupOverlay = new Overlay({
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
const project_group = new LayerGroup({
    layers: [],
    title: 'Project Layers'
});
const default_point_style_data = {
   normal: {img:"./icons/red-dot.png", scale: 1, text:"12px sans-serif"},
   highlighted:{img:"./icons/yellow-dot.png", scale: 1.5, font:"14px sans-serif"}
}
let adding_point_mode = false;

//MAPS
export function changeMapCursor(cursor){
    map.getTargetElement().style.cursor = cursor;
} 
function getHoveredFeature(event){
    const pixel = map.getEventPixel(event.originalEvent);
    const features = map.getFeaturesAtPixel(pixel);
    if(features.length > 0) return features[0];
    return null;
}
export function newMap(){
    map = new Map({
        target: 'map',
        layers: [base_maps],
        view: new View({
            center: fromLonLat([-8.61099, 41.14961]), // Coordenadas de Portugal
            zoom: 8
        })
    });
    map.addOverlay(popupOverlay);
    map.on('click', async function(event){
        if (adding_point_mode){
            await addPoint(event.coordinate);
            addPointModeOff();
            return;  
        }
        if(!isCtrlPressed(event.originalEvent)){
            unselectPoints();         
        }
        let hovered_feature = getHoveredFeature(event);
        if(hovered_feature){
           selectPoint(hovered_feature.get('id'));
           showPointProperties(hovered_feature.get('id'));
        }else{
            hidePointProperties();
        }
       
    });
    map.on('pointermove', function (event) {
        if(adding_point_mode) return;
        let hovered_feature = getHoveredFeature(event);
        if(hovered_feature){
            changeMapCursor("pointer");
        }else{
            changeMapCursor("");
        }
    });
        
}
export function addBaseMap(title, base_map){
    const newTileLayer = new TileLayer({
        source: base_map,
        title: title
    });
    base_maps.getLayers().push(newTileLayer);
}
export function deleteBaseMap(title){
    const layersInsideGroup = base_maps.getLayers().getArray();
    const layerToRemove = layersInsideGroup.find(layer => layer.get('title') === title);
    if (layerToRemove) {
        base_maps.getLayers().remove(layerToRemove);
    } 
}

//LAYERS
export function addLayerToMap(layer_id) {
    const newVectorLayer = new VectorLayer({
        source: new VectorSource(),
    });
    newVectorLayer.set('id', layer_id);
    map.addLayer(newVectorLayer);
    return newVectorLayer;
}
export function editLayerFromMap(layer_id){

}
export function deleteLayerFromMap(layer_id){
    const layer = getLayerFromMap(layer_id);
    if (!layer) throw new Error("Layer not found");
    map.getLayers().remove(layer);  
}
function getLayerFromMap(layer_id) {
    const layers = map.getLayers().getArray();
    const targetLayer = layers.find(layer => !(layer instanceof LayerGroup) && (layer.get('id') == layer_id )); 
    return targetLayer;
}
export function unloadLayersFromMap(){
    map.getLayers().forEach(function (layer) {
        if (!(layer instanceof LayerGroup)) {
            console.log(layer);
            map.removeLayer(layer);
        }
    });
}  

//POINTS
export function addPointModeOn(){
    adding_point_mode = true;
    changeMapCursor('crosshair');
}
export function addPointModeOff(value){
    adding_point_mode = false;
    changeMapCursor('default');
}
export function getPointsFromMap() {
    const layers = map.getLayers().getArray();
    let points = [];
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        points = [...points, ...layer.getSource().getFeatures()];
    }
    return points;
}
export function getPointFromMap(point_id) {
    const layers = map.getLayers().getArray();
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        const point = features.find(feature => feature.get('id') == point_id);
        if (point) return point;
    }
    return null;      
}
function setPointStateOnMap(point, state){
    let style_label = point.get('style_' + state).clone();
    style_label.getText().setText(point.get('name'));
    point.setStyle(style_label);
}
function setPointLabel(point, new_label) {
    
    const style_with_new_label = point.getStyle().clone();
    style_with_new_label.getText().setText(new_label);
    point.setStyle(style_with_new_label);
}
export function newPoint(point_data){
    let new_point = new Feature({
        id: point_data.id,
        name: point_data.name,
        coordinates:point_data.coordinates,
        foto:point_data.foto, 
        layer_id: point_data.layer_id,
        geometry: new Point(point_data.coordinates),
        style_normal: newPointStyle(default_point_style_data.normal),
        style_highlighted: newPointStyle(default_point_style_data.highlighted),
        custom_properties:[]    
    });

    return new_point;
}
export function addPointToMap(point_data) {
    const layer = getLayerFromMap(point_data.layer_id);
    if (!layer) throw new Error('Camada não encontrada');
    let new_point = newPoint(point_data);
    layer.getSource().addFeature(new_point);
    return new_point;    
}
export function deletePointFromMap(point_id) {
    let point = getPointFromMap(point_id);
    if (!point) throw new Error('Ponto não encontrado');
    let layer = getLayerFromMap(point.get('layer_id'));
    if (!layer) throw new Error('Camada não encontrada');
    layer.getSource().removeFeature(point);
}
export function editPointFromMap(new_point_data){
    let point = getPointFromMap(new_point_data.id);
    let properties = point.getProperties();
    
    console.log(new_point_data);
    Object.keys(properties).forEach((property) => {
        let target_property_value = findPropertyInObject(new_point_data, property);
        if (target_property_value) {
            point.set(property, target_property_value );
        }
    });
    point.set('geometry', new Point(new_point_data.coordinates));
    setPointLabel(point, new_point_data.name);
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(new_point_data.id);
    }   

}
export function selectPointOnMap(point_id){
    let point = getPointFromMap(point_id);
    if(!point) throw new Error("Ponto não encontrado");
    setPointStateOnMap(point, 'highlighted');
}
export function unselectPointOnMap(point_id){
    let point = getPointFromMap(point_id);
    if(!point) throw new Error("Ponto não encontrado");
    setPointStateOnMap(point,'normal');
    hidePointProperties();
}
function setPointStyle(point, style_data){
    point.set('style_normal',  newPointStyle(style_data.normal));
    point.set('style_highlighted',  newPointStyle(style_data.highlighted));
    if(isSelected(point.get('id'))){
        setPointStateOnMap(point, 'highlighted');
    }
    setPointStateOnMap(point, 'normal');
}

//PROPERTIES
export function showPointProperties(point_id) {
    const point = getPointFromMap(point_id);
    if (!point) throw new Error("Ponto invalido");
    const properties = point.getProperties();
    
    const popupElement = createElementWithAttributes('div', { className: 'popup' });
    
    const pointNameHeader = createElementWithAttributes('h2', { textContent: point.get('name') });
    popupElement.appendChild(pointNameHeader);
    
    const imgElement = createElementWithAttributes('img', {
        src: point.get('foto'),
        width: 300,
        height: 200
    });
    popupElement.appendChild(imgElement);

    const propertyTable = createPropertyTable(properties.custom_properties);
    popupElement.appendChild(propertyTable);

    const coordinatesFooter = createElementWithAttributes('div', {
        className: 'footer',
        innerHTML: `<strong>Coordenadas:</strong> (${stringifyCoordinates(point.get('coordinates'))})`
    });
    popupElement.appendChild(coordinatesFooter);

    const editButton = createEditPointButton(point);
    popupElement.appendChild(editButton);

    popupOverlay.setElement(popupElement);

    const popupSize = popupElement.getBoundingClientRect();
    const offsetX = -popupSize.width / 2;
    const offsetY = 10;
    popupOverlay.setOffset([offsetX, offsetY]);
    popupOverlay.setPosition(point.get('coordinates'));
}
export function hidePointProperties() {
    popupOverlay.setElement(null);
}
export function addPropertyToPointOnMap(point_id, point_property) {
    const point = getPointFromMap(point_id);
    if (!point) throw new Error("ponto não encontrado");

    if (point_property.options && point_property.options.trim() !== "") {
        point_property.options = JSON.parse(point_property.options);
    }
    point.get('custom_properties').push(point_property);
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(point_id);
    }  
}
export function deletePropertyFromPointOnMap(point_id, property_id) {
    let point = getPointFromMap(point_id);
    if (!point) throw new Error("ponto não encontrado");
    point.set('custom_properties', point.get('custom_properties').filter(property => property.id !== property_id));
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(point_id);
    }
}
export function editPropertyFromPointOnMap(point_id, new_property_data){
    let point = getPointFromMap(point_id);
    let custom_properties = point.getProperties().custom_properties;
    let target_property = custom_properties.find((property) => property.id == new_property_data.id);
    target_property.value = new_property_data.value;
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(point_id);
    }      
}
export function addPropertyToMap(property){
    const layers = map.getLayers().getArray();
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        features.forEach(point => {
            addPropertyToPointOnMap(point.id, point_property);
        });
    }
}
export function editPropertyFromMap(){
    
}
export function deletePropertyFromMap(property_id){
    const layers = map.getLayers().getArray();
    for(const layer of layers){
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        features.forEach(point => {
            deletePropertyFromPointOnMap(point.get('id'), property_id);
        });
    }    
}

//STYLES

export function applyStyleRulesToPointOnMap(point_id, style_rules){
    const point = getPointFromMap(point_id);
    if(!point) throw new Error("Ponto não encontrado");
    let rule_applies = false;
    style_rules.forEach((style_rule) => {
        if(applyStyleRuleToPointOnMap(style_rule, point)){
            rule_applies = true;
        }
    });
    if(!rule_applies){
        setPointStyle(point, default_point_style_data);
        console.log("No rule applies to: " + point.get('name'));
    }

}
export  function applyStyleRuleToPointOnMap(style_rule, point){
    const style_rule_applies_to_point = styleRuleAppliesToPoint(style_rule, point);
    if(style_rule_applies_to_point){
        const style_data = JSON.parse(style_rule.value);
        console.log("rule applies to point " + point.get("name"));
        setPointStyle(point, style_data);
        return true;
    }
    return false;
}
export function styleRuleAppliesToPoint(style_rule, point){
    const style_condition = JSON.parse(style_rule.condition);
    return point.get('custom_properties').some((custom_property) => {
        return custom_property.id == style_condition.property_id && custom_property.value == style_condition.value
    });
}
function newPointStyle(inputObj) {
    const style = {
        image: new Icon({
            src: inputObj.img,
            anchor: [0.5, 1],
            scale: inputObj.scale,
        }),
        text: new Text({
            font: inputObj.font,
            offsetX: 0, 
            offsetY: (-40 * inputObj.scale),  
            fill: new Fill({
                color: '#000',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 3,
            }),
        }),
    };
    return new Style(style);
    
}
export function applyStyleRulesToMap(style_rules){
     const points = getPointsFromMap();
     for(const point of points){
        applyStyleRulesToPointOnMap(point.get('id'), style_rules);
     }
}
export function editStyleRuleFromMap(){

}
export function deleteStyleRuleFromMap(style_rule_id){
    
}
function getIconDimensions(iconPath) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = iconPath;

        image.onload = () => {
            const dimensions = {
                width: image.width,
                height: image.height,
            };
            resolve(dimensions);
        };

        image.onerror = () => {
            reject(new Error("No se pudo cargar la imagen"));
        };
    });
}
