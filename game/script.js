/** @format */

import $svg from '../modules/svg.js';
import {Game, Ship} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';

const gameNode = document.querySelector('#game');

const gameClass = new Game({guide: true});
gameClass.drawGrid(gameNode);
const ship = new Ship({guide: true});
document.addEventListener('keydown', (event) => $helpers.handleKeyUp(event, true, ship));
document.addEventListener('keyup', (event) => $helpers.handleKeyUp(event, false, ship));

ship.draw(gameNode);
