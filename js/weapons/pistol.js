var Projectile = require('../projectile.js'),
    Constants = require('../constants'),
    Utils = require('../utils');

module.exports = function Pistol () {
    var self = this;
    this.name = "Pistol";
    this.rateOfFire = Utils.toTicks(400);
    this.bulletSpeed = 15;
    this.damage = 7;
    this.projectileLife = Utils.toTicks(1000);
    this.projectileColor = "#ff9999";
    this.chanceToSpawn = 0;

    this._cooldown = 0;

    this.shoot = function (player) {
        if (self._cooldown > 0) return [];

        var velocity = $V([
            Math.cos(player.orientation - Constants.HALF_PI),
            Math.sin(player.orientation - Constants.HALF_PI)
        ]).toUnitVector().x(self.bulletSpeed);

        var projectile = new Projectile(player.id, player.position, velocity,
            self.damage, self.projectileLife, self.projectileColor);

        self._cooldown = self.rateOfFire;
        return [projectile];
    };

    this.update = function () {
        if (self._cooldown > 0)
            self._cooldown--;
    };
};