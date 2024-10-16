import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Group as LayerGroup, Tile as TileLayer} from 'ol/layer';
//import OSM from 'ol/source/OSM';
import { OSM, XYZ } from 'ol/source';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import {Icon, Style, Text, Fill, Stroke} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';
import { Overlay } from 'ol';

import { createButton, createElementWithAttributes, createPropertyTable } from './formUtils.js';
import { findPropertyInObject } from './menus.js';
//MISC
export function stringifyCoordinates(coordinates) {
    const [x, y] = coordinates;
    const latitude = y / 100000;
    const longitude = x / 100000;

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
function isCtrlPressed(event){
    return event.ctrlKey || event.metaKey;
}
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
   normal: {icon:"./icons/red-dot.png", size: 1.5, font:"14px sans-serif"},
   highlighted:{icon:"./icons/yellow-dot.png", size: 1.75, font:"14px sans-serif"}
}
let adding_point_mode = false;
let selected_features = [];
//PROJECTS
window.eventBus.on('projects:closeProject', () => {
    popupOverlay.setElement(null);
});
//LAYERS
window.eventBus.on('layers:loadLayer', (event) => addLayerToMap(event.layer_id));
//FEATURES
window.eventBus.on('features:unselectAll', () => unselectAll());
window.eventBus.on('features:selectFeature', (event) => selectPointOnMap(event.feature_id));


document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete') {
        selected_features.forEach( feature_id => { 
            window.eventBus.emit('features:deleteFeature', {feature_id: feature_id})
        })
        unselectAll();
    }    
});
let base_maps = new LayerGroup({
    layers: [],
    title: 'Mapas Base'
  });
  
  export function newMap() {
    map = new Map({
      target: 'map',
      layers: [base_maps],
      view: new View({
        center: fromLonLat([-8.61099, 41.14961]), // Coordenadas de Portugal
        zoom: 8
      })
    });
    
    map.addOverlay(popupOverlay);
    
      addBaseMap({
        title: 'Satélite',
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        iconClass: 'fa-solid fa-earth-americas',
        visible:true,
      });
      
      addBaseMap({
        title: 'Relevo',
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        iconClass:'fa-solid fa-mountain',
        visible:true,
      });
      addBaseMap({
        title: 'Open Street Maps',
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        iconClass: 'fa-solid fa-road', 
        visible: true,
      });
    map.on('click', async function(event) {
      if (adding_point_mode) {
        window.eventBus.emit('map:click', { coordinates: event.coordinate });
        addPointModeOff();
        return;
      }
  
      let hovered_feature = getHoveredFeature(event);
      if (!hovered_feature) {
        unselectAll();
        popupOverlay.setElement(null);
        return;
      }
  
      if (!isCtrlPressed(event.originalEvent)) {
        unselectAll();
        showPointProperties(hovered_feature.get('id'));
      } else {
        popupOverlay.setElement(null);
      }
  
      selectPointOnMap(hovered_feature.get('id'));
      window.eventBus.emit('features:selectFeature', { feature_id: hovered_feature.get('id') });
    });
  
    map.on('pointermove', function (event) {
      if (adding_point_mode) return;
      let hovered_feature = getHoveredFeature(event);
      if (hovered_feature) {
        changeMapCursor("pointer");
      } else {
        changeMapCursor("");
      }
    });
  }
  
  export function switchBaseMap(mapType) {
    base_maps.getLayers().forEach(function(layer) {
      layer.setVisible(layer.get('title') === mapType);
    });
  }
  
 
  export function addBaseMap(mapConfig) {
    const { title, url, iconClass, type = 'base', visible = false } = mapConfig;
    
    const newLayer = new TileLayer({
      source: new XYZ({ url: url }),
      title: title,
      type: type,
      visible: visible
    });
  
    base_maps.getLayers().push(newLayer);
    
    addBaseMapToUI(title, iconClass);
  }
  
  
  export function changeMapCursor(cursor) {
    map.getTargetElement().style.cursor = cursor;
  }

  //BASE MAPS
  function toggleMapOptions() {
    const optionsMenu = document.querySelector('.map-options');
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
}
  
