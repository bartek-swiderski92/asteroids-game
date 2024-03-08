/** @format */
import $helpers from '../modules/helpers.js';

const $svg = {};
const $svg_private = {};

$svg_private.allowedAttributes = ['id', 'class', 'd', 'fill', 'stroke', 'strokeWidth'];

/**
 * @public
 * @description
 * Creates an svg element and assigns appropriate attributes
 * @param {String} elementType name of the svg element
 * @param {Object} attributes options defining the element
 * @returns {Object} svg element
 * */
$svg_private.setBasicAttributes = function (elementType, attributes = {}) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    let filteredAttributes = $svg_private.filterAttributes(attributes);
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
$svg_private.filterAttributes = function (options) {
    let filteredObject = {};
    Object.keys(options).forEach((key) => {
        if ($svg_private.allowedAttributes.indexOf(key) !== -1) {
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
$svg_private.buildShipCoordinatesObject = function (options) {
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
 * @param {Object} options options defining the element
 * @param {Object} coordinates coordinates of the ship
 * @returns {Object} dAttribute
 */
$svg_private.buildDAttributeForShip = function (options, coordinates) {
    let {x, y, guide, radius} = options;
    let dAttribute = `M ${coordinates.startingPoint.posX} ${coordinates.startingPoint.posY}`;
    coordinates.waypoints.forEach((waypoint) => {
        let {controlPointX, controlPointY, posX, posY} = waypoint;
        dAttribute += `Q ${controlPointX} ${controlPointY} ${posX} ${posY}`;
    });
    if (guide) {
        const pointRadius = 0.02 * radius;
        coordinates.waypoints.forEach((waypoint) => {
            let {guidelineX, guidelineY, controlPointX, controlPointY} = waypoint;
            if (waypoint.guidelineX) {
                dAttribute += `M ${x} ${y} L ${guidelineX} ${guidelineY} M ${controlPointX - pointRadius} ${controlPointY} a ${pointRadius} ${pointRadius} 0 1 0 ${pointRadius * 2} 0 a ${pointRadius} ${pointRadius} 0 1 0 ${-pointRadius * 2} 0`;
            }
        });
    }
    return dAttribute;
};
/**
 * @public
 * @description
 * Gets coordinates and the d attribute, sets all attributes and appends the ship in the game node
 * @param {Object} gameNode the svg game node
 * @param {Object} options options defining the element
 * @returns void
 */
$svg_private.drawShipPaths = function (gameNode, options) {
    const coordinates = $svg_private.buildShipCoordinatesObject(options);
    options.d = $svg_private.buildDAttributeForShip(options, coordinates);

    const outputElement = $svg_private.setBasicAttributes('path', options);

    gameNode.appendChild(outputElement);
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
    options = $helpers.assignDefaultValues('shipSVG', options, gameNode);
    $svg_private.drawShipPaths(gameNode, options);
};
export default $svg;
