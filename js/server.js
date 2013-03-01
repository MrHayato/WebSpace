var cls = require('./lib/class'),
    _ = require('underscore'),
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

    serverDisconnected: function (socket) {
        if (socket) {
            for (var i = this._sockets.length - 1; i >= 0; i--) {
                if (this._sockets[i].id === socket.id) {
                    delete this._sockets[i];
                }
            }
        }

        if (this._sockets.length === 0) {
            clearInterval(this._run);
            this.dropPlayers();
        }
    },

    dropPlayers: function (){
        for (var playerId in this._players) {
            this._players[playerId].emit('server-disconnect', null);
            this._players[playerId].disconnect();
        }
    },

    hasSocket: function (socket) {
        for (var i = 0; i < this._sockets.length; i++) {
            if (this._sockets[i].id === socket.id) {
                return true;
            }
        }

        return false;
    },

    playerJoined: function (name, team, socket) {
        var player = new Player(socket, this, name, team, this._screenSize);
        this._players[player.id] = player;
    },

    playerShot: function (shots) {
        for (var i = 0; i < shots.length; i++) {
            this._projectiles[shots[i].id] = shots[i];
        }
    },

    playerDisconnected: function (player) {
        if (player)
            player.takeDamage(10000);
    },

    getPopulation: function () {
        return Object.keys(this._players).length;
    },

    getTeams: function () {
        var teams = {};

        teams[Constants.TEAM_RED] = _.filter(this._players, function (player) { return player.team === Constants.TEAM_RED; });
        teams[Constants.TEAM_BLUE] = _.filter(this._players, function (player) { return player.team === Constants.TEAM_BLUE; });

        return teams;
    },

    kill: function () {
        this.dropPlayers();

        for (var i = 0; i < this._sockets.length; i++) {
            this._sockets[i].emit("kill", null);
        }
    },

    update: function() {
        if (this._sockets.length === 0) return;

        var updateEntities = [];
        var removeEntities = [];
        var ticks = new Date().getTime();

        //Call player update
        for (var playerId in this._players) {
            var player = this._players[playerId];
            player.update(ticks);
            updateEntities.push(player.toJSON());

            if (!player.isAlive())
                removeEntities.push(player.toJSON());
        }

        for (var projectileId in this._projectiles) {
            var projectile = this._projectiles[projectileId];
            projectile.update(ticks);
            updateEntities.push(projectile.toJSON());

            if (!projectile.isAlive())
                removeEntities.push(projectile.toJSON());
        }

        if (ticks >= this._nextUpdate) {
            for (var i = 0; i < removeEntities.length; i++) {
                switch (removeEntities[i].type) {
                    case "projectile":
                        delete this._projectiles[removeEntities[i].id];
                        break;
                    case "player":
                        delete this._players[removeEntities[i].id];
                        break;
                }
            }

            var update = [
                ticks,
                updateEntities,
                removeEntities
            ];

            for (var i = 0; i < this._sockets.length; i++) {
                if (this._sockets[i])
                    this._sockets[i].emit('update', update);
            }

            this._nextUpdate = ticks + Constants.SERVER_UPDATE_INTERVAL;
        }
    },

    run: function() {
        var self = this;
        self._run = setInterval(function() { self.update(); }, 1000/Constants.SERVER_FPS);
    }
});