function addBaseMapToUI(title, iconClass) {
    const optionsMenu = document.querySelector('.map-options');

    const option = document.createElement('div');
    option.className = 'map-option';
    option.onclick = () => switchBaseMap(title);

    const icon = document.createElement('i'); // Ícone Font Awesome
    icon.className = iconClass; // Usa a classe do ícone passado como argumento

    const label = document.createElement('span');
    label.innerText = title;

    option.appendChild(icon);
    option.appendChild(label);

    optionsMenu.appendChild(option);
}
document.querySelector('.map-selector-button').addEventListener('click', toggleMapOptions);
  
  
//LAYERS
export function addLayerToMap(layer_id) {
    const newVectorLayer = new VectorLayer({
        source: new VectorSource(),
    });
    newVectorLayer.set('id', layer_id);
    map.addLayer(newVectorLayer);
    console.log("ADD LAYER : " + layer_id + " TO MAP");
    return newVectorLayer;
}
export function editLayerFromMap(layer_id){
}
export function deleteLayerFromMap(layer_id){
    console.log("DELETE LAYER :" + layer_id + " FROM MAP"); 
    const layer = getLayerFromMap(layer_id);
    if (!layer) throw new Error("Layer not found");
    map.getLayers().remove(layer);
    if(popupOverlay) popupOverlay.setElement(null);  
}
function getLayerFromMap(layer_id) {
    const layers = map.getLayers().getArray();
    const targetLayer = layers.find(layer => !(layer instanceof LayerGroup) && (layer.get('id') == layer_id )); 
    return targetLayer;
}

//POINTS
function getHoveredFeature(event){
    const pixel = map.getEventPixel(event.originalEvent);
    const features = map.getFeaturesAtPixel(pixel);
    if(features.length > 0) return features[0];
    return null;
}
export function forEachFeature(callback) {
    const layers = map.getLayers().getArray();
    for (const layer of layers) {
        if (layer instanceof LayerGroup) continue;
        const features = layer.getSource().getFeatures();
        features.forEach(callback);
    }
}
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
    console.log("ADD POINT: " + new_point.get('name') + " LAYER: " + point_data.layer_id );
    return new_point;    
}
export function deletePointFromMap(point_id) {
    let point = getPointFromMap(point_id);
    if (!point) throw new Error('Ponto não encontrado');
    let layer = getLayerFromMap(point.get('layer_id'));
    if (!layer) throw new Error('Camada não encontrada');
    layer.getSource().removeFeature(point);
    console.log("DELETE POINT :" + point_id + "FROM MAP");
}
export function editPointFromMap(new_point_data){
    let point = getPointFromMap(new_point_data.id);
    let properties = point.getProperties();
    Object.keys(properties).forEach((property) => {
        let target_property_value = findPropertyInObject(new_point_data, property);
        if (target_property_value) {
            
            point.set(property, target_property_value );
        }
    });
    point.set('geometry', new Point(new_point_data.coordinates));
    setPointLabel(point, new_point_data.name);
    
    /*
    
    const popupElement = popupOverlay.getElement();
    if (popupElement) {
        showPointProperties(new_point_data.id);
    }   */
        if (isSelected(point.id)) {
            showPointProperties(point.id);
        }

}
function unselectAll(){
    selected_features.forEach((id)=>{
        window.eventBus.emit('features:unselectFeature', {feature_id: id});
        unselectPointOnMap(id);
    });
    selected_features = [];
}
function isSelected(feature_id) {
    return selected_features.includes(feature_id);
}
function selectPointOnMap(feature_id){
    if(selected_features.includes(feature_id)) return;
    selected_features.push(feature_id);
    let point = getPointFromMap(feature_id);
    setPointStateOnMap(point, 'highlighted');
}
export function unselectPointOnMap(point_id){
    let point = getPointFromMap(point_id);
    setPointStateOnMap(point,'normal');
    popupOverlay.setElement(null);
}



