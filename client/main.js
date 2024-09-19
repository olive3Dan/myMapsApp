import './EventBus'
import { createMapToolsMenu} from './menus';
import {newMap} from './mapTools';
import {users} from './users';
import {projects} from './projects';
import {layers} from './layers';
import {features} from './features';
import{properties} from './properties';
import {database} from './databaseUtils';
import {styles} from './styles';
import { addBaseMap } from './mapTools.js';
document.addEventListener('DOMContentLoaded', async () => {
  newMap();
  createMapToolsMenu();
  
  users.menu.create();
  users.login("Daniel", "daniel");
  projects.open(94);
});
