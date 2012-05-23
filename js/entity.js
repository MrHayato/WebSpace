var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Utils = require('./utils'),
    Constants = require('./constants');

module.exports = Entity = cls.Class.extend({
    init: function(id, position, orientation, acceleration, screenSize) {
        this.id = parseInt(id);
        this.position = position;
        this.orientation = orientation;
        this.acceleration = acceleration;
        this._screenSize = screenSize;
    },

    update: function () {
        this.position = this.position.add(this.acceleration);

        //Screen wrapping
        if (this._screenSize) {
            if (this.position.e(Constants.X) < 0)
                this.position = $V([this._screenSize.width, this.position.e(Constants.Y)]);
            else if (this.position.e(Constants.X) > this._screenSize.width)
                this.position = $V([0, this.position.e(Constants.Y)]);
            if (this.position.e(Constants.Y) < 0)
                this.position = $V([this.position.e(Constants.X), this._screenSize.height]);
            else if (this.position.e(Constants.Y) > this._screenSize.height)
                this.position = $V([this.position.e(Constants.X), 0]);
        }
    }
});
