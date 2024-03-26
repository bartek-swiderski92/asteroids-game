/** @format */
import $helpers from '../modules/helpers.js';

const $svg = {};
const $svgPrivate = {};

$svgPrivate.allowedAttributes = ['id', 'class', 'd', 'fill', 'stroke', 'strokeWidth', 'r', 'cx', 'cy', 'display', 'x', 'y', 'height', 'width', 'innerHTML', 'textAnchor'];

$svgPrivate.drawCircle = function (options = {}) {
    let circle = $svgPrivate.setBasicAttributes('circle', options);
    return circle;
};

$svg.drawCollisionLine = function (gameNode, lineElement, obj1, obj2, options = {}) {
    if (lineElement == undefined) {
        const lineElement = $svgPrivate.setBasicAttributes('line', options);
        gameNode.appendChild(lineElement);
    } else {
        lineElement.setAttribute('x1', obj1.x);
        lineElement.setAttribute('x2', obj2.x);
        lineElement.setAttribute('y1', obj1.y);
        lineElement.setAttribute('y2', obj2.y);
    }
};

$svg.drawGrid = function (gameNode, gameInstance, options = {}) {
    options = $helpers.assignDefaultValues('grid', options, gameNode, gameInstance);
    const {minor, major, lineColor, textColor} = options;
    const boardWidth = gameNode.clientWidth;
    const boardHeight = gameNode.clientHeight;
    const gridGTag = $svgPrivate.setBasicAttributes('g', options);

    for (let x = 0; x < boardWidth; x += minor) {
        let lineEl;
        if (x % major === 0) {
            let coordinates = /*html*/ `<text x="${x}" y="10" fill="${textColor}" font-size="10">${x}</text>`;
            gridGTag.innerHTML += coordinates;
            lineEl = /*html*/ `<line x1="${x}" y1="0" x2="${x}" y2="${boardHeight}" stroke=${lineColor} stroke-width="1"/>`;
        } else {
            lineEl = /*html*/ `<line x1="${x}" y1="0" x2="${x}" y2="${boardHeight}" stroke=${lineColor} stroke-width=".5"/>`;
        }
        gridGTag.innerHTML += lineEl;
    }

    for (let y = 0; y < boardHeight; y += minor) {
        let lineEl;
        if (y % major === 0) {
            let coordinates = /*html*/ `<text x="0" y="${y + 10}" fill="${textColor}" font-size="10">${y}</text>`;
            lineEl = /*html*/ `<line x1="0" y1="${y}" x2="${boardWidth}" y2="${y}" stroke=${lineColor} stroke-width="1"/>`;
            gridGTag.innerHTML += coordinates;
        } else {
            lineEl = /*html*/ `<line x1="0" y1="${y}" x2="${boardWidth}" y2="${y}" stroke=${lineColor} stroke-width=".5"/>`;
        }

        gridGTag.innerHTML += lineEl;
    }
    gameNode.appendChild(gridGTag);
};
$svgPrivate.drawHealthBar = function (options) {
    const groupHpTag = $svgPrivate.setBasicAttributes('g', options.groupHpTag);
    const hpText = $svgPrivate.setBasicAttributes('text', options.hpText);
    const currentHpText = $svgPrivate.setBasicAttributes('text', options.currentHpText);

    const groupHpBar = $svgPrivate.setBasicAttributes('g', options.groupHpBar);
    const maxHpBar = $svgPrivate.setBasicAttributes('rect', options.maxHpBar);
    const currentHpBar = $svgPrivate.setBasicAttributes('rect', options.currentHpBar);

    groupHpBar.appendChild(maxHpBar);
    groupHpBar.appendChild(currentHpBar);

    groupHpTag.appendChild(hpText);
    groupHpTag.appendChild(groupHpBar);
    groupHpTag.appendChild(currentHpText);

    return groupHpTag;
};

