var cls = require('../lib/class'),
    Projectile = require('../projectile.js'),
    Constants = require('../constants'),
    Utils = require('../utils');

module.exports = Pistol = cls.Class.extend({
    init: function() {
        this.name = "Pistol";
        this.rateOfFire = 500;
        this.bulletSpeed = 15;
        this.damage = 7;
        this.projectileLife = 1000;
        this.projectileColor = "#ff9999";
        this.chanceToSpawn = 0;
        this._lastShot = 0;
    },
    
    shoot: function (player, ticks) {
        if (ticks - this._lastShot <= this.rateOfFire) return [];

        var velocity = $V([
            Math.cos(player.orientation - Constants.HALF_PI),
            Math.sin(player.orientation - Constants.HALF_PI)
        ]).toUnitVector().x(this.bulletSpeed);

        var projectile = new Projectile(player.id, player.position, velocity,
            this.damage, this.projectileLife, this.projectileColor);

        this._lastShot = ticks;
        return [projectile];
    }
});