var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Constants = require('./constants'),
    Entity = require('./entity'),
    Utils = require('./utils'),
    Pistol = require('./weapons/pistol');

module.exports = Player = Entity.extend({
    init: function(socket, server, name, team, screenSize) {
        var self = this;
        this.name = name;
        this.weapon = new Pistol();
        this.hp = 100;
        this.team = team;
        this.ready = false;

        var randomPos = $V([
            Math.random() * screenSize.width,
            Math.random() * screenSize.height]);

        this._super(socket.id, randomPos, $V([0,0]), $V([0,0]), Math.random() * Math.PI * 2, screenSize);

        this._movePressed = false;
        this._shootPressed = false;
        this._socket = socket;
        this._server = server;
        this._isAlive = true;

        socket.on('move', function(message) {
            if (message.message === "down") {
                self._movePressed = true;
            } else if (message.message === "up") {
                //self.acceleration = $V([0,0]);
                self._movePressed = false;
               self.acceleration = self.velocity.toUnitVector().x(-1 * Constants.PLAYER_FRICTION);
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

        socket.on('disconnect', function() {
            console.log(self.name + " disconnected");
            self.disconnect();
        });
    },

    startShooting: function() {
        this._shootPressed = true;
    },

    stopShooting: function(){
        this._shootPressed = false;
    },

    isAlive: function () {
        return this._isAlive;
    },

    aim: function(pos) {
        this.orientation = Utils.vectorToOrientation($V([pos.x, pos.y]));
    },

    move: function(pos) {
        var accel = $V([pos.x, pos.y]).toUnitVector().x(Constants.PLAYER_ACCELERATON);

        this.aim(pos);

        this.acceleration = accel;
    },

    takeDamage: function (damage) {
        this.hp -= damage;

        if (this.hp <= 0)
            this._isAlive = false;
    },

    kill: function () {
        this._socket.emit('kill');
    },

    disconnect: function () {
        this._server.playerDisconnected(this);
    },

    update: function (ticks) {
        if (!this._isAlive) return;

        if (!this._movePressed && Utils.vectorMagnitude(this.velocity) < 1) {
            this.velocity = $V([0,0]);
            this.acceleration = $V([0,0]);
        }

        if (this._shootPressed) {
            var shots = this.weapon.shoot(this, ticks);
            this._server.playerShot(shots);
        }

        this._super(ticks);
    },

    toJSON: function () {
        return {
            id: this.id,
            hp: this.hp,
            position: this.position,
            velocity: this.velocity,
            acceleration: this.acceleration,
            orientation: this.orientation,
            team: this.team,
            type: 'player'
        };
    }
});
