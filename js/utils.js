var Constants = require('./constants'),
    Sylvester = require('sylvester'),
    Utils = {};

module.exports = Utils;

Utils.vectorToOrientation = function (vector) {
    return Math.atan2(vector.e(Constants.Y), vector.e(Constants.X)) + (Math.PI / 2);
};

Utils.vectorMagnitude = function (vector) {
    return vector.distanceFrom($V([0,0]));
};

Utils.random = function(range) {
    return Math.floor(Math.random() * range);
};

Utils.randomRange = function(min, max) {
    return min + (Math.random() * (max - min));
};

Utils.randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.clamp = function(min, max, value) {
    if(value < min) {
        return min;
    } else if(value > max) {
        return max;
    } else {
        return value;
    }
};
