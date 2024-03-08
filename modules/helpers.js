/** @format */

const $helpers = {};

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

$helpers.assignDefaultValues = function (gameElement, options, gameNode) {
    switch (gameElement) {
        case 'shipSVG':
            options.id = options.id ?? 'ship';
            options.x = options.x ?? gameNode.clientWidth / 2;
            options.y = options.y ?? gameNode.clientHeight / 2;
            options.radius = options.radius ?? 50;
            options.class = options.class ?? 'ship';
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.angle = (options.angle ?? 0.5 * Math.PI) / 2;
            options.curve1 = options.curve1 ?? 0.25;
            options.curve2 = options.curve2 ?? 0.75;
            options.guide = options.guide ?? false;
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
            options.x = options.x ?? gameNode.clientWidth / 2;
            options.y = options.y ?? gameNode.clientHeight / 2;
            options.mass = options.mass ?? 10;
            options.radius = options.radius ?? 30;
            options.angle = options.angle ?? 1.5 * Math.PI;
            options.thrusterPower = options.thrusterPower ?? 1000;
            options.thrusterOn = options.thrusterOn ?? false;
            break;
    }
    return options;
};

export default $helpers;
