var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Utils = require('./utils'),
    Constants = require('./constants');

module.exports = Entity = cls.Class.extend({
    init: function(id, position, initialVelocity, initialAcceleration, orientation, screenSize) {
        this.id = parseInt(id);
        this.position = position;
        this.velocity = initialVelocity;
        this.acceleration = initialAcceleration;
        this.orientation = orientation;
        this._lastTicks = new Date().getTime();
        this._screenSize = screenSize;
    },

    update: function (ticks) {
//        if (Utils.vectorMagnitude(this.velocity) < 1) {
//            this.velocity = $V([0,0]);
//            return;
//        }

        //calculate the velocity & position
        this.velocity = this.velocity.add(this.acceleration);

        if (Utils.vectorMagnitude(this.velocity) > Constants.PLAYER_MAX_VELOCITY) {
            this.velocity = this.velocity.toUnitVector().x(Constants.PLAYER_MAX_VELOCITY);
        }

        this.position = this.position.add(this.velocity);

        if (this._screenSize) {
            if (this.position.e(Constants.X) < 0) {
                this.position = $V([0, this.position.e(Constants.Y)]);
                this.velocity = $V([0, this.velocity.e(Constants.Y)]);
                this.acceleration = $V([0, this.acceleration.e(Constants.Y)]);
            } else if (this.position.e(Constants.X) > this._screenSize.width) {
                this.position = $V([this._screenSize.width, this.position.e(Constants.Y)]);
                this.velocity = $V([0, this.velocity.e(Constants.Y)]);
                this.acceleration = $V([0, this.acceleration.e(Constants.Y)]);
            }

            if (this.position.e(Constants.Y) < 0) {
                this.position = $V([this.position.e(Constants.X), 0]);
                this.velocity = $V([this.velocity.e(Constants.X), 0]);
                this.acceleration = $V([this.acceleration.e(Constants.X), 0]);
            } else if (this.position.e(Constants.Y) > this._screenSize.height) {
                this.position = $V([this.position.e(Constants.X), this._screenSize.height]);
                this.velocity = $V([this.velocity.e(Constants.X), 0]);
                this.acceleration = $V([this.acceleration.e(Constants.X), 0]);
            }
        }

        this._lastTicks = ticks;
    }
});
