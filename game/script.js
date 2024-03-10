/** @format */

import $svg from '../modules/svg.js';
import {Game, Ship} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';

const gameNode = document.querySelector('#game');

const game = new Game({guide: false});
const ship = new Ship({guide: game.guide});
document.addEventListener('keydown', (event) => $helpers.handleKeyPress(event, true, game, ship));
document.addEventListener('keyup', (event) => $helpers.handleKeyPress(event, false, game, ship));

function draw() {
    game.drawGrid(gameNode);

    ship.draw(gameNode);
    ship.init();
}

function update(elapsed) {
    ship.update(elapsed);
}

let previous;

function frame(timestamp) {
    if (!previous) previous = timestamp;
    let elapsed = timestamp - previous;
    update(elapsed / 1000);
    previous = timestamp;

    window.requestAnimationFrame(frame);
}
draw();

window.requestAnimationFrame(frame);
