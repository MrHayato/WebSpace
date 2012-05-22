var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Constants = require('./constants'),
    Entity = require('./entity'),
    Utils = require('./utils'),
    Pistol = require('./weapons/pistol');

module.exports = Player = Entity.extend({
    init: function(socket, server, name, screenSize) {
        var self = this;
        this.name = name;
        this.weapon = new Pistol();
        this.hp = 100;
        this.position = $V([
            Math.random() * screenSize.width,
            Math.random() * screenSize.height]);
        this.acceleration = $V([0,0]);
        this.orientation = Math.random() * Math.PI * 2;

        this._super(socket.id, this.position, this.orientation, this.acceleration, screenSize);

        this._movePressed = false;
        this._shootPressed = false;
        this._screenSize = screenSize;
        this._socket = socket;
        this._server = server;

        socket.on('move', function(message) {
            if (message.message === "down") {
                self.startMoving();
            } else if (message.message === "up") {
                self.stopMoving();
            } else {
                self.move(message.message);
            }
        });

        socket.on('fire', function(message) {
            if (message.message === "down") {
                self.startShooting();
            } else if (message.message === "up") {
                self.stopShooting();
            } else {
                self.aim(message.message);
            }
        });
    },

    startMoving: function() {
        this._movePressed = true;
    },

    startShooting: function() {
        this._shootPressed = true;
    },

    stopMoving: function() {
        this._movePressed = false;
    },

    stopShooting: function(){
        this._shootPressed = false;
    },

    aim: function(pos) {
        this.orientation = Utils.vectorToOrientation($V([pos.x, pos.y]));
    },

    move: function(pos) {
        var accel = $V([pos.x, pos.y]).x(Constants.INPUT_SCALE); // Scale down the thumb stick input

        this.aim(pos);

        if (Utils.vectorMagnitude(accel) > Constants.PLAYER_MAX_SPEED)
            accel = accel.toUnitVector().x(Constants.PLAYER_MAX_SPEED);

        this.acceleration = accel;
    },

    update: function () {
        if (!this._movePressed)
            this.acceleration = this.acceleration.x(Constants.PLAYER_FRICTION);

        if (this._shootPressed) {
            var shots = this.weapon.shoot(this);
            this._server.playerShot(shots);
        }

        this.weapon.update();

        this._super();
    },

    toJSON: function () {
        return {
            id: this.id,
            hp: this.hp,
            position: this.position,
            orientation: this.orientation
        };
    }
});
