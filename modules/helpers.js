/** @format */

const $helpers = {};

$helpers.kebabToCamelCase = function (string) {
    return string.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
};

export default $helpers;
