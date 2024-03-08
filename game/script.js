/** @format */

import $svg from '../modules/svg.js';
import {Ship} from '../modules/classes.js';

const gameNode = document.querySelector('#game');
const ship = new Ship({power: 1000});

ship.draw(gameNode);
