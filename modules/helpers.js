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
            options.id = options.id ?? 'grid';
            options.minor = options.minor ?? 10;
            options.major = options.major ?? options.minor * 5;
            options.lineColor = options.lineColor ?? '#00FF00';
            options.textColor = options.textColor ?? '#009900';
            break;
        case 'shipGuide':
            options.id = options.id ?? 'ship-guide';
            options.angle = globalOptions.angle ?? 0;
            options.cx = globalOptions.x;
            options.cy = globalOptions.y;
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
            options.x = options.x ?? gameNode.clientWidth / 2;
            options.y = options.y ?? gameNode.clientHeight / 2;
            options.mass = options.mass ?? 10;
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? (0.5 * Math.PI) / 2;
            options.thrusterPower = options.thrusterPower ?? 1;
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.curve1 = options.curve1 ?? 0.25;
            options.curve2 = options.curve2 ?? 0.75;
            options.guide = options.guide ?? false;
            break;
        case 'groupTagSVG':
            options.id = options.id ?? 'ship-group-tag';
            break;
        case 'shipFlame':
            options.id = options.id ?? 'ship-flame';
            options.lineWidth = options.lineWidth ?? 3;
            options.stroke = options.stroke ?? 'yellow';
            options.fill = options.fill ?? 'red';
            options.shipAngle = globalOptions.angle;
            options.shipRadius = globalOptions.radius;
            options.x = globalOptions.x + (Math.cos(Math.PI + options.shipAngle * 0.4) * options.shipRadius) / 2;
            options.y = globalOptions.y + (Math.sin(Math.PI - options.shipAngle * 0.8) * options.shipRadius) / 2;
            options.controlPointX = globalOptions.x - options.shipRadius * 2;
            options.controlPointY = globalOptions.y;
            options.posX = globalOptions.x + (Math.cos(Math.PI - options.shipAngle * 0.4) * options.shipRadius) / 2;
            options.posY = globalOptions.y - (Math.sin(Math.PI - options.shipAngle * 0.8) * options.shipRadius) / 2;
            break;
    }
    return options;
};

export default $helpers;
