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

    run: function() {
        var self = this;

        setInterval(function() {
            var updatePlayers = {};
            var updateProjectiles = {};
            var removedProjectiles = [];

            //Call player update
            for (var playerId in self._players) {
                var player = self._players[playerId];
                player.update();
                updatePlayers[player.id] = player.toJSON();
            }

            for (var projectileId in self._projectiles) {
                var projectile = self._projectiles[projectileId];
                projectile.update();
                updateProjectiles[projectile.id] = projectile.toJSON();

                if (!projectile.isAlive())
                    removedProjectiles.push(projectileId);
            }

            for (var i = 0; i < removedProjectiles.length; i++)
                delete self._projectiles[removedProjectiles[i]];

            var update = Bison.encode({
                players: updatePlayers,
                projectiles: updateProjectiles,
                removedProjectiles: removedProjectiles
            });

            for (var i = 0; i < self._sockets.length; i++) {
                self._sockets[i].emit('update', update);
            }
        }, 1000/Constants.SERVER_FPS);
    }
});