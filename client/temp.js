import './style.css';
import { eventBus } from './eventBus.js';
import { createMapToolsMenu} from './menus';
import { newMap} from './mapTools';
import {users} from './users.js';
import {projects} from './projects.js'
import { properties } from './properties.js';
import {createDataTablePopup} from './formUtils.js'



document.addEventListener('DOMContentLoaded', async() => {
  newMap();
  createMapToolsMenu();
  users.menu.create();
  await users.login("Daniel", "daniel");
});



2