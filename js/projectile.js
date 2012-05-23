var cls = require('./lib/class'),
    Sylvester = require('sylvester'),
    Constants = require('./constants'),
    Entity = require('./entity'),
    Pistol = require('./weapons/pistol');

module.exports = Projectile = Entity.extend({
    init: function (owner, position, acceleration, damage, life, color) {
        this.id = new Date().getTime();
        this.owner = owner;
        this.damage = damage;
        this.color = color;
        this._currentLife = life;
        this._isAlive = true;

        this._super(this.id, position, 0, acceleration);
    },

    isAlive: function() {
        return this._isAlive;
    },
    
    update: function() {
        if (!this._isAlive) return;

        if (this._currentLife > 0) {
            this._currentLife--;
        } else {
            this._isAlive = false;
        }

        this._super();
    },
  
    toJSON: function () {
        return {
            position: this.position,
            color: this.color
        };
    }    
});