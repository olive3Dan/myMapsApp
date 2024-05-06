import './style.css';
import { loadLayers, addLayer, addProperty  } from './main.js';
import { createLayersMenu, createMapToolsMenu, createPropertyMenu, createStylesMenu } from './menus';
import { newMap} from './mapTools';
import {users} from './users.js';
import {projects} from './projects.js'

//USERS
document.addEventListener('DOMContentLoaded', async() => {
  newMap();
  users.menu.create();
  await users.login("Daniel", "daniel");
  projects.menu.create();
  createMapToolsMenu();
});



