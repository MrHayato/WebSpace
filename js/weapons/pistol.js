var cls = require('../lib/class'),
    Projectile = require('../projectile.js'),
    Constants = require('../constants'),
    Utils = require('../utils');

module.exports = Pistol = cls.Class.extend({
    init: function() {
        this.name = "Pistol";
        this.rateOfFire = Utils.toTicks(500);
        this.bulletSpeed = 15;
        this.damage = 7;
        this.projectileLife = Utils.toTicks(1000);
        this.projectileColor = "#ff9999";
        this.chanceToSpawn = 0;
        this._cooldown = 0;
    },
    
    shoot: function (player) {
        if (this._cooldown > 0) return [];

        var velocity = $V([
            Math.cos(player.orientation - Constants.HALF_PI),
            Math.sin(player.orientation - Constants.HALF_PI)
        ]).toUnitVector().x(this.bulletSpeed);

        var projectile = new Projectile(player.id, player.position, velocity,
            this.damage, this.projectileLife, this.projectileColor);

        this._cooldown = this.rateOfFire;
        return [projectile];
    },

    update: function () {
        if (this._cooldown > 0)
            this._cooldown--;
    }
});