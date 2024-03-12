/** @format */
import $svg from '../modules/svg.js';
import {Game, Ship, Projectile, Asteroid} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';
//settings
let amountOfAsteroids = 4;

const gameNode = document.querySelector('#game');
const asteroids = [];
for (let i = 0; i < amountOfAsteroids; i++) {
    let asteroid = new Asteroid(`asteroid-${i}`);
    asteroids.push(asteroid);
}

const game = new Game({guide: false});
const ship = new Ship({guide: game.guide});
// const projectile = new Projectile(200, 200);
document.addEventListener('keydown', (event) => $helpers.handleKeyPress(event, true, game, ship));
document.addEventListener('keyup', (event) => $helpers.handleKeyPress(event, false, game, ship));

function draw() {
    game.drawGrid(gameNode);

    ship.draw(gameNode);
    asteroids.forEach((asteroid) => {
        asteroid.draw(gameNode);
    });
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
// projectile.draw(gameNode, projectile);