$svgPrivate.drawLevel = function (options) {
    const levelElement = $svgPrivate.setBasicAttributes('text', options.currentLevel);
    return levelElement;
};
$svgPrivate.drawScore = function (options) {
    const groupScoreTag = $svgPrivate.setBasicAttributes('g', options.groupScoreTag);

    const scoreLabel = $svgPrivate.setBasicAttributes('text', options.scoreLabel);
    const currentScore = $svgPrivate.setBasicAttributes('text', options.currentScore);

    groupScoreTag.appendChild(scoreLabel);
    groupScoreTag.appendChild(currentScore);

    return groupScoreTag;
};
$svgPrivate.drawFps = function (options) {
    const groupScoreTag = $svgPrivate.setBasicAttributes('g', options.groupFpsTag);

    const scoreLabel = $svgPrivate.setBasicAttributes('text', options.fpsLabel);
    const currentScore = $svgPrivate.setBasicAttributes('text', options.currentFps);

    groupScoreTag.appendChild(scoreLabel);
    groupScoreTag.appendChild(currentScore);

    return groupScoreTag;
};

$svg.drawUI = function (UIOptions, gameNode) {
    const hpBar = $svgPrivate.drawHealthBar(UIOptions.hpBar);
    const level = $svgPrivate.drawLevel(UIOptions.level, gameNode);
    const score = $svgPrivate.drawScore(UIOptions.score);
    const fps = $svgPrivate.drawFps(UIOptions.fps);

    gameNode.appendChild(hpBar);
    gameNode.appendChild(level);
    gameNode.appendChild(score);
    gameNode.appendChild(fps);
};

$svg.transformHealthBar = function (shipInstance) {
    //TODO removed hardcoded values once settings.json is implemented
    const currentHpBarEl = document.getElementById('current-hp-bar');
    const maxHpBarEl = document.getElementById('max-hp-bar');
    const currentHpTextEl = document.getElementById('current-hp-text');
    const maxHpWidth = maxHpBarEl?.getAttribute('width') - 2 * maxHpBarEl?.getAttribute('stroke-width');
    currentHpTextEl.innerHTML = `${parseInt(shipInstance.health)}/${parseInt(shipInstance.maxHealth)}`;

    let calculatedHpBarWidth = (maxHpWidth * shipInstance.health) / shipInstance.maxHealth;
    currentHpBarEl?.setAttribute('width', isFinite(calculatedHpBarWidth) ? calculatedHpBarWidth : maxHpWidth);
};

/**
 * @public
 * @description
 * Creates an svg element and assigns appropriate attributes
 * @param {String} elementType name of the svg element
 * @param {Object} attributes options defining the element
 * @returns {Object} svg element
 * */
$svgPrivate.setBasicAttributes = function (elementType, attributes = {}, svg = true) {
    let element;
    if (svg) {
        element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    } else {
        element = document.createElement(elementType);
    }
    let filteredAttributes = $svgPrivate.filterAttributes(attributes);
    Object.keys(filteredAttributes).forEach((key) => {
        if (key === 'innerHTML') {
            element.innerHTML = filteredAttributes[key];
        } else {
            element.setAttribute($helpers.kebabToCamelCase(key), filteredAttributes[key]);
        }
    });
    return element;
};

/**
 * @public
 * @description
 * Builds the coordinates object for the ship
 * @param {Object} options options defining the element
 * @returns {Object}
 * */
$svgPrivate.filterAttributes = function (options) {
    let filteredObject = {};
    Object.keys(options).forEach((key) => {
        if ($svgPrivate.allowedAttributes.indexOf(key) !== -1) {
            filteredObject[key] = options[key];
        }
    });
    return filteredObject;
};
/**
 * @public
 * @description
 * Builds the coordinates object for the ship
 * @param {Object} options options defining the element
 * @returns {Object}
 * */
