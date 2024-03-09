/** @format */

const $helpers = {};
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

$helpers.assignDefaultValues = function (gameElement, options, gameNode, globalOptions) {
    switch (gameElement) {
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
            options.radius = options.radius ?? 50;
            options.angle = options.angle ?? (0.5 * Math.PI) / 2;
            options.thrusterPower = options.thrusterPower ?? 1000;
            options.thrusterOn = options.thrusterOn ?? false;
            options.lineWidth = options.lineWidth ?? 0.5;
            options.stroke = options.stroke ?? 'white';
            options.fill = options.fill ?? 'black';
            options.curve1 = options.curve1 ?? 0.25;
            options.curve2 = options.curve2 ?? 0.75;
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
            options.x = globalOptions.x + (Math.cos(Math.PI + options.shipAngle * 0.4) * options.shipRadius) / 2; //- options.shipRadius;
            options.y = globalOptions.y + (Math.sin(Math.PI - options.shipAngle * 0.8) * options.shipRadius) / 2; //+ options.shipRadius;
            options.controlPointX = globalOptions.x - options.shipRadius * 2;
            options.controlPointY = globalOptions.y;
            options.posX = globalOptions.x + (Math.cos(Math.PI - options.shipAngle * 0.4) * options.shipRadius) / 2;
            options.posY = globalOptions.y - (Math.sin(Math.PI - options.shipAngle * 0.8) * options.shipRadius) / 2;
            break;
        // case 'shipSVG':
        //     // options.id = options.id ?? 'ship';
        //     // options.x = options.x ?? gameNode.clientWidth / 2;
        //     // options.y = options.y ?? gameNode.clientHeight / 2;
        //     // options.radius = options.radius ?? 50;
        //     // options.class = options.class ?? 'ship';
        //     // options.lineWidth = options.lineWidth ?? 0.5;
        //     // options.stroke = options.stroke ?? 'white';
        //     // options.fill = options.fill ?? 'black';
        //     // options.angle = (options.angle ?? 0.5 * Math.PI) / 2;
        //     // options.curve1 = options.curve1 ?? 0.25;
        //     // options.curve2 = options.curve2 ?? 0.75;
        //     // options.guide = options.guide ?? false;
        //     break;
    }
    return options;
};

export default $helpers;
