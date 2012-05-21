var Player = require('./lib/player.js');

var players = {};

var FPS = 30;
var PORT = process.env.PORT || 8899;
var SESSION_SECRET = 'Some Secret Session';

var express = require('express');
var app = express.createServer();
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: SESSION_SECRET }));
app.use(express.static(__dirname + '/public'));
var io = require("socket.io").listen(app);

io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.disable("log");
});

/* Globals */
var screenSize = { width: 500, height: 500 };

/* Endpoints for the Web Controller */
app.get('/join', function (req, res) {
    res.render('register.jade', { layout: false });
});

app.post('/join', function (req, res) {
    var id = Object.keys(players).length + 1;

    var player = new Player(id, req.param('CharName'));

    players[id] = player;
    console.log("Added new player, " + id);
    res.render('controller.jade', { player: player, layout: false });
});

/* Endpoints for the Game Screen */
app.get('/', function (req, res) {
    res.render('game.jade', { layout: false });
});

app.listen(PORT);

/* Server Sockets */
var serverSockets = io
    .of('/server')
    .on('connection', function(socket) {
        var numConnections = Object.keys(serverSockets.sockets).length;
        console.log('Server connection: Total server connections: ' + numConnections);

        socket.on('init', function(settings) {
            console.log('Initializing game...');
            players = {};
            screenSize = settings.screenSize;
        });
    });

/* Client Sockets */
var playerSockets = io
    .of('/client')
    .on('connection', function(socket) {
        socket.on('init_player', function(id) {
            var player = players[id];
            var options = {
                screenSize: screenSize,
                socket: socket
            };

            if (player) {
                player.initialize(options);
            }

            console.log("Initialized player: " + id);
        });

        socket.on('move', function(message) {
            var player = players[message.id];

            if (!player) {
                console.log('Unable to find player with id ' + message.id);
                return;
            }

            if (message.message === "up") {
                player.stop();
            } else if (message.message === "down") {
                player.start();
            } else {
                player.move(message.message);
            }
        });
    });

setInterval(function() {
    var updateObj = [];

    //Call player update
    for (var playerId in players) {
        var player = players[playerId];

        if (player.initialized()) {
            player.update();
            updateObj.push(player.toJSON());
        }
    }

    serverSockets.emit('update', {
        players: updateObj
    });
}, 1000/FPS);