$svgPrivate.buildShipCoordinatesObject = function (options) {
    let {initialX, initialY, radius, angle, curve1, curve2} = options;
    return {
        startingPoint: {posX: initialX + radius, posY: initialY},
        waypoints: [
            {
                controlPointX: Math.cos(angle) * radius * curve2 + initialX,
                controlPointY: Math.sin(angle) * radius * curve2 + initialY,
                posX: initialX + Math.cos(Math.PI - angle) * radius,
                posY: initialY + Math.sin(Math.PI - angle) * radius,
                guidelineX: initialX + Math.cos(angle) * radius,
                guidelineY: initialY + Math.sin(angle) * radius
            },
            {
                controlPointX: -radius * curve1 + initialX,
                controlPointY: initialY,
                posX: initialX + Math.cos(Math.PI + angle) * radius,
                posY: initialY + Math.sin(Math.PI + angle) * radius,
                guidelineX: initialX - radius,
                guidelineY: initialY
            },
            {
                controlPointX: Math.cos(-angle) * radius * curve2 + initialX,
                controlPointY: Math.sin(-angle) * radius * curve2 + initialY,
                posX: initialX + radius,
                posY: initialY,
                guidelineX: initialX + Math.cos(angle) * radius,
                guidelineY: initialY - Math.sin(angle) * radius
            }
        ]
    };
};
/**
 * @public
 * @description
 * Builds the d attribute for the ship
 * @param {Object} options options defining the ship's flame element
 * @returns {String} dAttribute
 */
$svgPrivate.buildDAttributeForFlame = function (options) {
    return `M ${options.x} ${options.y} Q ${options.controlPointX} ${options.controlPointY} ${options.posX} ${options.posY}`;
};
/**
 * @public
 * @description
 * Draws ship's flame and appends it in game
 * @param {Object} parentNode the svg game node
 * @param {Object} options options defining the element
 * @returns void
 */
$svg.drawFlame = function (parentNode, options) {
    options.d = $svgPrivate.buildDAttributeForFlame(options);
    let shipFlameNode = $svgPrivate.setBasicAttributes('path', options);
    parentNode.appendChild(shipFlameNode);
};
/**
 * @public
 * @description
 * Builds the d attribute for the ship, modifies guideWaypoints where necessary
 * @param {Object} options options defining the element
 * @param {Object} coordinates coordinates of the ship
 * @returns {String} dAttribute
 */
$svgPrivate.buildDAttributeForShip = function (options, coordinates) {
    let {initialX, initialY, guide, radius} = options;
    let dAttribute = `M ${coordinates.startingPoint.posX} ${coordinates.startingPoint.posY}`;
    coordinates.waypoints.forEach((waypoint) => {
        let {controlPointX, controlPointY, posX, posY} = waypoint;
        dAttribute += `Q ${controlPointX} ${controlPointY} ${posX} ${posY}`;
    });
    const pointRadius = 0.02 * radius;
    options.guideWaypoints = $helpers.assignDefaultValues('guideWaypoints');

    coordinates.waypoints.forEach((waypoint) => {
        let {guidelineX, guidelineY, controlPointX, controlPointY} = waypoint;

        options.guideWaypoints.d += `M ${initialX} ${initialY} L ${guidelineX} ${guidelineY} M ${controlPointX - pointRadius} ${controlPointY} a ${pointRadius} ${pointRadius} 0 1 0 ${pointRadius * 2} 0 a ${pointRadius} ${pointRadius} 0 1 0 ${-pointRadius * 2} 0`;
    });

    return dAttribute;
};
/**
 * @public
 * @description
 * Gets coordinates and the d attribute, sets all attributes and appends the ship in the game node
 * @param {Object} parentNode the svg game node
 * @param {Object} options options defining the element
 * @returns void
 */