//PROPERTIES
export function showPointProperties(point_id) {
    popupOverlay.setElement(null);
    const point = getPointFromMap(point_id);
    if (!point) throw new Error("Ponto invalido");
    const custom_properties = point.getProperties().custom_properties;
    
    const popupElement = createElementWithAttributes('div', {class:'feature-popup'});
    const pointNameHeader = createElementWithAttributes('h2', {textContent: point.get('name')});
    const imgElement = createElementWithAttributes('img', {src:point.get('foto'), });
    const propertyTable = createPropertyTable(custom_properties);
    const coordinatesFooter = createElementWithAttributes('div', {class: 'footer', innerHTML:`<i class="fa-solid fa-location-pin"></i>   ${stringifyCoordinates(point.get('coordinates'))}`});
    const editButton = createButton('Edit', 'edit-button', ['fa-edit'], ["formButton"], () => window.eventBus.emit('features:editFeature', {feature:point}));
    const delete_button = createButton('Delete', 'delete-button', ['fa-trash'], ["formButton"], () => {
        unselectAll();
        window.eventBus.emit('features:deleteFeature', {feature_id:point_id});
        popupOverlay.setElement(null);
    });
    const arrowElement = createElementWithAttributes('div', {class:'feature-popup-arrow'});
    popupElement.append(pointNameHeader, imgElement, propertyTable, coordinatesFooter, editButton, delete_button, arrowElement);
    
    document.body.appendChild(popupElement)
    const popupSize = popupElement.getBoundingClientRect();
    const offsetX = -popupSize.width / 2;
    const offsetY = -popupSize.height + 20; 

    document.body.removeChild(popupElement); 
    popupOverlay.setElement(popupElement);
    //popupOverlay.setOffset([offsetX, offsetY]);
    popupOverlay.setPosition(point.get('coordinates'));

}
export function addPropertyToPointOnMap(point_id, point_property) {
    console.log("ADD PROPERTY: " + point_property.id + " TO POINT: " + point_id);
    const point = getPointFromMap(point_id);
    point.get('custom_properties').push(point_property);
}
export function deletePropertyFromPointOnMap(point_id, property_id) {
    console.log(`DELETE PROPERTY ${property_id} FROM POINT ${point_id} ON MAP`)
    const point = getPointFromMap(point_id);
    if (!point) {
        console.error(`Ponto com ID ${point_id} não encontrado.`);
        return;
    }

   const custom_properties = point.get('custom_properties') || [];
    
    //console.log("CUSTOM PROPERTIES: ", custom_properties)

    const updated_properties = custom_properties.filter(property => property.id != property_id);

    //console.log("UPDATED PROPERTIES: ", updated_properties)
    
    point.set('custom_properties', updated_properties);

    
    if (isSelected(point_id)) {
        showPointProperties(point_id);
    }
}
export function editPropertyFromPointOnMap(point_id, new_property_data) {
    console.log("EDIT PROPERTY: " + new_property_data.id + " FROM POINT: " + point_id);

    const point = getPointFromMap(point_id);
    if (!point) {
        console.error(`Ponto com ID ${point_id} não encontrado.`);
        return;
    }

    const custom_properties = point.get('custom_properties');
    if (!custom_properties) {
        console.error(`Nada de propriedades em ${point_id}`);
        return;
    }
    const propertyToEdit = custom_properties.find(prop => prop.id == new_property_data.id);
    console.log("PropertyToEdit: ", propertyToEdit);

    if (propertyToEdit) {
        
        propertyToEdit.name = new_property_data.name;
        propertyToEdit.values = new_property_data.values;
        propertyToEdit.default_value = new_property_data.default_value;

        
        if (!propertyToEdit.value) {
            propertyToEdit.value = new_property_data.default_value;
        }

        console.log("PROPRIEDADE ATUALIZADA: ", propertyToEdit);

        
        const updated_properties = custom_properties.map(prop => 
            prop.id == new_property_data.id ? propertyToEdit : prop
        );

        
        point.set('custom_properties', updated_properties);
    } else {
        console.warn(`Propriedade com ID ${new_property_data.id} não encontrada no ponto com ID ${point_id}.`);
        return;
    }
    if (isSelected(point_id)) {
        showPointProperties(point_id);
    }
}

export function addPropertyToMap(new_property){
    forEachFeature(point => {
        addPropertyToPointOnMap(point.get('id'), new_property);
    });    
}
export function editPropertyFromMap(property) {
    console.log("EDIT PROPERTY: " + property.id + " FROM MAP")
    forEachFeature(point => {
        editPropertyFromPointOnMap(point.get('id'), property);
    });
}
export function deletePropertyFromMap(property_id) {
    console.log("DELETE PROPERTY FROM MAP: ", property_id)
    forEachFeature(point => {
        deletePropertyFromPointOnMap(point.get('id'), property_id);
    });
}

//STYLES
function newPointStyle(style_data) {
    const style = {
        image: new Icon({
            src: style_data.icon,
            anchor: [0.5, 1],
            scale: style_data.size,
        }),
        text: new Text({
            font: style_data.font,
            offsetX: 0, 
            offsetY: (-50 * style_data.size),  
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
function setPointStyle(point_id, style){
    const point = getPointFromMap(point_id);
    const style_highlighted = {
        ...style,
        size: style.size * 1.5
    };
    point.set('style_normal',  newPointStyle(style));
    point.set('style_highlighted',  newPointStyle(style_highlighted));
    if(isSelected(point.get('id'))){
        setPointStateOnMap(point, 'highlighted');
    }
    setPointStateOnMap(point, 'normal');
}
export function addStyleToPointOnMap(point_style){
    
    if(!point_style.style_id){
        deleteStyleFromPointOnMap(point_style.point_id)
        return;
    }
    setPointStyle(point_style.point_id, point_style);
    console.log("ADD STYLE: ", point_style);
}
export function deleteStyleFromPointOnMap(point_id){
    console.log("DELETE STYLE FROM POINT: " + point_id);
    setPointStyle(point_id, default_point_style_data.normal)
    
}
export function editStyleOnMap(point_id, style){
    console.log("RULE: " + style.style_id + "POINT: " + point_id);
   
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
