var v = require('sylvester');

//Constants
var MAX_SPEED = 15;
var INPUT_SCALE = 0.2;
var FRICTION = 0.92;

//Vector indexes
var X = 1;
var Y = 2;

module.exports = function Player (id, name) {
    var self = this;
    this.id = id;
    this.name = name;
    this._initialized = false;
    this._inputDown = false;
    this._screenSize = null;

    this.initialize = function (options) {
        options = options || {};

        if (self._initialized) {
            console.log('Already initialized!');
            return;
        }

        if (!options.socket) {
            console.log('Socket was not provided for new player');
            return;
        }

        self._socket = options.socket;
        self._screenSize = options.screenSize;

        self.hp = 100;
        self.position = $V([
            Math.random() * options.screenSize.width,
            Math.random() * options.screenSize.height]);
        self.acceleration = $V([0,0]);
        self.orientation = Math.random() * Math.PI * 2;

        self._initialized = true;
    };

    this.initialized = function () {
        return self._initialized;
    };

    this.start = function() {
        self._inputDown = true;
    }
    this.stop = function() {
        self._inputDown = false;
    };

    this.move = function(pos) {
        if (!self._initialized) return;

        var accel = $V([pos.x, pos.y]).x(INPUT_SCALE); // Scale down the thumb stick input
        var magnitude = accel.distanceFrom($V([0,0]));

        if (magnitude > MAX_SPEED)
            accel = accel.toUnitVector().x(MAX_SPEED);

        self.acceleration = accel;
    };

    this.update = function () {
        if (!self._initialized) return;

        if (!self._inputDown)
            self.acceleration = self.acceleration.x(FRICTION);

        self.orientation = Math.atan2(self.acceleration.e(Y), self.acceleration.e(X)) + (Math.PI / 2);
        self.position = self.position.add(self.acceleration);

        //Screen wrapping
        if (self.position.e(X) < 0)
            self.position = $V([self._screenSize.width, self.position.e(Y)]);
        else if (self.position.e(X) > self._screenSize.width)
            self.position = $V([0, self.position.e(Y)]);
        if (self.position.e(Y) < 0)
            self.position = $V([self.position.e(X), self._screenSize.height]);
        else if (self.position.e(Y) > self._screenSize.width)
            self.position = $V([self.position.e(X), 0]);
    };

    this.toJSON = function () {
        if (!self._initialized) return;

        return {
            id: self.id,
            hp: self.hp,
            position: self.position,
            orientation: self.orientation
        };
    };
};