$svgPrivate.drawShipPaths = function (parentNode, guideNode, shipInstance) {
    const coordinates = $svgPrivate.buildShipCoordinatesObject(shipInstance);
    shipInstance.d = $svgPrivate.buildDAttributeForShip(shipInstance, coordinates);

    const outputElement = $svgPrivate.setBasicAttributes('path', shipInstance);
    const waypoints = $svgPrivate.setBasicAttributes('path', shipInstance.guideWaypoints);
    guideNode.appendChild(waypoints);

    parentNode.appendChild(outputElement);
};

$svgPrivate.drawShipGuide = function (groupTag, options) {
    let guideCircle = $svgPrivate.drawCircle(options);
    groupTag.appendChild(guideCircle);
};

$svgPrivate.drawShipShield = function (shipGroupTag, options) {
    let shieldCircle = $svgPrivate.drawCircle(options);
    shipGroupTag.appendChild(shieldCircle);
};

/**
 * @public
 * @description
 * Gets the default values and draws the ship
 * @param {Object} gameNode the svg game node
 * @param {Object} options options defining the element
 * @returns void
 */
$svg.drawShip = function (gameNode, shipInstance) {
    const nestedOptionsObjects = ['shipGroupOptions', 'shipFlameOptions', 'shipGuideOptions', 'shipGuideGroupOptions', 'shipShieldOptions'];
    nestedOptionsObjects.forEach((optionObject) => {
        shipInstance[optionObject] = $helpers.assignDefaultValues(optionObject, shipInstance[optionObject], gameNode, shipInstance);
    });

    const shipGroupTag = $svgPrivate.setBasicAttributes('g', shipInstance.shipGroupOptions);
    $svg.drawFlame(shipGroupTag, shipInstance.shipFlameOptions);

    const guideGroupTag = $svgPrivate.setBasicAttributes('g', shipInstance.shipGuideGroupOptions);
    $svgPrivate.drawShipGuide(guideGroupTag, shipInstance.shipGuideOptions);
    $svgPrivate.drawShipShield(shipGroupTag, shipInstance.shipShieldOptions);

    $svgPrivate.drawShipPaths(shipGroupTag, guideGroupTag, shipInstance);
    shipGroupTag.appendChild(guideGroupTag);
    return shipGroupTag;
};

$svgPrivate.buildAsteroidDAttribute = function (options) {
    const {segments, noise, radius} = options;
    let coordinates = 'M';
    for (let i = 0; i < segments; i++) {
        const randomX = (Math.random() / 1.3) * noise;
        const randomY = (Math.random() / 1.3) * noise;
        const angle = (i / segments) * 2 * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = radius * cos - radius * cos * randomX;
        const y = radius * sin - radius * sin * randomY;
        coordinates += `${x}, ${y} `;
    }
    coordinates += 'Z';
    return coordinates;
};

$svgPrivate.createAsteroidsElement = function (options) {
    options.d = $svgPrivate.buildAsteroidDAttribute(options);
    const pathElement = $svgPrivate.setBasicAttributes('path', options);

    return pathElement;
};

$svg.drawAsteroid = function (gameNode, asteroidInstance) {
    const asteroidGroupTagOptions = $helpers.assignDefaultValues('asteroidGroupTag', {id: asteroidInstance.groupId}, gameNode, asteroidInstance);
    const asteroidGroupTag = $svgPrivate.setBasicAttributes('g', asteroidGroupTagOptions);
    const asteroidsElement = $svgPrivate.createAsteroidsElement(asteroidInstance);

    //Setting up guide
    let guideCircleOptions = $helpers.assignDefaultValues('asteroidGuide', {}, gameNode, asteroidInstance);
    const guideCircle = $svgPrivate.drawCircle(guideCircleOptions);
    const guideGroupTag = $helpers.assignDefaultValues('asteroidGuideGroupTag', {}, gameNode, asteroidInstance);
    const asteroidGuideGroupTag = $svgPrivate.setBasicAttributes('g', guideGroupTag);
    asteroidGuideGroupTag.appendChild(guideCircle);
    asteroidGroupTag.appendChild(asteroidGuideGroupTag);
    asteroidInstance.guideOptions = guideCircleOptions;

    asteroidGroupTag.appendChild(asteroidsElement);
    return asteroidGroupTag;
};

