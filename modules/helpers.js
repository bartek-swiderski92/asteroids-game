/** @format */

const $helpers = {};

$helpers.handleKeyPress = function (event, value, ship) {
    let nothingHandled;
    switch (event.key || event.keyCode) {
        case 'ArrowUp':
        case '38':
            ship.thrusterOn = value;
            break;
        case 'ArrowLeft':
        case '37':
            ship.leftThrusterOn = value;
            break;
        case 'ArrowRight':
        case '39':
            ship.rightThrusterOn = value;
            break;
        case 'g':
        case '71':
            if (value) game.guide = !game.guide;
            ship.rightThrusterOn = value;
            break;
        default:
            nothingHandled = true;
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
 * Assigns default values for the game objects
 * @param {String} gameElement name of the game element
 * @param {Object} options options defining the element
 * @param {Object} gameNode the svg game node
 * @returns {Object} options
 * */

$helpers.assignDefaultValues = function (gameElement, options = {}, gameNode, globalOptions) {
    switch (gameElement) {
        case 'grid':
            options.id = 'grid';
            options.minor = options.minor ?? 10;
            options.major = options.major ?? options.minor * 5;
            options.lineColor = options.lineColor ?? '#00FF00';
            options.textColor = options.textColor ?? '#009900';
            break;
        case 'shipGuide':
            options.id = 'ship-guide';
            options.cx = globalOptions.initialX;
            options.cy = globalOptions.initialY;
            options.r = options.r ?? globalOptions.radius;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'rgba(0, 0, 0, .4)';
            break;
        case 'guideWaypoints':
            options.fill = 'white';
            options.stroke = 'rgba(255,255,255, 0.5';
            options.strokeWidth = '1px';
            options.d = '';
            break;
        case 'massClass':
            options.mass = options.mass ?? 1;
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? 0;
            options.xSpeed = options.xSpeed ?? 0;
            options.ySpeed = options.ySpeed ?? 0;
            options.rotationSpeed = options.rotationSpeed ?? 0;
            break;
        case 'shipClass':
            options.id = options.id ?? 'ship';
            options.groupId = options.groupId ?? 'ship-group-tag';
            options.initialX = options.initialX ?? 0;
            options.initialY = options.initialY ?? 0;
            options.x = options.x ?? gameNode.clientWidth / 2;
            options.y = options.y ?? gameNode.clientHeight / 2;
            options.mass = options.mass ?? 10;
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? (0.5 * Math.PI) / 2;
            options.rotateValue = options.rotateValue ?? -(0.5 * Math.PI);
            options.thrusterPower = options.thrusterPower ?? 1;
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.curve1 = options.curve1 ?? 0.25;
            options.curve2 = options.curve2 ?? 0.75;
            options.guide = options.guide ?? false;
            break;
        case 'groupTagSVG':
            options.id = 'ship-group-tag';
            break;
        case 'shipFlame':
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
    }
    return options;
};

export default $helpers;
