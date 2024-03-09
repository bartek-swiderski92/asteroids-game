/** @format */

import $svg from '../modules/svg.js';
import {Ship} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';

const gameNode = document.querySelector('#game');
const ship = new Ship();
document.addEventListener('keydown', (event) => $helpers.handleKeyUp(event, true, ship));
document.addEventListener('keyup', (event) => $helpers.handleKeyUp(event, false, ship));

ship.draw(gameNode);
