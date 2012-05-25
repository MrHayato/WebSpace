var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Constants = require('./constants'),
    Entity = require('./entity'),
    Pistol = require('./weapons/pistol');

module.exports = Projectile = Entity.extend({
    init: function (owner, position, initialVelocity, damage, life, color) {
        this.id = new Date().getTime();
        this.owner = owner;
        this.damage = damage;
        this.color = color;
        this.life = life;
        this._spawnTime = new Date().getTime();
        this._isAlive = true;

        this._super(this.id, position, initialVelocity, $V([0,0]), 0);
    },

    isAlive: function() {
        return this._isAlive;
    },
    
    update: function(ticks) {
        if (!this._isAlive) return;

        if (ticks - this._spawnTime > this.life) {
            this._isAlive = false;
        }

        this._super(ticks);
    },
  
    toJSON: function () {
        return {
            id: this.id,
            position: this.position,
            velocity: this.velocity,
            acceleration: this.acceleration,
            orientation: 0,
            color: this.color,
            type: 'projectile'
        };
    }    
});