$svg.drawProjectile = function (gameNode, projectileInstance) {
    let projectileClone = structuredClone(projectileInstance);
    projectileClone.cx = 0;
    projectileClone.cy = 0;
    projectileClone.r = projectileInstance.radius;

    let projectile = $svgPrivate.drawCircle(projectileClone);
    return projectile;
};

$svg.drawExplosion = function (explosionInstance) {
    const groupTagOptions = $helpers.assignDefaultValues('explosionGroupTag', {}, {}, explosionInstance);
    const explosionElementOptions = $helpers.assignDefaultValues('explosionElement', {}, {}, explosionInstance);
    let explosionGroupTag = $svgPrivate.setBasicAttributes('g', groupTagOptions);
    for (let i = 0; i < explosionInstance.explosionNumber; i++) {
        let explosionElement = $svgPrivate.setBasicAttributes('circle', explosionElementOptions);
        explosionGroupTag.appendChild(explosionElement);
    }
    return explosionGroupTag;
};

$svgPrivate.displayMessage = function (string, options, gameNode) {
    const messageNode = $svgPrivate.setBasicAttributes('text', options);
    gameNode.appendChild(messageNode);
};

$svg.displayGameOverMessage = function (gameInstance, parentNode) {
    $helpers.clearNode(parentNode);

    gameInstance.gameOverSettings.gameOverWrapper = $helpers.assignDefaultValues('gameOverWrapper', gameInstance.gameOverSettings.gameOverWrapper);
    gameInstance.gameOverSettings.gameOverMessage = $helpers.assignDefaultValues('gameOverMessage', gameInstance.gameOverSettings.gameOver);
    gameInstance.gameOverSettings.gameOverResult = $helpers.assignDefaultValues('gameOverResult', gameInstance.gameOverSettings.gameOverResult);
    gameInstance.gameOverSettings.gameOverSpaceBar = $helpers.assignDefaultValues('gameOverSpaceBar', gameInstance.gameOverSettings.gameOverSpaceBar);

    const gameOverWrapper = $svgPrivate.setBasicAttributes('div', gameInstance.gameOverSettings.gameOverWrapper, false);
    const gameOverMessage = $svgPrivate.setBasicAttributes('div', gameInstance.gameOverSettings.gameOverMessage, false);
    const gameOverResult = $svgPrivate.setBasicAttributes('div', gameInstance.gameOverSettings.gameOverResult, false);
    const gameOverSpaceBar = $svgPrivate.setBasicAttributes('div', gameInstance.gameOverSettings.gameOverSpaceBar, false);
    gameOverResult.innerHTML += Math.round(isFinite(gameInstance.score) ? gameInstance.score : 0);

    gameOverWrapper.appendChild(gameOverMessage);
    gameOverWrapper.appendChild(gameOverResult);
    gameOverWrapper.appendChild(gameOverSpaceBar);
    parentNode.appendChild(gameOverWrapper);
};

$svg.displayLevelIndicator = function (gameInstance, parentNode, timeout) {
    $helpers.clearNode(parentNode);
    const levelString = `Level: ${gameInstance.level}`;
    const displayLevelIndicator = document.getElementById('current-level');
    displayLevelIndicator.innerHTML = levelString;
    const levelIndicatorWrapperOptions = $helpers.assignDefaultValues('levelIndicatorWrapper', {});
    const levelIndicatorWrapperDiv = $svgPrivate.setBasicAttributes('div', levelIndicatorWrapperOptions, false);

    levelIndicatorWrapperDiv.innerHTML = levelString;
    parentNode.appendChild(levelIndicatorWrapperDiv);

    setTimeout(() => {
        parentNode.querySelector(`#${levelIndicatorWrapperOptions.id}`)?.remove();
    }, timeout);
};

export default $svg;
