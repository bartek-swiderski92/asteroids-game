/** @format */
import $svg from '../modules/svg.js';
import {Game, Ship, Projectile, Asteroid} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';
//settings
let amountOfAsteroids = 4;

const gameNode = document.querySelector('#game');
const asteroids = [];
const projectiles = [];
let projectileCount = 0;
const game = new Game({guide: false});

for (let i = 0; i < amountOfAsteroids; i++) {
    let asteroid = new Asteroid(`asteroid-${i}`, {guide: game.guide});
    asteroid.push(Math.random() * 2 * Math.PI, 2000, 60);
    asteroid.twist((Math.random() - 0.5) * 500, 60);
    asteroids.push(asteroid);
}

const ship = new Ship({guide: game.guide});
// const projectile = new Projectile(200, 200);
document.addEventListener('keydown', (event) => $helpers.handleKeyPress(event, true, game, ship, asteroids));
document.addEventListener('keyup', (event) => $helpers.handleKeyPress(event, false, game, ship, asteroids));

function draw() {
    game.drawGrid(gameNode);

    ship.draw(gameNode);
    asteroids.forEach((asteroid) => {
        asteroid.draw(gameNode);
        asteroid.init();
    });
    ship.init();
}

function update(elapsed) {
    ship.update(elapsed);
    asteroids.forEach((asteroid) => asteroid.update(elapsed));
    projectiles.forEach((projectile, i) => {
        projectile.update(elapsed);
        if (projectile.life <= 0) {
            projectile.destroy(gameNode);
            projectiles.splice(i, 1);
        }
    });
    if (ship.trigger && ship.loaded) {
        projectileCount++;
        projectiles.push(ship.projectile(gameNode, projectileCount, elapsed));
    }
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
