import './style.css';
import { unloadProjects, loadProjects, loadLayers, loginUser, addLayer, addProperty,  } from './main.js';
import { createUsersMenu, createMapToolsMenu, createPropertyMenu, createStylesMenu } from './menus';
import { newMap} from './mapTools';

//USERS
document.addEventListener('DOMContentLoaded', async() => {
  newMap();
  createUsersMenu();
  await loginUser("Daniel", "daniel");
  createMapToolsMenu();
  createPropertyMenu();
  createStylesMenu();
});



