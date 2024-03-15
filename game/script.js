/** @format */
import {Game} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';
//settings
// let amountOfAsteroids = 4;

const game = new Game({guide: false});

document.addEventListener('keydown', (event) => $helpers.handleKeyPress(event, true, game));
document.addEventListener('keyup', (event) => $helpers.handleKeyPress(event, false, game));
