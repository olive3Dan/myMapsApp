import './EventBus'
import './style.css';
import { createMapToolsMenu} from './menus';
import {newMap} from './mapTools';
import {users} from './users';
import {layers} from './layers';
import {features} from './features';
import{properties} from './properties';

document.addEventListener('DOMContentLoaded', async () => {
  newMap();
  createMapToolsMenu();
  users.menu.create();
  users.login("Daniel", "daniel");
});



2