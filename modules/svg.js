/** @format */
import $helpers from '../modules/helpers.js';

const $svg = {};
const $svgPrivate = {};

$svgPrivate.allowedAttributes = ['id', 'class', 'd', 'fill', 'stroke', 'strokeWidth', 'r', 'cx', 'cy', 'display'];

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

/**
 * @public
 * @description
 * Creates an svg element and assigns appropriate attributes
 * @param {String} elementType name of the svg element
 * @param {Object} attributes options defining the element
 * @returns {Object} svg element
 * */
$svgPrivate.setBasicAttributes = function (elementType, attributes = {}) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    let filteredAttributes = $svgPrivate.filterAttributes(attributes);
    Object.keys(filteredAttributes).forEach((key) => {
        element.setAttribute($helpers.kebabToCamelCase(key), filteredAttributes[key]);
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
$svgPrivate.drawShipPaths = function (parentNode, options) {
    const coordinates = $svgPrivate.buildShipCoordinatesObject(options);
    options.d = $svgPrivate.buildDAttributeForShip(options, coordinates);

    const outputElement = $svgPrivate.setBasicAttributes('path', options);
    const waypoints = $svgPrivate.setBasicAttributes('path', options.guideWaypoints);
    options.guideGroupTag.appendChild(waypoints);

    parentNode.appendChild(outputElement);
};

$svgPrivate.drawShipGuide = function (groupTag, options) {
    let guideCircle = $svgPrivate.drawCircle(options);
    groupTag.appendChild(guideCircle);
};

/**
 * @public
 * @description
 * Gets the default values and draws the ship
 * @param {Object} gameNode the svg game node
 * @param {Object} options options defining the element
 * @returns void
 */
$svg.drawShip = function (gameNode, options = {}) {
    let groupTagOptions = options.groupTagOptions ?? {};
    let flameOptions = options.flameOptions ?? {};
    groupTagOptions = $helpers.assignDefaultValues('groupTagSVG', groupTagOptions, gameNode);
    flameOptions = $helpers.assignDefaultValues('shipFlame', flameOptions, gameNode, options);

    const shipGroupTag = $svgPrivate.setBasicAttributes('g', groupTagOptions);
    let guideGroupTag;

    $svg.drawFlame(shipGroupTag, flameOptions);
    let guideGroupTagOptions = $helpers.assignDefaultValues('guideGroupTag', groupTagOptions, gameNode, options);
    guideGroupTag = $svgPrivate.setBasicAttributes('g', guideGroupTagOptions);
    let guideOptions = options.guideOptions ?? {};
    guideOptions = $helpers.assignDefaultValues('shipGuide', guideOptions, gameNode, options);
    $svgPrivate.drawShipGuide(guideGroupTag, guideOptions);
    options.guideGroupTag = guideGroupTag;

    $svgPrivate.drawShipPaths(shipGroupTag, options);
    shipGroupTag.appendChild(guideGroupTag);
    gameNode.appendChild(shipGroupTag);
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
$svgPrivate.crateAsteroidsElement = function (options) {
    options.d = $svgPrivate.buildAsteroidDAttribute(options);
    const pathElement = $svgPrivate.setBasicAttributes('path', options);

    return pathElement;
};
$svg.drawAsteroid = function (gameNode, options = {}) {
    const asteroidGroupTagOptions = $helpers.assignDefaultValues('asteroidGroupTag', {id: options.groupId}, gameNode, options);
    const asteroidGroupTag = $svgPrivate.setBasicAttributes('g', asteroidGroupTagOptions);
    const asteroidsElement = $svgPrivate.crateAsteroidsElement(options);

    //Setting up guide
    let guideCircleOptions = structuredClone(options);
    guideCircleOptions = $helpers.assignDefaultValues('asteroidGuide', guideCircleOptions, gameNode, options);
    const guideCircle = $svgPrivate.drawCircle(guideCircleOptions);
    const guideGroupTag = $helpers.assignDefaultValues('asteroidGuideGroupTag', {}, gameNode, options);
    const asteroidGuideGroupTag = $svgPrivate.setBasicAttributes('g', guideGroupTag);
    asteroidGuideGroupTag.appendChild(guideCircle);
    asteroidGroupTag.appendChild(asteroidGuideGroupTag);

    asteroidGroupTag.appendChild(asteroidsElement);
    gameNode.appendChild(asteroidGroupTag);
};

$svg.drawProjectile = function (gameNode, projectileInstance) {
    let projectileClone = structuredClone(projectileInstance);
    projectileClone.cx = 0;
    projectileClone.cy = 0;
    projectileClone.r = projectileInstance.radius;

    let circle = $svgPrivate.drawCircle(projectileClone);
    gameNode.appendChild(circle);
};

export default $svg;
