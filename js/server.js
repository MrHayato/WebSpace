var cls = require('./lib/class'),
    Bison = require('bison'),
    Constants = require('./constants'),
    Player = require('./player');

module.exports = Server = cls.Class.extend({
    init: function (name, screenSize, socket) {
        this.id = parseInt(socket.id);
        this.name = name;

        this._players = {};
        this._projectiles = {};
        this._sockets = [socket];
        this._screenSize = screenSize;
        this._nextUpdate = new Date().getTime();
    },

    serverJoined: function (socket) {
        this._sockets.push(socket);
    },

    playerJoined: function (name, socket) {
        var player = new Player(socket, this, name, this._screenSize);
        this._players[player.id] = player;
    },

    playerShot: function (shots) {
        for (var i = 0; i < shots.length; i++) {
            this._projectiles[shots[i].id] = shots[i];
        }
    },

    update: function() {
        var updateEntities = [];
        var removeEntities = [];
        var ticks = new Date().getTime();

        //Call player update
        for (var playerId in this._players) {
            var player = this._players[playerId];
            player.update(ticks);
            updateEntities.push(player.toJSON());
        }

        for (var projectileId in this._projectiles) {
            var projectile = this._projectiles[projectileId];
            projectile.update(ticks);
            updateEntities.push(projectile.toJSON());

            if (!projectile.isAlive())
                removeEntities.push(projectileId);
        }

        if (ticks >= this._nextUpdate) {
            for (var i = 0; i < removeEntities.length; i++)
                delete this._projectiles[removeEntities[i]];

            var update = [
                ticks,
                updateEntities,
                removeEntities
            ];

            for (var i = 0; i < this._sockets.length; i++) {
                this._sockets[i].emit('update', update);
            }

            this._nextUpdate = ticks + Constants.SERVER_UPDATE_INTERVAL;
        }
    },

    run: function() {
        var self = this;
        setInterval(function() { self.update(); }, 1000/Constants.SERVER_FPS);
    }
});