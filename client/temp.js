import './style.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import {Icon, Style, Text, Fill, Stroke} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';
import {click, pointerMove} from 'ol/events/condition.js';
import { get } from 'ol/style/IconImage';
import { loadFromDatabase, addToDatabase,  deleteFromDatabase, getFromDataBase } from './dbAccess.js';
import { unloadProjects, loadProjects, loadLayers, loginUser, addLayer, addProperty,  } from './main.js';
import { createUsersMenu, createMapToolsMenu, createPropertyMenu, createStylesMenu } from './menus';
import { newPopUpMessage } from './popUpForms';
import { newMap} from './mapTools';

//USERS
document.addEventListener('DOMContentLoaded', async() => {
  newMap();
  createUsersMenu();
  await loginUser("Orlando", "orlando");
  createMapToolsMenu();
  createPropertyMenu();
  createStylesMenu();
});



