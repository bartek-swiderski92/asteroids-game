/** @format */

const $helpers = {};

$helpers.handleKeyPress = function (event, value, game) {
    let nothingHandled;
    if (game.gameOver === false) {
        switch (event.key || event.keyCode) {
            case 'ArrowUp':
            case 38:
                game.ship.thrusterOn = value;
                break;
            case 'ArrowLeft':
            case 37:
                game.ship.leftThrusterOn = value;
                break;
            case 'ArrowRight':
            case 39:
                game.ship.rightThrusterOn = value;
                break;
            case 'ArrowDown':
            case 40:
                game.ship.retroOn = value;
                break;
            case ' ':
            case 32:
                game.ship.trigger = value;
                break;
            case 'g':
            case '71':
                if (value) {
                    game.switchGuide();
                }
                break;
            default:
                nothingHandled = true;
        }
    } else {
        switch (event.key || event.keyCode) {
            case 'Enter':
            case 13:
                game.resetGame();
                break;
        }
    }

    if (nothingHandled) {
        //    event.preventDefault();
    }
};
/**
 * @public
 * @description
 * Converts kebab case to camel case
 * @param {String} string
 * @returns {String}
 * */
$helpers.kebabToCamelCase = function (string) {
    return string.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
};

/**
 * @public
 * @description
 * Remove all children of the parent node
 * @param {Node} node
 */
$helpers.clearNode = function (node) {
    let allChildren = [...node.querySelectorAll('*')];
    if (allChildren.length > 0) {
        allChildren.forEach((child) => {
            child.remove();
        });
    }
};

/**
 * @public
 * @description
 * Assigns default values for the game objects
 * @param {String} gameElement name of the game element
 * @param {Object} options options defining the element
 * @param {Object} gameNode the svg game node
 * @returns {Object} options
 * */
