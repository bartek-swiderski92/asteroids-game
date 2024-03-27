/** @format */
import {Game} from '../modules/classes.js';
import $helpers from '../modules/helpers.js';
//settings
const game = new Game();
// const game = new Game({weaponReloadTime: 0.001});

// const game = new Game({guide: true});

// const game = new Game({asteroidStartCount: 32});

// const game = new Game({radius: 15, thrusterPower: 25000, shipFlameOptions: {fill: 'blue'}});

// const game = new Game({radius: 150, weaponReloadTime: 0.01, shipFlameOptions: {fill: 'rgba(120, 25, 100, .3)', stroke: 'silver'}});

// const game = new Game({guide: false, UI: {hpBar: {currentHpBar: {fill: 'red', stroke: 'red'}, hpText: {innerHTML: 'HP'}}}});

// const game = new Game({guide: true, UI: {hpBar: {currentHpBar: {fill: 'red', stroke: 'red'}, hpText: {innerHTML: 'this is some really long string'}}}});

document.addEventListener('keydown', (event) => $helpers.handleKeyPress(event, true, game));
document.addEventListener('keyup', (event) => $helpers.handleKeyPress(event, false, game));

window.addEventListener('blur', () => game.pauseGame());
