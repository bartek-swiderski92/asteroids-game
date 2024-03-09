/** @format */
import $helpers from '../modules/helpers.js';

const $svg = {};
const $svgPrivate = {};

$svgPrivate.allowedAttributes = ['id', 'class', 'd', 'fill', 'stroke', 'strokeWidth', 'r', 'cx', 'cy'];

$svgPrivate.drawCircle = function (options = {}) {
    let circle = $svgPrivate.setBasicAttributes('circle', options);
    return circle;
};

$svg.drawGrid = function (gameNode, options = {}) {
    options = $helpers.assignDefaultValues('grid', options);
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
    let {x, y, radius, angle, curve1, curve2} = options;
    return {
        startingPoint: {posX: x + radius, posY: y},
        waypoints: [
            {
                controlPointX: Math.cos(angle) * radius * curve2 + x,
                controlPointY: Math.sin(angle) * radius * curve2 + y,
                posX: x + Math.cos(Math.PI - angle) * radius,
                posY: y + Math.sin(Math.PI - angle) * radius,
                guidelineX: x + Math.cos(angle) * radius,
                guidelineY: y + Math.sin(angle) * radius
            },
            {
                controlPointX: -radius * curve1 + x,
                controlPointY: y,
                posX: x + Math.cos(Math.PI + angle) * radius,
                posY: y + Math.sin(Math.PI + angle) * radius,
                guidelineX: x - radius,
                guidelineY: y
            },
            {
                controlPointX: Math.cos(-angle) * radius * curve2 + x,
                controlPointY: Math.sin(-angle) * radius * curve2 + y,
                posX: x + radius,
                posY: y,
                guidelineX: x + Math.cos(angle) * radius,
                guidelineY: y - Math.sin(angle) * radius
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
 * Builds the d attribute for the ship
 * @param {Object} options options defining the element
 * @param {Object} coordinates coordinates of the ship
 * @returns {String} dAttribute
 */
$svgPrivate.buildDAttributeForShip = function (options, coordinates) {
    let {x, y, guide, radius} = options;
    let dAttribute = `M ${coordinates.startingPoint.posX} ${coordinates.startingPoint.posY}`;
    coordinates.waypoints.forEach((waypoint) => {
        let {controlPointX, controlPointY, posX, posY} = waypoint;
        dAttribute += `Q ${controlPointX} ${controlPointY} ${posX} ${posY}`;
    });
    if (guide) {
        const pointRadius = 0.02 * radius;
        options.guideWaypoints = {
            fill: 'white',
            stroke: 'white',
            strokeWidth: '1px',
            d: ''
            // d: `M ${x} ${y} L ${guidelineX} ${guidelineY} M ${controlPointX - pointRadius} ${controlPointY} a ${pointRadius} ${pointRadius} 0 1 0 ${pointRadius * 2} 0 a ${pointRadius} ${pointRadius} 0 1 0 ${-pointRadius * 2} 0`
        };
        coordinates.waypoints.forEach((waypoint) => {
            let {guidelineX, guidelineY, controlPointX, controlPointY} = waypoint;

            options.guideWaypoints.d += `M ${x} ${y} L ${guidelineX} ${guidelineY} M ${controlPointX - pointRadius} ${controlPointY} a ${pointRadius} ${pointRadius} 0 1 0 ${pointRadius * 2} 0 a ${pointRadius} ${pointRadius} 0 1 0 ${-pointRadius * 2} 0`;
        });
    }
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
    console.log(waypoints);
    options.guideGroupTag.appendChild(waypoints);
    parentNode.appendChild(outputElement);
};

$svgPrivate.drawShipGuide = function (groupTag, options) {
    // console.log(options);
    let guideCircle = $svgPrivate.drawCircle(options);
    console.log(guideCircle);
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
    if (options.guide) {
        guideGroupTag = $svgPrivate.setBasicAttributes('g', {id: 'guide'});
        let guideOptions = options.guideOptions ?? {};
        guideOptions = $helpers.assignDefaultValues('shipGuide', guideOptions, gameNode, options);
        $svgPrivate.drawShipGuide(guideGroupTag, guideOptions);
        options.guideGroupTag = guideGroupTag;
    }
    shipGroupTag.appendChild(guideGroupTag);
    $svgPrivate.drawShipPaths(shipGroupTag, options);
    gameNode.appendChild(shipGroupTag);
};

export default $svg;