//TODO Refactor the below method to a settings.json file
$helpers.assignDefaultValues = function (gameElement, options = {}, gameNode, globalOptions) {
    switch (gameElement) {
        case 'grid':
            options.id = 'grid';
            options.minor = options.minor ?? 10;
            options.major = options.major ?? options.minor * 5;
            options.lineColor = options.lineColor ?? '#00FF00';
            options.textColor = options.textColor ?? '#009900';
            options.display = globalOptions.guide ? 'inline' : 'none';
            break;
        case 'groupHpTag':
            options.id = 'group-hp-tag';
            break;
        case 'hpText':
            options.id = 'hp-text';
            options.class = 'text standard-text';
            options.innerHTML = options.innerHTML ?? 'HP';
            options.x = 15;
            options.y = 20;
            break;
        case 'groupHpBar':
            options.id = 'group-hp-bar';
            break;
        case 'maxHpBar':
            options.id = 'max-hp-bar';
            options.stroke = 'white';
            options.strokeWidth = 1;
            options.fill = 'transparent';
            options.width = options.width ?? 70;
            options.height = options.height ?? 15;
            options.x = globalOptions.hpText.x + 25;
            //TODO Below add logic for calculating space for the health bar
            // options.x = globalOptions.hpText.x + globalOptions.hpText.innerHTML.length * 8;
            options.y = globalOptions.hpText.y - 10;
            break;
        case 'currentHpBar':
            options.id = 'current-hp-bar';
            options.stroke = options.stroke ?? 'green';
            options.fill = options.fill ?? 'green';
            options.width = globalOptions.maxHpBar.width - globalOptions.maxHpBar.strokeWidth * 2;
            options.height = globalOptions.maxHpBar.height - globalOptions.maxHpBar.strokeWidth * 2;
            options.x = globalOptions.maxHpBar.x + globalOptions.maxHpBar.strokeWidth;
            options.y = globalOptions.maxHpBar.y + globalOptions.maxHpBar.strokeWidth;
            break;
        case 'groupScoreTag':
            options.id = 'group-score-tag';
            break;
        case 'scoreLabel':
            options.id = 'score-label';
            options.class = 'text standard-text';
            options.innerHTML = options.innerHTML ?? 'Score: ';
            options.x = gameNode.clientWidth - 130;
            options.y = 20;
            break;
        case 'currentScore':
            options.id = 'current-score';
            options.class = 'text standard-text';
            options.numberOfDigits = options.numberOfDigits ?? 10;
            options.innerHTML = '';
            for (let i = 0; i < options.numberOfDigits; i++) {
                options.innerHTML += '0';
            }
            options.x = globalOptions.scoreLabel.x + 50;
            options.y = globalOptions.scoreLabel.y;
            break;
        case 'groupFpsTag':
            options.id = 'group-fps-tag';
            break;
        case 'fpsLabel':
            options.id = 'fps-label';
            options.class = 'text standard-text';
            options.innerHTML = options.innerHTML ?? 'FPS: ';
            options.x = gameNode.clientWidth - 65;
            options.y = gameNode.clientHeight - 20;
            break;
        case 'currentFps':
            options.id = 'current-fps';
            options.class = 'text standard-text';
            options.innerHTML = '000';
            options.x = globalOptions.fpsLabel.x + 35;
            options.y = globalOptions.fpsLabel.y;
            break;
        case 'massClass':
            options.mass = options.mass ?? 1;
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? 0;
            options.xSpeed = options.xSpeed ?? 0;
            options.ySpeed = options.ySpeed ?? 0;
            options.rotationSpeed = options.rotationSpeed ?? 0;
            options.rotateValue = options.rotateValue ?? -(0.5 * Math.PI);
            break;
        case 'shipClass':
            options.id = options.id ?? 'ship';
            options.groupId = `group-${options.id}`;
            options.initialX = 0;
            options.initialY = 0;
            options.x = options.x ?? gameNode.clientWidth / 2;
            options.y = options.y ?? gameNode.clientHeight / 2;
            options.mass = options.mass ?? 10;
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? (0.5 * Math.PI) / 2;
            options.weaponPower = options.weaponPower ?? 450;
            options.weaponReloadTime = options.weaponReloadTime ?? 0.01;
            options.thrusterPower = options.thrusterPower ?? 1000;
            options.maxHealth = 200.0;
            //Appearance
            options.shipFlameOptions = options.shipFlameOptions ?? {};
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.curve1 = options.curve1 ?? 0.25;
            options.curve2 = options.curve2 ?? 0.75;
            options.guide = options.guide ?? false;
            break;
        case 'shipGroupOptions':
            options.id = globalOptions.groupId;
            break;
        case 'shipFlameOptions':
            options.id = 'ship-flame';
            options.lineWidth = options.lineWidth ?? 3;
            options.stroke = options.stroke ?? 'yellow';
            options.fill = options.fill ?? 'red';
            options.x = globalOptions.initialX + (Math.cos(Math.PI + globalOptions.angle * 0.4) * globalOptions.radius) / 2;
            options.y = globalOptions.initialY + (Math.sin(Math.PI - globalOptions.angle * 0.8) * globalOptions.radius) / 2;
            options.controlPointX = globalOptions.initialX - globalOptions.radius * 2;
            options.controlPointY = globalOptions.initialY;
            options.posX = globalOptions.initialX + (Math.cos(Math.PI - globalOptions.angle * 0.4) * globalOptions.radius) / 2;
            options.posY = globalOptions.initialY - (Math.sin(Math.PI - globalOptions.angle * 0.8) * globalOptions.radius) / 2;
            options.display = 'none';
            break;
        case 'shipGuideGroupOptions':
            options.id = 'ship-guide-group-tag';
            options.display = globalOptions.guide ? 'inline' : 'none';
            break;
        case 'shipGuideOptions':
            options.id = 'ship-guide-circle';
            options.cx = globalOptions.initialX;
            options.cy = globalOptions.initialY;
            options.r = options.r ?? globalOptions.radius;
            options.stroke = options.stroke ?? 'white';
            options.collisionStroke = options.collisionStroke ?? 'red';
            options.fill = options.fill ?? 'rgba(0, 0, 0, .4)';
            break;
        case 'guideWaypoints':
            options.fill = 'white';
            options.stroke = 'rgba(255,255,255, 0.5)';
            options.strokeWidth = '1px';
            options.d = '';
            break;
        case 'asteroidClass':
            options.class = 'asteroid';
            options.lineWidth = options.lineWidth ?? 1.75;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.groupId = `group-tag-${options.id}`;
            options.initialX = options.initialX ?? 0;
            options.initialY = options.initialY ?? 0;
            options.x = options.x ?? Math.random() * gameNode.clientWidth;
            options.y = options.y ?? Math.random() * gameNode.clientHeight;
            options.density = options.density ?? 1;
            options.mass = options.mass ?? 5000;
            options.pushForce = options.pushForce ?? 8000000;
            options.radius = options.radius ?? Math.sqrt(options.mass / options.density / Math.PI);
            options.noise = options.noise ?? 0.5; // 0.75
            options.guide = options.guide ?? false;
            break;
        case 'asteroidGroupTag':
            options.class = 'asteroid-group-tag';
            break;
        case 'asteroidGuide':
            options.id = `guide-${globalOptions.id}`;
            options.class = 'asteroid-guide';
            options.stroke = options.stroke ?? 'white';
            options.collisionStroke = options.collisionStroke ?? 'red';
            options.fill = options.fill ?? 'rgba(0, 0, 0, .4)';
            options.cx = 0;
            options.cy = 0;
            options.r = globalOptions.radius;
            break;
        case 'asteroidGuideGroupTag':
            options.id = `guide-${globalOptions.id}`;
            options.display = globalOptions.guide ? 'inline' : 'none';
            break;
        case 'projectileClass':
            options.class = 'projectile';
            options.lineWidth = options.lineWidth ?? 3;
            options.stroke = options.stroke ?? 'yellow';
            options.fill = options.fill ?? 'red';
            options.density = options.density ?? 0.001;
            options.mass = options.mass ?? 0.025;
            options.radius = Math.sqrt(options.mass / options.density / Math.PI);
            options.lifetime = options.lifetime ?? 6;
            options.life = options.life ?? 1.0;
            break;
        case 'collisionLine':
            options.class = 'collision-line';
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            break;
        case 'gameOverWrapper':
            options.id = 'game-over-wrapper';
            options.class = options.class ?? 'message-group message-wrapper ';
            break;
        case 'gameOverMessage':
            options.id = 'game-over-message';
            options.innerHTML = options.innerHTML ?? 'Game Over';
            options.class = options.class ?? 'text message-text';
            break;
        case 'gameOverResult':
            options.id = 'game-over-result';
            options.innerHTML = options.innerHTML ?? 'Your Score: ';
            options.class = options.class ?? 'text message-text';
            break;
        case 'gameOverSpaceBar':
            options.id = 'game-over-press-space-bar';
            options.innerHTML = options.innerHTML ?? 'Press Enter to play again';
            options.class = options.class ?? 'text message-text';
            break;
        case 'levelIndicatorWrapper':
            options.id = 'level-indicator-wrapper';
            options.class = options.class ?? 'message-wrapper text';
            break;
    }
    return options;
};

export default $helpers;
